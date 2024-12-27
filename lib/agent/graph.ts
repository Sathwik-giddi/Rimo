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
const MAX_SOURCES_PER_Q = 3;
const MAX_SNIPPET_CHARS = 320;

function formatEvidence(groups: EvidenceGroup[]): string {
  if (groups.length === 0) return "No evidence was retrieved.";
  let n = 0;
  return groups
    .map((g) => {
      const items = [...g.sources]
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_SOURCES_PER_Q)
        .map((s) => {
          const snippet = s.content.slice(0, MAX_SNIPPET_CHARS);
          return `  [${++n}] ${s.title}\n      ${s.url}\n      ${snippet}`;
        })
        .join("\n");
      return `Q: ${g.question}\n${items || "  (no results)"}`;
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
    name: "research_plan",
    method: "jsonMode",
  });
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
  const broaderQueries = [
    `${c} founders leadership team background`,
    `${c} funding investors valuation`,
    `${c} customers reviews reputation`,
    `${c} news OR controversy OR lawsuit`,
    `what does "${c}" do products services`,
  ];

  const groups = await runSearches(broaderQueries, emit, "news");

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
    name: "analysis",
    method: "jsonMode",
  });
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

  // 1) Deterministic decision: weighted composite → threshold, capped by data quality.
  const dims = state.analysis?.dimensions ?? [];
  const dataQuality = state.analysis?.dataQuality ?? "low";
  const composite = compositeScore(dims);
  const { decision, conviction } = deriveVerdict(composite, dataQuality);

  // 2) LLM writes the narrative to match the computed call. The decision itself is
  // already decided in code, so the fast model is enough here — saving the heavier
  // model's limited daily quota for the analysis step that actually needs reasoning.
  const llm = fastLLM(0.3).withStructuredOutput(VerdictNarrativeSchema, {
    name: "verdict_narrative",
    method: "jsonMode",
  });
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
