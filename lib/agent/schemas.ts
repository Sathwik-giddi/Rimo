import { z } from "zod";
import { CATEGORY_NAMES } from "./framework";

/**
 * Schemas = the contract for every structured LLM output in the agent.
 *
 * We force the model to return data in *these exact shapes* (via
 * `llm.withStructuredOutput(schema)`), so the rest of the app can rely on typed,
 * validated objects instead of parsing free text. This is the backbone of the
 * "decide, don't dump" principle: the model must commit to a decision + reasons.
 */

// ── Step 1: the research plan ────────────────────────────────────────────────
export const ResearchPlanSchema = z.object({
  strategy: z
    .string()
    .describe(
      "One or two sentences on how you will research this company and what matters most for an investment view."
    ),
  questions: z
    .array(z.string())
    .min(3)
    .max(6)
    .describe(
      "3-6 specific, web-searchable research questions. Cover: what the company does & its moat; financials/traction/funding; market size & competition; recent news (last 12 months); and key risks."
    ),
});
export type ResearchPlan = z.infer<typeof ResearchPlanSchema>;

// ── Step 3: the multi-dimension analysis ─────────────────────────────────────
// The agent scores the company on the FIXED framework categories (see framework.ts),
// so scoring is consistent and the weighting is a transparent rule rather than a whim.
export const DimensionSchema = z.object({
  name: z
    .enum(CATEGORY_NAMES)
    .describe("Which framework category this score is for (use the exact category name)."),
  score: z
    .number()
    .min(0)
    .max(10)
    .describe(
      "Score 0-10 for this category per the scoring rubric, justified ONLY by the gathered evidence. Score LOW (0-2) for serious red flags (losses, cash burn, heavy debt, bankruptcy, fraud, scandal); do NOT inflate a famous name. If evidence is thin, score around 5 and say so."
    ),
  rationale: z
    .string()
    .describe(
      "2-3 sentences justifying the score from concrete evidence. If evidence was missing, state that explicitly."
    ),
});

export const AnalysisSchema = z.object({
  dimensions: z
    .array(DimensionSchema)
    .describe("One entry per framework category you can assess (aim to cover all of them)."),
  dataQuality: z
    .enum(["high", "medium", "low"])
    .describe(
      "Honest rating of how much reliable, relevant evidence was actually found. Use 'low' for small/obscure companies with little public information."
    ),
  companyIdentified: z
    .boolean()
    .describe(
      "TRUE only if the evidence actually describes a real, identifiable company or organization with this (or a clearly equivalent) name. Set FALSE if the name looks like gibberish / a random string / a typo, or if no source genuinely describes such a company — in that case do NOT invent any details."
    ),
  summary: z
    .string()
    .describe("A concise synthesis of what the evidence says about this company as an investment."),
});
export type Analysis = z.infer<typeof AnalysisSchema>;
export type Dimension = z.infer<typeof DimensionSchema>;

// ── Step 4: the verdict ──────────────────────────────────────────────────────
// The LLM writes the *narrative* (thesis + cases + risks). The decision and the
// conviction are computed deterministically from the weighted score + data quality
// (see framework.ts) — so the actual call is an explainable rule, not a black box.
export const VerdictNarrativeSchema = z.object({
  thesis: z
    .string()
    .describe("2-4 sentence plain-English thesis a human can act on. Lead with the 'why'."),
  bullCase: z.array(z.string()).min(1).describe("The strongest reasons FOR investing."),
  bearCase: z.array(z.string()).min(1).describe("The strongest reasons AGAINST / for caution."),
  keyRisks: z.array(z.string()).describe("The most important risks to monitor."),
});
export type VerdictNarrative = z.infer<typeof VerdictNarrativeSchema>;

// The full verdict object surfaced to the UI = computed decision + LLM narrative.
export type Verdict = VerdictNarrative & {
  decision: "INVEST" | "HOLD" | "PASS";
  conviction: number; // 0-100
  composite: number; // 0-10 weighted score
};

// ── Evidence (output of the research step) ───────────────────────────────────
export type Source = {
  title: string;
  url: string;
  content: string;
  score: number;
};

export type EvidenceGroup = {
  question: string;
  sources: Source[];
};
