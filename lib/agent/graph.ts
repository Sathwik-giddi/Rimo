import {
  StateGraph,
  START,
  END,
  type LangGraphRunnableConfig,
} from "@langchain/langgraph";
import { AgentState, type AgentStateType } from "./state";
import { reasoningLLM, fastLLM } from "./llm";
import { searchWeb } from "./search";
import {
  ResearchPlanSchema,
  AnalysisSchema,
  VerdictNarrativeSchema,
  type EvidenceGroup,
  type Source,
  type Verdict,
} from "./schemas";
import type { AgentEvent } from "./events";
import { jsonSchemaHint } from "./structured";
import { CATEGORIES, compositeScore, deriveVerdict } from "./framework";

/**
 * The agent graph: Plan → Research → (Deepen?) → Analyze → Decide.
 *
 * A LangGraph state machine (not a linear chain) so each step is explicit,
 * inspectable and streamable. Every node emits typed progress events through
 * `config.writer`, which the API route forwards to the UI as the live trace.
 *
 * Two design goals beyond the happy path:
 *  - Works for SMALL/obscure companies, not just famous ones → adaptive queries
 *    plus a "deepen if thin" research pass.
 *  - Never falsely confident → data quality caps conviction, and the Invest/Hold/
 *    Pass decision is a transparent weighted-score rule (see framework.ts).
 */

// Emit a trace event to the UI (no-op if the run isn't streaming custom events).
function emitter(config: LangGraphRunnableConfig) {
  return (event: AgentEvent) => {
    try {
      config.writer?.(event);
    } catch {
      /* streaming is best-effort; never let it break the run */
    }
  };
}

// Flatten the gathered evidence into a numbered, citable block for the LLM.
// We cap sources-per-question and truncate each snippet: Tavily snippets are short
// already, and trimming keeps us well under Groq's free-tier token-per-minute limit
// while still giving the analyst enough signal.
const MAX_SOURCES_PER_Q = 1;
const MAX_SNIPPET_CHARS = 150;
// Hard cap on total sources fed to the analyst. The deepen loop re-analyzes with
// BOTH passes of evidence, so without a global cap an obscure-company run can spike
// past Groq's per-minute token limit. We still list every question (so the model
// sees what was searched) but stop attaching sources once the cap is reached.
const MAX_TOTAL_SOURCES = 14;

function formatEvidence(groups: EvidenceGroup[]): string {
  if (groups.length === 0) return "No evidence was retrieved.";
  let n = 0;
  return groups
    .map((g) => {
      const top = [...g.sources].sort((a, b) => b.score - a.score).slice(0, MAX_SOURCES_PER_Q);
      const lines: string[] = [];
      for (const s of top) {
        if (n >= MAX_TOTAL_SOURCES) break;
        lines.push(`  [${++n}] ${s.title}\n      ${s.url}\n      ${s.content.slice(0, MAX_SNIPPET_CHARS)}`);
      }
      return `Q: ${g.question}\n${lines.join("\n") || "  (no results)"}`;
    })
    .join("\n\n");
}

// Run a batch of searches concurrently, streaming a start/done event for each.
async function runSearches(
  questions: string[],
  emit: ReturnType<typeof emitter>,
  topic: "general" | "news" | "finance" = "general"
): Promise<EvidenceGroup[]> {
  return Promise.all(
    questions.map(async (question): Promise<EvidenceGroup> => {
      emit({ type: "search-start", query: question });
      const sources: Source[] = await searchWeb(question, { maxResults: 4, topic });
      emit({ type: "search-done", query: question, count: sources.length });
      return { question, sources };
    })
  );
}

// ── Node 1: Plan ─────────────────────────────────────────────────────────────
const PLAN_SYSTEM = `You are a sharp investment research analyst planning how to research a company.
Produce 4-6 specific, web-searchable questions that would let you judge whether to invest.

Cover these angles: what the company does & how it makes money; financial health / traction /
funding; competitive moat & market position; industry & regulatory context; management/leadership;
and key risks & recent news.

IMPORTANT — the company may be small, private, or little-known, NOT a famous public company.
Do not assume audited financials or a stock listing exist. For lesser-known names, also probe where
small-company signal actually lives: founders & leadership, funding/investors, what customers say,
and any controversies. Always include the company name in each question.`;

async function planNode(state: AgentStateType, config: LangGraphRunnableConfig) {
  const emit = emitter(config);
  emit({ type: "node-start", node: "plan", label: `Planning research for "${state.company}"` });

  // temperature 0 → reproducible questions → stable evidence → stable verdict
  const llm = fastLLM(0).withStructuredOutput(ResearchPlanSchema, {
    name: "research_plan", method: "jsonMode",  });
  const plan = await llm.invoke([
    { role: "system", content: `${PLAN_SYSTEM}\n\n${jsonSchemaHint(ResearchPlanSchema, "research_plan")}` },
    { role: "user", content: `Company: ${state.company}` },
  ]);

  emit({ type: "plan", plan });
  emit({ type: "node-end", node: "plan" });
  return { plan };
}

// ── Node 2: Research ─────────────────────────────────────────────────────────
async function researchNode(state: AgentStateType, config: LangGraphRunnableConfig) {
  const emit = emitter(config);
  emit({ type: "node-start", node: "research", label: "Researching the live web" });

  const questions = state.plan?.questions?.length
    ? state.plan.questions
    : [`${state.company} company overview business model`];

  const groups = await runSearches(questions, emit);

  emit({ type: "evidence", evidence: groups });
  emit({ type: "node-end", node: "research" });
  return { evidence: groups };
}

// ── Node 2b: Deepen (only runs when the first pass found little) ──────────────
// Reformulate around where small/obscure-company information tends to surface, so
// we give lesser-known names a fair shot before judging them.
async function deepenNode(state: AgentStateType, config: LangGraphRunnableConfig) {
  const emit = emitter(config);
  emit({
    type: "node-start",
    node: "research",
    label: "Limited public data — digging deeper",
  });

  const c = state.company;
  // Kept lean (3 high-signal angles) so the re-analysis after deepening stays within
  // the per-minute token budget.
  const broaderQueries = [
    `${c} founders funding investors`,
    `what does "${c}" do products services customers`,
    `${c} news OR reviews OR controversy`,
  ];

  const groups = await runSearches(broaderQueries, emit, "news");

  // Prevent hitting the Groq 70B per-minute free tier limit by pacing the second pass
  emit({
    type: "node-start",
    node: "analyze",
    label: "Pacing rate limit (25s cooldown)...",
  });
  await new Promise((resolve) => setTimeout(resolve, 25000));

  emit({ type: "evidence", evidence: groups });
  emit({ type: "node-end", node: "research" });
  return { evidence: groups, deepened: true };
}

// Conditional router (runs AFTER analysis): if the analyst judged the evidence
// 'low' quality and we haven't already deepened, loop back to gather more before
// committing to a verdict — a reflect-and-retry. Otherwise, decide.
// (We route on the analyst's judgment, not raw source count, because the web search
// always returns *some* padded results even for obscure names.)
function routeAfterAnalysis(state: AgentStateType): "deepen" | "decide" {
  // If the name isn't a real company, don't bother deepening — go straight to decide,
  // which short-circuits to a "not found" result.
  if (state.analysis && !state.analysis.companyIdentified) return "decide";
  const lowData = state.analysis?.dataQuality === "low";
  return lowData && !state.deepened ? "deepen" : "decide";
}

// ── Node 3: Analyze ──────────────────────────────────────────────────────────
const CATEGORY_GUIDE = CATEGORIES.map((c) => `- ${c.name}: ${c.focus}`).join("\n");

const ANALYZE_SYSTEM = `You are an investment analyst. Using ONLY the evidence provided (never invent
facts), score the company on each of these fixed categories from 0-10, with a short evidence-based
rationale for each:

${CATEGORY_GUIDE}

Rules:
- FIRST decide companyIdentified: set it TRUE only if the evidence actually describes a real,
  identifiable company/organization with this (or a clearly equivalent) name. Set it FALSE if the
  name looks like gibberish / a random string / a typo, or if no source genuinely describes such a
  company. If FALSE, do NOT fabricate scores or facts — score conservatively and keep rationales honest.
- Base every score strictly on the evidence. If a category has little or no evidence, score it
  conservatively (around 4-5) and SAY that the evidence was missing — do not guess.
- Set dataQuality honestly: 'low' for small/obscure companies where you found little reliable info,
  'high' only when evidence was rich and consistent.
- Finish with a concise synthesis of the investment picture.`;

async function analyzeNode(state: AgentStateType, config: LangGraphRunnableConfig) {
  const emit = emitter(config);
  emit({ type: "node-start", node: "analyze", label: "Analyzing the evidence" });

  // temperature 0 so the same evidence yields the same scores → a stable, reproducible
  // verdict (no more "same score, different decision" across repeat runs).
  const llm = reasoningLLM(0).withStructuredOutput(AnalysisSchema, {
    name: "analysis", method: "jsonMode",  });
  const raw = await llm.invoke([
    { role: "system", content: `${ANALYZE_SYSTEM}\n\n${jsonSchemaHint(AnalysisSchema, "analysis")}` },
    {
      role: "user",
      content: `Company: ${state.company}\n\nEvidence gathered:\n${formatEvidence(state.evidence)}`,
    },
  ]);

  // Guard: the model can repeat a category — keep one score per category so the
  // weighted composite isn't skewed and the UI doesn't render duplicate rows.
  const seen = new Set<string>();
  const dimensions = raw.dimensions.filter((d) => {
    if (seen.has(d.name)) return false;
    seen.add(d.name);
    return true;
  });
  const analysis = { ...raw, dimensions };

  emit({ type: "analysis", analysis });
  emit({ type: "node-end", node: "analyze" });
  return { analysis };
}

// ── Node 4: Decide ───────────────────────────────────────────────────────────
// The decision + conviction are computed deterministically from the weighted score
// and data quality; the LLM only writes the narrative to match. This keeps the actual
// call transparent and consistent.
const DECIDE_SYSTEM = `You are a decisive investment partner writing up a verdict that has ALREADY
been decided by a weighted scoring model. Write the narrative to match the given decision and
conviction — do not contradict them. Provide:
- a 2-4 sentence thesis in plain English, leading with the "why";
- the strongest bull case and bear case;
- the key risks to monitor.
Be direct, warm and outcome-focused. If conviction is low because data was limited, say so plainly
rather than overstating — honesty about what we couldn't verify is part of the job.`;

async function decideNode(state: AgentStateType, config: LangGraphRunnableConfig) {
  const emit = emitter(config);
  emit({ type: "node-start", node: "decide", label: "Reaching a verdict" });

  // 0) Not a real company → don't fabricate a verdict. Tell the user honestly.
  if (state.analysis && !state.analysis.companyIdentified) {
    emit({
      type: "notfound",
      company: state.company,
      message: `We couldn't find a real company called "${state.company}". Please check the spelling or try a different company name.`,
    });
    emit({ type: "node-end", node: "decide" });
    return {};
  }

  // 1) Deterministic decision: weighted composite → threshold, capped by data quality.
  const dims = state.analysis?.dimensions ?? [];
  const dataQuality = state.analysis?.dataQuality ?? "low";
  const composite = compositeScore(dims);
  const { decision, conviction } = deriveVerdict(composite, dataQuality);

  // 2) LLM writes the narrative to match the computed call. The decision itself is
  // already decided in code, so the fast model is enough here — saving the heavier
  // model's limited daily quota for the analysis step that actually needs reasoning.
  const llm = fastLLM(0.3).withStructuredOutput(VerdictNarrativeSchema, {
    name: "verdict_narrative", method: "jsonMode",  });
  const narrative = await llm.invoke([
    { role: "system", content: `${DECIDE_SYSTEM}\n\n${jsonSchemaHint(VerdictNarrativeSchema, "verdict_narrative")}` },
    {
      role: "user",
      content:
        `Company: ${state.company}\n` +
        `Decision (final): ${decision}\n` +
        `Conviction (final): ${conviction}/100\n` +
        `Weighted score: ${composite.toFixed(1)}/10 · Data quality: ${dataQuality}\n\n` +
        `Category scores & analysis:\n${JSON.stringify(state.analysis, null, 2)}`,
    },
  ]);

  const verdict: Verdict = {
    decision,
    conviction,
    composite: Number(composite.toFixed(1)),
    ...narrative,
  };

  emit({ type: "verdict", verdict });
  emit({ type: "node-end", node: "decide" });
  return { verdict };
}

// ── Wire the graph ───────────────────────────────────────────────────────────
// Node names are suffixed so they never collide with state channel names
// (LangGraph forbids a node and a channel sharing a name — e.g. the `plan` channel).
const workflow = new StateGraph(AgentState)
  .addNode("planStep", planNode)
  .addNode("researchStep", researchNode)
  .addNode("deepenStep", deepenNode)
  .addNode("analyzeStep", analyzeNode)
  .addNode("decideStep", decideNode)
  .addEdge(START, "planStep")
  .addEdge("planStep", "researchStep")
  .addEdge("researchStep", "analyzeStep")
  // After analysis: deepen (re-research, then re-analyze) if data was thin, else decide.
  .addConditionalEdges("analyzeStep", routeAfterAnalysis, {
    deepen: "deepenStep",
    decide: "decideStep",
  })
  .addEdge("deepenStep", "analyzeStep")
  .addEdge("decideStep", END);

export const agentGraph = workflow.compile();
