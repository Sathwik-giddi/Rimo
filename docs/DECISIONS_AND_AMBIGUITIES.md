# Key Decisions, Trade-offs & Ambiguity Calls

> Running log that feeds the README's **"Key decisions & trade-offs"** section. The assignment
> says: *"If anything is ambiguous, make your own call and note it in the README."* This is where
> we record those calls and the reasoning, as we make them — so every choice is defensible.

## Locked constraints (from the assignment — not decisions, requirements)
- **Framework:** AI layer **must** be LangChain.js / LangGraph.js. (Stated: "please build with it.")
- **Language/stack:** React or Next.js (FE) · Node or Next.js (BE). JS/TS only.
- **Output contract:** must produce a **binary Invest/Pass decision + explicit reasoning.**
- **Input contract:** must accept a **company name** (free text, not a ticker).
- **Submission:** zip + README (7 sections) + **full LLM transcript** (bonus).
- **Bonus:** deploy online (Vercel) and share the link.
- **Ground rule:** strictly solo, original, must be explainable in a 3-round technical interview.

## Ambiguities & our calls (provisional — confirm as we build)
| # | Ambiguity | Call | Why |
|---|-----------|------|-----|
| 1 | What kind of "company"? | Accept **any** company name; agent researches what it can and **states confidence + data gaps**. | More robust, more honest; mirrors a real analyst handling unknowns. |
| 2 | What counts as "research"? | **Live web research** (+ optional financial signals), with **cited sources**, never silent. | "Research" implies going to get info, not reciting LLM memory. Citations = trust. |
| 3 | Invest/Pass only, or a middle ground? | Force a **clear verdict** (Invest / Pass) + **conviction score** + **bull/bear case**. | Decisive *and* honest; matches the company's "confident reasoned recommendation" pattern. |
| 4 | Timeline | Deadline **29 Jun 9 AM**; ~1 day left → ship a **working, deployed, explainable core** first; document the rest under "what I'd improve." | Reliability + explainability beat feature count for this grade. |

## Decisions locked (Session 2)
- [x] **LLM provider → Groq** (free tier, fast). Default models: **Llama 3.3 70B Versatile**
      for analysis/decision (strong reasoning), **Llama 3.1 8B Instant** for cheap planning steps.
      Wired via LangChain's `ChatGroq` so the provider is a one-line swap. *Why:* zero cost, no
      card, good reasoning, keeps us inside the LangChain.js requirement cleanly.

- [x] **Search/data source → Tavily web search.** *Why (3 nested decisions):*
      (1) The agent must *research*, and an LLM alone is stale/unverifiable/hallucination-prone —
      unacceptable for an investment call → it needs a live external source.
      (2) **Web search over a financial-data API** because the input is a free-text company name
      (may be private / non-US); a stock API returns nothing for most, web search covers *any*
      company + the qualitative signal that drives a thesis.
      (3) **Tavily over Google/Bing/Exa/Brave** because it's agent-native, has a **native LangChain
      integration** (stays inside the required framework), returns **citations out of the box**
      (our transparency edge over Ayana), and is **free**.
      *Live-verified free tiers (Jun 2026):* **Tavily 1,000 credits/mo, no card** (basic=1, adv=2,
      no rollover); **Exa 1,000 req/mo free** (quality alternative, paid $7/1k); **Brave killed its
      free tier Feb 2026** (now metered). So Tavily & Exa are the only clean free options; Tavily
      wins on balance, **Exa noted as the upgrade path** if source depth mattered more.
      *Trade-offs owned:* extra key+dependency (mitigated: free, documented, **degrades gracefully**
      if missing); returns snippets not full filings (→ "improve with more time": add 10-K ingestion);
      depends on an external service (acceptable for a 7-day prototype).

- [x] **Cover small/obscure companies, not just famous ones** (explicit product goal). *Implications:*
      a **financial-data API was rejected** for the core (it only has data for large public companies —
      it would fail exactly the small companies we want to serve). Web search stays the universal
      backbone. To serve small companies well we added: adaptive planning (probe founders/funding/
      reviews), a **reflect-and-retry "deepen" loop** (if the analyst rates data `low`, re-research
      broader then re-analyze), and **honest uncertainty** (data quality hard-caps conviction; a
      no-data company gets an honest PASS at ~45 conviction, not a hallucinated verdict).
- [x] **Decision = transparent weighted rule, not an LLM whim.** Six fixed framework categories with
      explicit weights → weighted composite (0-10) → fixed thresholds → INVEST/HOLD/PASS; conviction
      sized by decisiveness and capped by data quality. The LLM scores evidence + writes the narrative;
      the *call itself* is deterministic and explainable. *Trade-off:* a linear weighted model is
      simpler than real investing — noted as "improve with more time" (let the LLM override with
      justification, tune weights empirically).
- [x] **Valuation multiples & sentiment/ownership lenses folded in / deferred** — they need market-data
      feeds that don't exist for small private companies, so they're best-effort within Financial Health
      rather than dedicated categories. Documented as a known limitation.

## Decisions locked (Session 3)
- [x] **Agent topology in LangGraph:** Formulated as a clean, sequential state machine of four nodes: `planStep` → `researchStep` → `analyzeStep` → `decideStep`. We stream custom transition events from the writer config to the client UI to show the agent's research progress in real-time.
- [x] **App shape:** Set up as a single, unified Next.js App Router workspace with standard API route handlers (`/api/research`) streaming Server-Sent Events (SSE). This allows a lightweight, single-command production build and one-click Vercel hosting.
- [x] **UI/design language:** Implemented a terminal-inspired flat design with solid panels (`#121214`), dark mode backgrounds (`#09090b`), and a strict, high-contrast monochrome base with a single vermilion accent color. Removed all radial space gradients, neon borders, and blurs to ground the visual experience.

## Decisions locked (Session 4 — Customizations & Visual Polish)
- [x] **Primary accent color selection → Blazing Red-Orange (#df2514 / RGB 223, 37, 20).** *Why:* Transitioned to a hotter red-orange/scarlet shade requested by the user. Programmatically updated all styling constants, progress bar fills, glows, and score badges, and ran a Pillow script to shift the hue of the favicon (`app/icon.png`) and logo (`public/logo.png`) to preserve consistency.
- [x] **Equal column height layout.** *Why:* Rather than letting columns hang as uneven blocks, both sidebar and main report columns are configured as `flex flex-col gap-6` with the bottom components (`Sources` and `Dimensions`) using `flex-1`. This guarantees both columns stretch to align their bottom borders perfectly.
- [x] **Vertical-flow sources grid.** *Why:* Configured the sources grid to use `grid-flow-col` combined with dynamic `gridTemplateRows: repeat(rowCount, minmax(0, auto))` instead of standard left-to-right grid flow. This flows source badges vertically down the columns (1, 2, 3...) for natural reading, keeping the badge widths perfectly uniform using a strict 2-column structure.
- [x] **Radar chart SVG bounds adjustment.** *Why:* Enlarged the SVG canvas size (`viewBox="0 0 380 280"`) and shifted center coordinates (`CX=190`, `CY=140`) to add sufficient safety padding, preventing browsers from clipping long text labels (e.g. "Management") near the edges.

## Decisions locked (Session 5 — Reliability & transparency)
- [x] **Models are env-configurable (`GROQ_REASONING_MODEL` / `GROQ_FAST_MODEL`).** Default: 70B for
      analysis (quality), 8B for plan/decide (the decision is computed in code, so the narrative
      doesn't need 70B). *Why it matters:* each Groq model has an **independent daily token bucket**,
      so when 70B's free bucket is exhausted you can drop analysis to 8B (fresh bucket) without code
      changes. Clean **quality-vs-throughput** trade-off; documented.
- [x] **Graceful rate-limit handling.** `humanizeError()` distinguishes per-minute (TPM → wait
      seconds) from per-day (TPD → resets ~24h) and renders a human message, never raw JSON.
      `ChatGroq` uses `maxRetries: 5` so transient per-minute spikes recover silently. Evidence is
      trimmed (top-3 sources/question, 320-char snippets) to stay within the free TPM.
- [x] **Under-the-hood shown in-product.** Added a collapsible "How Altair decided" panel so the
      result itself explains the pipeline, the weighted factors, the threshold rule, and the
      conviction cap — covering the brief's "what it researches / how it works / how it shows results"
      directly in the report, not only the README.

## Decisions locked (Session 6 — Reproducibility)
- [x] **Deterministic scoring (temperature 0 for plan + analyze).** Symptom: the same company
      (e.g. OpenAI) could show the *same* displayed weighted score (6.5) but flip INVEST↔HOLD across
      runs — because the real composite wiggled across the 6.5 threshold due to LLM temperature, and
      the UI rounds to 1 decimal. Fix: plan + analyze run at **temp 0** so identical evidence yields
      identical scores → a stable, reproducible verdict. The **decide** step keeps temp 0.3 for
      natural wording (the verdict is computed from scores, not prose, so it's unaffected).
      *Trade-off owned (reproducibility vs. freshness):* live web data can still change over time and
      Groq isn't bit-deterministic, so tiny wiggles remain — but the jarring "same score, opposite
      verdict" is gone. Genuinely borderline companies (score ~ a threshold) are inherently close
      calls; a future "borderline" label could surface that honestly.

## Known gaps & guardrails to add (Session 7 — for "What I'd improve")
*Context: a strict 6-factor schema pressures the model to emit a score per factor even with no data —
the hallucination risk on obscure/unlisted startups at scale.*
- **Today (mitigations, not proof):** prompt gives a non-fabricating out (score ~4–5 + "evidence
  missing", never invent); model self-rates `dataQuality`; **low data hard-caps conviction (45)**;
  every score traces to **cited real sources** shown in-UI; deepen loop re-researches low-data cases.
- **Gap:** no *hard* groundedness check that each rationale is actually supported by the sources.
- **Guardrails to build:**
  1. **Faithfulness verifier node** (LLM-as-judge / NLI) — check each rationale vs. its evidence; flag
     unsupported claims (RAG groundedness).
  2. **Citation enforcement in the schema** — per-dimension `evidenceRefs: number[]` + `hasEvidence`;
     a factor citing nothing isn't scored; composite over evidenced factors only; coverage → confidence.
  3. **Explicit "INSUFFICIENT DATA" abstention** — if ≥4/6 factors lack evidence, return "not enough
     public info" instead of a forced verdict.
  4. **Retrieval relevance/entity gate** — Tavily pads with off-entity pages; filter sources that don't
     actually mention the company (embedding/LLM check); abstain if too few remain.
  5. **Numeric-claim verification** — any figure in a rationale must appear in a cited source.
  6. **Self-consistency / adversarial critic** — score twice or add a skeptic node; flag disagreement.
  7. **Observability + offline evals** — trace evidence→score→rationale to LangSmith/Langfuse; CI
     groundedness/hallucination eval set; per-factor coverage + conviction-calibration metrics.

## Perceived performance — partial structured streaming (Session 8 — for "What I'd improve")
*Problem: the ~20–30s `analyze` step is one opaque `.invoke()` await, so the whole dashboard renders
at once — a long "Analyzing…" that drives drop-off.*
- **Improvement:** stream *inside* the analyze step — token stream → partial-JSON parse → `DeepPartial`
  snapshots emitted as `analysis-partial` SSE events, so the radar builds dimension-by-dimension and
  rationales typewriter in.
- **Backend:** LangChain `.stream()` (incremental JSON parser) or **Vercel AI SDK `streamObject`**
  (`partialObjectStream`). Never `JSON.parse` a partial — use `partial-json`/AI SDK; strict-`Zod.parse`
  only the final object.
- **Frontend:** `DeepPartial<Analysis>` state + defensive components (the radar already tolerates
  missing dims via fixed CATEGORIES + `?? 0`); `experimental_useObject` or `useState`+reducer;
  `useDeferredValue`/`startTransition` + rAF batching to coalesce token bursts; Framer Motion
  `layout`/`AnimatePresence` keyed by category; optimistic skeleton rows.
- **Our nuance:** the verdict is computed from the *full* weighted score → stream factors/radar as
  build-up, **resolve the verdict as the finale** (a running provisional composite would mislead).

## Paywalled / blocked sources & empty content (Session 9 — for "What I'd improve")
*Problem: the best finance data is paywalled (Bloomberg/WSJ) or blocks scrapers → thin/empty content.*
- **Today (graceful, no crash):** we don't scrape — **Tavily** fetches/extracts server-side, so paywalls
  yield a thin/empty snippet, not a 403/crash; `searchWeb` try/catch → `[]`; `formatEvidence` handles
  empty evidence. Containment: thin factors scored ~4–5 + flagged, `dataQuality:low` caps conviction,
  deepen loop re-queries non-paywalled sources.
- **Gaps:** Tavily teasers can mislead; we don't *detect* paywall stubs; empty text → LLM may lean on
  title/URL/memory.
- **To build:** detect & filter thin/paywall content (length threshold + "subscribe to read" signatures);
  base `dataQuality`/deepen on **real content coverage**, not URL count; **prefer free primary sources**
  (SEC EDGAR, IR pages, earnings transcripts, Crunchbase, Yahoo Finance) over paywalled journalism;
  **license** Bloomberg/Refinitiv/FactSet rather than circumvent paywalls (ToS/legal); explicit
  **"INSUFFICIENT DATA — sources paywalled"** abstention + a transparency note to the user; groundedness
  verifier as the backstop.

## Product principles to follow (from company research)
1. **Decide, don't dump** — lead with the verdict + reasoning, like Ayana leads with a recommendation.
2. **Show your work** — surface the research trace and cite sources; transparency builds trust.
3. **Craft + Speed** — polished UI, streams the agent thinking live = reads as "production-grade."
4. **Defensible by design** — every architectural choice must be explainable in interview.
