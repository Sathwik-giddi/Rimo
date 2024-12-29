/**
 * The analysis framework: the fixed categories the agent scores every company on,
 * each with an explicit importance weight. Keeping the categories + weights in code
 * (not chosen ad-hoc by the LLM) makes the decision transparent and defensible:
 * the LLM scores the evidence, the *weighting and the Invest/Hold/Pass threshold are
 * deterministic rules* you can point to and explain.
 *
 * Categories mirror a real fundamental-analysis checklist, but only the parts that
 * web research can support for ANY company (incl. small/private ones). Hard-number
 * lenses that need market-data feeds (valuation multiples, ownership/short interest)
 * are folded into Financial Health on a best-effort basis rather than given their own
 * category, because they don't exist for the small companies we deliberately support.
 */
export const CATEGORIES = [
  {
    name: "Business Fundamentals",
    weight: 1.0,
    focus:
      "what the company does; products/services; how it makes money (business model); revenue mix; customer concentration; recurring vs one-time revenue.",
  },
  {
    name: "Financial Health",
    weight: 1.2,
    focus:
      "revenue growth and margins; profitability and cash flow; debt and liquidity; any valuation signal if available. Judge trends over time where evidence allows.",
  },
  {
    name: "Competitive Moat",
    weight: 1.1,
    focus:
      "market share; brand strength; switching costs; network effects; patents/IP; durable cost advantages.",
  },
  {
    name: "Industry & Macro",
    weight: 0.9,
    focus:
      "industry growth or decline; regulatory environment; disruption threats; sensitivity to the economic cycle.",
  },
  {
    name: "Management & Governance",
    weight: 0.8,
    focus:
      "leadership track record; founder/insider ownership (skin in the game); capital-allocation history; governance red flags.",
  },
  {
    name: "Growth Catalysts & Risks",
    weight: 1.0,
    focus:
      "upside drivers (new products, expansion, margin gains) weighed against downside risks (litigation, debt maturities, customer/key-person concentration).",
  },
] as const;

export type CategoryName = (typeof CATEGORIES)[number]["name"];

// Short labels for compact UI (e.g. radar-chart axes).
export const SHORT_LABELS: Record<CategoryName, string> = {
  "Business Fundamentals": "Business",
  "Financial Health": "Financial",
  "Competitive Moat": "Moat",
  "Industry & Macro": "Industry",
  "Management & Governance": "Management",
  "Growth Catalysts & Risks": "Catalysts",
};

// A non-empty tuple of the names, for building a Zod enum.
export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name) as [
  CategoryName,
  ...CategoryName[],
];

const WEIGHTS = new Map<string, number>(CATEGORIES.map((c) => [c.name, c.weight]));

/** Weighted average of the per-category scores → a single 0-10 composite. */
export function compositeScore(
  dimensions: { name: string; score: number }[]
): number {
  let weighted = 0;
  let total = 0;
  for (const d of dimensions) {
    const w = WEIGHTS.get(d.name) ?? 1;
    weighted += d.score * w;
    total += w;
  }
  return total > 0 ? weighted / total : 0;
}

/**
 * The explicit decision rule. Map the composite to a verdict via fixed thresholds,
 * then size conviction by (a) how decisive the score is and (b) how good the evidence
 * was — low data quality HARD-CAPS conviction so the agent is never falsely confident
 * about a company it could barely research.
 */
export function deriveVerdict(
  composite: number,
  dataQuality: "high" | "medium" | "low"
): { decision: "INVEST" | "HOLD" | "PASS"; conviction: number } {
  const decision =
    composite >= 7.0 ? "INVEST" : composite >= 5.5 ? "HOLD" : "PASS";

  // Distance from the neutral midpoint (5.5) → how decisive the call is (0..1).
  const decisiveness = Math.min(Math.abs(composite - 5.5) / 4.5, 1);
  const raw = 50 + decisiveness * 45; // 50..95

  const cap = dataQuality === "high" ? 95 : dataQuality === "medium" ? 72 : 45;
  const conviction = Math.round(Math.min(raw, cap));

  return { decision, conviction };
}
