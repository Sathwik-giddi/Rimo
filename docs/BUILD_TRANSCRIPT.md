# AI Investment Research Agent — Full Build Transcript (LLM Session Log)

> **Why this file exists.** The assignment mandates building with an LLM and awards bonus
> points for including *all* LLM chat-session transcripts/logs, to show thought process and
> approach. This file is the faithful, running record of that session. It is started at
> Step 0 (before any code) and appended to as the build proceeds.
>
> - **Builder:** Komalpreet Kaur
> - **LLM used:** Claude (Anthropic) via Claude Code — used as a pair-builder and reasoning aid.
>   Every decision below is one the candidate can explain and defend.
> - **Assignment:** InsideIIM × AltUni AI Labs — AI Product Development Engineer (Intern) take-home.
> - **Log convention:** `U:` = user/candidate, `A:` = AI assistant. Tool actions are summarized
>   in *italics*. Reconstructed from the live session; wording condensed for readability, intent preserved.

---

## Session 1 — Framing & Understanding (Day 1)

### [Turn 1]
**U:** "hey we have something to build"

**A:** Asked three framing questions before starting: (1) what is it, (2) where does it live
(noted the working dir `d:\PROJECTS\InsideIIM` is not yet a git repo), (3) any stack/deadline
constraints. Offered to inspect the project first.

### [Turn 2]
**U:** Provided the technical requirements from the assignment PDF.
- JD: Core React.js/Node.js; preferred LangChain/LangGraph.
- Take-home assignment.
- **Deadline: 29 June, 9 AM.**

**A:** Summarized the assignment (see below) and proposed locking down API keys / stack.

> **Assignment as read from the PDF:**
> Build an **AI Investment Research Agent** — input a company name → it researches → decides
> **Invest or Pass** with the reasoning. How it's built is up to the candidate.
> **Stack (their production stack, "please build with it"):** React/Next.js front end ·
> Node/Next.js back end · **LangChain.js / LangGraph.js** for the AI · any LLM provider.
> Deploying (e.g. Vercel) = bonus. **7 days.** Submit a zip with code + README
> (Overview, How to run, How it works, Key decisions & trade-offs, Example runs,
> What you'd improve, **BONUS: full LLM chat transcript**). Strictly solo; must explain everything.

### [Turn 3]
**U:** "before jumping directly into the project lets understand the company" — discussed the core product principles for the AI Engineer role to ensure the app aligns with their expectations.

**A:** *Researched the company* (fetched altunilabs.ai, insideiim.com; web search). Briefed:
- InsideIIM = India's #1 AI-powered MBA platform; 5M+ annual users, 200+ employers, 100+ B-schools.
- Four surfaces: **InsideIIM** (career/MBA platform), **InsideKampus** (employer hiring),
  **AltUni** (upskilling), **AltUni Labs** (the AI lab — where this role sits).
- Founded 2011 (IIM Indore hostel); ~$1M raised (Indian Angel Network). Pivot to
  "practical AI that makes humans better" (2024–now).
- Flagship AI product **Ayana** (`ayana.insideiim.com`): AI MBA counselor "trained on
  100,000+ real MBA success stories" — percentile prediction, college recommendation,
  resume analysis, admission strategy.
- Stated values: **Ownership · Kind Candor · Speed · Craft.**
- **Insight:** their product pattern = *take a messy real-world entity → research it against
  lots of signal → produce a confident, reasoned, sourced recommendation a human can act on.*
  Our agent should mirror this (decisive, transparent, cited, explainable) — not be a generic chatbot.

### [Turn 4]
**U:** "as we are building the product for the company it should follow the principles of the
company, not a random generic LLM… do a deep research about their product and then we can start."

**A:** Launched a **deep-research workflow** (fan-out web search → fetch/dedup sources →
adversarial fact-check → synthesize) on InsideIIM/AltUni's product DNA: Ayana's UX & trust
mechanics, their design language & tone, their values in practice, the recurring product pattern,
and their tech/AI architecture — to produce concrete UX/design principles for our agent.
*(Running in background.)*

### [Turn 5]
**U:** "before moving forward read the assignment carefully and follow each and every step carefully."

**A:** Did a literal, line-by-line reading of the assignment as a contract:
- **Task:** company name in → real research → **Invest/Pass + reasoning** out. The rest is our call.
- **Hard locks:** JS/TS app; **LangChain.js / LangGraph.js required**; any LLM; Vercel deploy = bonus.
- **Deliverables:** zip + README with 7 named sections; **the full LLM transcript is a graded bonus.**
- **Ground rules:** solo, original, *must be able to explain everything.*
- Flagged ambiguities + proposed defensible calls (accept any company name & state confidence/data
  gaps; cite sources; force a clear verdict + conviction score + bull/bear case; ~1 day left so
  prioritize a working, deployed, explainable core over feature sprawl).
- Defined **Step 0 = set up transcript capture before any code** (this file).

### [Turn 6]
**U:** "yes" (proceed with Step 0).

**A:** Created `docs/BUILD_TRANSCRIPT.md` (this file) and `docs/DECISIONS_AND_AMBIGUITIES.md`
to capture the session and design calls from the very start.

---

## Session 2 — Architecture & Plan (Day 1, continued)

### [Turn 7] Deep-research workflow completed
**A:** A multi-agent deep-research workflow (5 angles → 15 sources → 50 claims → 25 verified
adversarially 3-0 → 11 findings) returned. Key synthesized findings:
- **Core product pattern:** messy entity → benchmark vs. a large real-outcome corpus → confident,
  reasoned, **tiered** recommendation. Not raw data, not open chat.
- **Ayana** = CAT percentile predictor (slot-wise normalization) + Profile Score + holistic/
  demographic reasoning → **three tiers: Safe / Practical-Reach / Ambitious-Dream**. Delivered as
  **discrete modules in a linear, numbered pipeline** (React/Vite SPA), not a chatbox.
- **Trust:** data-scale ("100,000+ stories"), social proof (4.8/5, 100k+ users), holistic
  reasoning, authority branding — **but NO citations/methodology disclosed.**
- **Voice/values:** "We make AI that makes humans better", "From Aspiration to Outcomes";
  Ownership · Kind Candor · Speed · Craft.
- **Tech:** their AI architecture is *not* public (LangChain/Gemini/Livekit unconfirmed) — we pick
  our own stack and defend it.

**A:** Translated findings into **7 product principles** for our agent (see
`docs/PRODUCT_PRINCIPLES.md`). Headline calls:
1. Output a **tiered verdict — INVEST / HOLD / PASS + conviction score** (mirrors Safe/Reach/Dream).
2. **Benchmark vs. sector/peers**, not abstract opinion.
3. **Holistic multi-signal** analysis (moat, financials, news, risks, sentiment), combined.
4. **Transparency as our edge** — unlike Ayana, **cite every source** + show bull/bear case.
5. **Modular LangGraph pipeline** (Plan → Research → Analyze → Decide) shown as **live numbered steps.**
6. **Warm, outcome-focused, action-oriented** voice; honest about gaps (Kind Candor).
7. **Craft + Speed** — polished streaming UI.

North-star: *"Ayana, but for companies — Invest/Hold/Pass with reasoning, and it shows its sources."*

### [Turn 8] Lock architecture + provider questions
**A:** Proposed the architecture: **one Next.js (App Router, TS) full-stack app** (React UI +
API routes as the Node backend + one-click Vercel deploy) with the AI built as a **LangGraph.js
state machine** of four nodes — **Plan → Research → Analyze → Decide** — streaming a live trace to
the UI, ending in a verdict card (INVEST/HOLD/PASS + conviction + bull/bear + cited sources).
Rationale for a graph over a plain chain: explicit, inspectable, streamable steps that are easy to
defend in interview. Flagged the one real blocker = which **LLM key** + **search key** to use.

### [Turn 9] LLM provider decision → Groq
**U:** "is gemini key mandatory?"
**A:** No — assignment says *"use any LLM provider."* Gemini is not required. Laid out free/easy
options (Gemini free tier, Groq free tier, OpenRouter, local Ollama, paid OpenAI/Claude).
**U:** "okay so we will go with groq"
**A:** Locked **Groq** (free, fast). Default models: **Llama 3.3 70B Versatile** (analysis +
decision) and **Llama 3.1 8B Instant** (planning). Wired via LangChain's `ChatGroq` so the
provider is a one-line swap.

### [Turn 10] Environment Setup
**U:** "so after getting an env key where should I put it"
**A:** Created `.env.local` (Groq key in place, Tavily slot empty) + `.env.example`. Confirmed via
`git check-ignore` that `.env.local` is ignored.

### [Turn 11] Scaffold + install
**A:** Verified Node v24.11 / npm 11.6. Scaffolded **Next.js 16 + React 19 + TypeScript +
Tailwind v4 + App Router + Turbopack** via `create-next-app`. Installed the AI stack:
`@langchain/langgraph` (1.4), `@langchain/core` (1.2), `@langchain/groq` (1.3),
`@langchain/tavily` (1.2), `zod` (4). Read the bundled Next 16 docs (the scaffold's `AGENTS.md`
warns of breaking changes) to confirm route-handler/streaming conventions before coding.
Inspected the exact v1 API surface (`TavilySearch`/`TavilySearchAPIWrapper`, `ChatGroq`,
`StateGraph`/`Annotation`/`START`/`END`) and Tavily's result shape (`{title,url,content,score}`)
so code targets the real API, not a guessed one.

### [Turn 12] "What is Tavily / is it in the assignment / why this choice?"
**U:** asked what Tavily is for, whether it's free, whether the assignment mentions it, and why we
chose it.
**A:** Clarified honestly: **Tavily is NOT mentioned in the assignment** — the assignment mandates
only React/Next + Node + LangChain/LangGraph and says *"use any other libraries / APIs / tools you
like."* Tavily is **our choice** under that clause. It is the **research engine** (the agent's
"eyes" on the live web): Groq = the brain that reasons; Tavily = fetches real, current, **citable**
info so the agent does genuine research instead of reciting stale LLM memory with no sources.
Free tier (no card). Laid out the decision as three nested "why"s:
1. Why any external source → an LLM alone can't research (stale, unverifiable, hallucination-prone);
   for an *investment* call that's the worst failure mode.
2. Why web search vs. a financial-data API → input is a free-text *company name* (could be private/
   non-US); a stock API returns nothing for most, web search covers any company + qualitative signal.
3. Why Tavily vs. Google/Bing/DDG → agent-native, native LangChain integration, citations out of the
   box, free. Trade-offs owned: extra key+dependency (mitigated: free, documented, degrades
   gracefully), snippets not full filings (→ "improve with more time"), external-service dependency.

### [Turn 13] "Is Tavily actually the best? Verify live."
**U:** "in other similar options... is tavily the best?" then **"c"** (verify current free tiers live).
**A:** Compared the category honestly (Tavily, Exa, Brave, Jina, Serper, SerpAPI, Perplexity Sonar):
Exa wins on raw source quality, Brave on being most-free/independent, Tavily on balance. Then ran
**live web searches** to confirm 2026 free tiers:
- **Tavily** — **1,000 credits/month free, no card** (basic search = 1 credit, advanced = 2; no
  rollover). PAYG $0.008/credit beyond. ✅ genuinely free.
- **Exa** — **1,000 requests/month free, no card**; paid $7/1k standard (raised Mar 2026). ✅ also
  genuinely free; the quality-focused alternative.
- **Brave** — ❌ **killed its free tier (Feb 2026)** for new users; now $5/mo metered credits
  (~1k queries) with attribution required. No longer a clean free option.
**Conclusion:** live check *strengthens* the call — Tavily and Exa are the two truly-free, agent-
native options; Brave drops out. **Tavily stays the best fit for our criteria** (free + native
LangChain + citations + ships fast), with **Exa** noted as the upgrade path if source depth mattered
more. *(Sources: docs.tavily.com/documentation/api-credits, exa.ai/pricing,
api-dashboard.search.brave.com/documentation/pricing.)*

### [Turn 14] Build progress (agent code)
**A:** Wrote the agent modules under `lib/agent/`: `schemas.ts` (Zod contracts for plan / analysis /
verdict + Source/EvidenceGroup types), `llm.ts` (Groq factory, reasoning vs fast models),
`search.ts` (Tavily wrapper returning citable sources, degrades gracefully on failure / missing key),
`events.ts` (typed trace events for the live UI), `state.ts` (LangGraph `Annotation` state).
Next: the graph wiring (`graph.ts`), the streaming API route, and the UI.

---

## Session 3 — Build (Day 1, continued)

### [Turn 15] Secrets Validation
**A:** Verified both keys are present in `.env.local` & well-formed and that `.env.example` is leak-free.

### [Turn 16] Wrote the graph + smoke-tested the AI core
**A:** Wrote `lib/agent/graph.ts` — the LangGraph `Plan → Research → Analyze → Decide` with prompts
that encode the product principles (decisive verdict, evidence-only analysis, honest data-quality,
warm/action-oriented voice) and per-step `config.writer` trace events. Added `scripts/test-agent.ts`
to run the graph outside Next.js (loads `.env.local`, streams the trace).

**Two real bugs found & fixed (worth explaining in interview):**
1. **`plan` node vs `plan` channel collision** — LangGraph v1 forbids a node name matching a state
   channel. Fix: renamed graph nodes to `planStep`/`researchStep`/`analyzeStep`/`decideStep`
   (UI event names unchanged).
2. **Groq `tool_use_failed`** — Llama on Groq's *function-calling* structured-output mode wrapped
   the (valid!) JSON in a `<function=...>` envelope Groq's tool parser rejected. Fix: switched
   `withStructuredOutput` to **`method: "jsonMode"`** + an explicit JSON-schema hint in the prompt
   (`lib/agent/structured.ts` via `z.toJSONSchema`), then Zod-validate. Robust across 8B and 70B.

**Result (live, with real keys):** `Stripe` → Plan (5 Qs) → Research (5 concurrent Tavily searches,
20 sources) → Analyze → **Decide: INVEST, conviction 80/100**, with thesis + bull/bear + risks and
`dataQuality: medium`. The AI core is validated end-to-end. Next: streaming API route + UI.

### [Turn 17] Streaming API route + full UI built and tested
**A:** Built `app/api/research/route.ts` — POST that runs the graph with `streamMode: "custom"` and
streams each `AgentEvent` to the browser as SSE (Node runtime, `maxDuration` 60). Built the client:
`app/hooks/useResearchAgent.ts` (opens the SSE stream, reduces events into React state),
and components `AgentTrace` (live stepper + per-search list), `VerdictCard` (decision badge +
conviction meter + thesis + bull/bear + risks), `Dimensions` (0-10 score bars + rationale + summary),
`Sources` (deduped, clickable citations). Rewrote `app/page.tsx` (hero, input, example chips, results
grid), refreshed `globals.css`/`layout.tsx` (Geist font, slate theme, metadata). Product named
**"Altair"** (a guiding star — investment research).
**Verified:** `tsc --noEmit` clean; `npm run dev` (Next 16 Turbopack) ready; live HTTP test
`POST /api/research {company:"Zomato"}` streamed all event types in order →
**INVEST, conviction 70** with thesis/bull/bear + 6 searches; homepage HTTP 200, no errors in log.
**App is functionally complete end-to-end.** Remaining: user review of look/feel, capture example
runs, write README, deploy to Vercel.

### [Turn 18] Major upgrade — pro framework + works for small companies
**U:** Provided a professional fundamental-analysis framework (8 categories: business fundamentals,
financial health, valuation, moat, industry/macro, management/governance, catalysts & risks,
sentiment/ownership) + output structure (score each, weight by importance, threshold for invest/pass,
show pros/cons). Asked to review coverage and decide what to add. Then made a key product call:
**"I don't just want well-known companies (whose data is easy) — I want it to cover small companies too."**

**A:** Reviewed coverage (~60% covered) and surfaced the honest constraint: the framework splits into
qualitative signal (web search handles, any company) vs hard numbers (valuation multiples, ratios,
ownership — need a market-data API, **public companies only**). The user's small-company priority
**settled the Layer-2 fork**: a financial-data API would fail exactly the companies they care about,
so we double down on web search as the universal backbone and instead make the agent robust to thin data.

**Implemented:**
1. `framework.ts` — six fixed analysis **categories with explicit weights** (Financial Health 1.2,
   Moat 1.1, Business 1.0, Catalysts 1.0, Industry 0.9, Management 0.8); `compositeScore()` (weighted
   avg) and `deriveVerdict()` (composite→threshold: ≥6.5 INVEST / ≥4.5 HOLD / else PASS; conviction
   sized by decisiveness and **hard-capped by data quality**: low→45, medium→72, high→95).
2. **Decision is now a transparent rule**, not an LLM whim — the LLM scores categories + writes the
   narrative; the math makes the call. (`VerdictNarrativeSchema` + computed `decision/conviction/composite`.)
3. **Adaptive planning** — plan prompt told the company may be small/private; probe founders, funding,
   reviews, controversies, not just financials.
4. **Reflect-and-retry deepen loop** — after analysis, if the analyst rates `dataQuality: low` and we
   haven't deepened, a conditional LangGraph edge routes back through a `deepenStep` (broader queries)
   then re-analyzes. (Chosen over a source-count trigger because Tavily always returns padded results.)
5. **Token trimming** (top-3 sources/question, 320-char snippets) to stay under Groq's 12k TPM free limit.

**Bugs/limits handled:** Groq 429 TPM rate-limit on rapid back-to-back runs → mitigated by trimming
evidence tokens (single-user pacing is fine). Deepen trigger moved from raw source count → analyst's
dataQuality judgment.

**Validation (live):** Nvidia → INVEST 81 (high data); Boult Audio (small Indian startup) → INVEST 71,
medium data, narrative *acknowledges* the medium quality; **Zentary Microsystems (fake/obscure) →
deepen loop fired → PASS 45, low data, honestly "absence of evidence, not negative evidence."**
Same agent, honest across company sizes. `tsc` clean throughout.

### [Turn 19] Visual dashboard + dark premium redesign
**U:** "too much text — use infographics/graphs/diagrams." Then shared a dark, warm-orange premium
agency aesthetic as inspiration and asked to remake the UI to that *feel* (not exact elements).
**A:** Two passes:
1. **Infographics (hand-built SVG, no chart lib):** `ConvictionGauge` (radial ring), `ScoreRadar`
   (6-axis spider chart of the framework scores), bull-vs-bear balance bar, weighted-score stat +
   evidence-quality pill, and collapsible per-category rationale (`<details>`) so text is on-demand.
   Shared `decision.ts` palette (green/amber/red = invest/hold/pass).
2. **Dark premium theme:** rewrote `globals.css` (near-black bg with a warm orange radial glow,
   `--accent` orange registered as a Tailwind theme color, `.panel` glass cards, `.btn-accent` glow
   button) and restyled every component (page hero with gradient headline + feature pills, gauge/
   radar/trace/sources/verdict all dark). Fixed a Tailwind v4 gotcha (CSS-var classes use the
   registered `accent` color, not the removed `[--accent]` shorthand).
**Verified:** `tsc` clean, homepage 200, clean compiles. Awaiting user's visual review (radar label
placement + overall density).

### [Turn 20] Strict monochrome palette + UI polish + rate-limit handling
**U:** "no many colours — only black, white, and the orange + shades." Reworked the whole UI to a
strict **black / white / orange + greys** system: since hue can't signal meaning, the verdict now
reads by **intensity + icon** (▲ Invest = solid orange, ● Hold = orange outline, ▼ Pass = grey),
score strength shown by orange opacity, bull/bear = orange vs grey. Centralised in `decision.ts`;
swept every component (removed all emerald/amber/rose). Cleared `.next` twice to beat a stale
Turbopack CSS cache (verified 0 off-palette rules in served CSS).
**U (parallel edits):** added framer-motion micro-animations, a real `logo.png`, a clickable brand
that resets, a "New Search" button, "Equity Research Terminal" tagline, solid `#121214` panels,
refined accent `#f97316`. All valid; app compiles clean (`tsc` exit 0).
**Rate limit:** hit Groq free **daily** cap (100k tokens/day, TPD) from heavy testing → app showed
raw 429 JSON. Fixes: (1) `humanizeError()` in the API route turns 429 / missing-key errors into
clear messages; (2) moved the **decide** step to the fast 8B model (decision is computed in code, so
the narrative doesn't need 70B) — ~halves heavy-model token use, ~doubling runs/day. Limit is
per-org and only affects *our* test account today; graders' own keys get a fresh 100k/day.

---

## Session 4 — Refinements, Customizations & Visual Polish (Day 2)

### [Turn 21] visual consistency of breakdown score badges
**U:** pointed out a visual inconsistency with the category score badges (flexible widths, non-uniform fonts, and hardcoded colors).
**A:** Sized elements to a fixed `w-10 flex-none` and switched to a monospace font (`font-mono`) to guarantee identical visual bounds across numbers, and aligned the RGB background color to match the new theme.

### [Turn 22] Transforming sources list to wrapping grid
**U:** requested showing sources in a cleaner, less text-heavy format.
**A:** Redesigned the sources panel from a vertical, descriptive list into a compact, wrapping tag grid of domain name badges, keeping full citable URLs and setting the page titles to native hover tooltips.

### [Turn 23] Scroll columns mismatch resolved
**U:** pointed out a scrolling columns mismatch where one column scrolled and the other stayed sticky.
**A:** Removed `lg:sticky` from the left column container, allowing the entire page content (trace/sources vs verdict/breakdown) to scroll naturally together.

### [Turn 24] Custom accent color customization
**U:** provided a color sample and asked to apply it as the primary color.
**A:** Extracted the exact color details from the uploaded image (`#f04727` / RGB `240, 71, 39`) using a Python script. Programmatically updated all styling constants, progress bar fills, glows, active category score badges, and hover states.

### [Turn 25] SVG Radar chart labels clipped
**U:** asked why labels around the spider/radar chart were clipped.
**A:** Resolved by increasing the SVG canvas boundaries (`viewBox="0 0 380 280"`), shifting center coordinates (`CX=190`, `CY=140`), and scaling the radius (`R=90`) so text anchors remain completely inside the rendering canvas.

### [Turn 26] Symmetrical sources tag layout
**U:** asked why sources grid boxes were uneven.
**A:** Configured the sources grid to use a strict 2-column structure (`grid grid-cols-2 gap-2`) with flex text truncation, eliminating the uneven "tag cloud" look.

### [Turn 27] Equal columns bottom alignment
**U:** requested making the sources box height match the height of the right column card.
**A:** Converted both page columns to `flex flex-col gap-6` and added `flex-1` to the bottom cards (`Sources` and `Dimensions`) so that the bottom card of the shorter column automatically stretches to match the height of the taller column.

### [Turn 28] Sourced badges flowing vertically down columns
**U:** asked to stack sources `1, 2, 3...` vertically down columns rather than horizontally.
**A:** Configured the sources grid to use `grid-flow-col` combined with dynamic `gridTemplateRows: repeat(rowCount, minmax(0, auto))`. This causes items to stack vertically down the first column and spill naturally into the second.

### [Turn 29] Favicon & Logo recolored
**U:** requested matching favicon and logo image colors to the custom theme.
**A:** Wrote a Pillow script to shift the target orange hues of the favicon (`app/icon.png`) and logo (`public/logo.png`) to the new `#f04727` color while preserving transparency and anti-aliasing.

### [Turn 30] Rate-limit handling + model config (Groq free tier)
**U:** hit Groq 429 errors mid-demo; raw JSON error showed in the UI; tried a second account key, still failing.
**A:** Diagnosed and hardened against Groq's free-tier limits:
- **Per-model daily buckets:** each Groq model has its OWN daily token bucket. The 70B bucket
  (100k/day) was exhausted by testing, but 8B's (~5×) was fresh — so the 8B plan step worked while
  the 70B analyze step 429'd. Made models **env-overridable** (`GROQ_REASONING_MODEL` /
  `GROQ_FAST_MODEL` in `lib/agent/llm.ts`) and set analysis to 8B for now → reliable runs; flip back
  to 70B for quality. (A clean quality-vs-throughput trade-off for the README.)
- **Per-minute vs per-day:** the earlier message mislabeled *every* 429 as "daily". Most were the
  **per-minute** limit (TPM) — partly because a concurrent test run collided with the user's click in
  the same minute. Rewrote `humanizeError()` (API route) to distinguish per-minute (wait seconds) vs
  per-day (resets over 24h) and to render a clean message instead of raw JSON.
- **Auto-retry:** added `maxRetries: 5` to `ChatGroq` so transient per-minute spikes recover silently
  (Groq honours Retry-After) instead of surfacing an error.
- Also reduced tokens earlier by moving the *decide* narrative to 8B (the decision is computed in
  code, so 70B was wasteful) — roughly doubling runs-per-day. Verified live: full run → INVEST 77.
- **Note:** the daily cap only affects *our* test account today; graders use their own fresh key.

### [Turn 31] "How Altair decided" methodology panel
**U:** asked whether the final report shows all three things the brief mentions — *what it researches,
how it works under the hood, how it shows results.*
**A:** Mapped them: "what it researches" (trace queries + Sources + category scores) and "how it
shows results" (the dashboard) were already in-product; "how it works under the hood" was only in the
README. Added `app/components/Methodology.tsx` — a collapsible **"How Altair decided"** panel in the
result that surfaces, with THIS run's real numbers: the Plan→Research→Analyze→Decide pipeline (+ the
reflect-and-retry note), the six weighted factors and their weights, the explicit threshold rule
(≥6.5 Invest / ≥4.5 Hold / else Pass), and the data-quality conviction cap. Now the report is
self-explanatory on all three. `tsc` clean.

### [Turn 32] Docs audit
**U:** "check docs — is it all good?"
**A:** Cross-checked the docs against the code: accent `#f04727` consistent across `globals.css` /
`decision.ts` / `Dimensions.tsx`; radar `viewBox 380×280` / `CX=190` / `CY=140` matches the logged
change; transcript current through the UI tweaks. Found the rate-limit + methodology work undocumented
and added Turns 30–31 above so the transcript (a graded bonus) stays complete.

### [Turn 33] Upgraded Agent Trace to Interactive Timeline
**U:** requested making the agent trace look more interactive, like a timeline showing how the pipeline works.
**A:** Upgraded the Agent Trace from a flat list to an interactive timeline. Added a vertical axis line, color-coded active states (vermilion accent), a pulsing inner-dot with an expanding ping animation for the active stage, and nested branch layouts (`ml-2 border-l border-white/5 pl-4`) for live queries. Queries show active pulses when running and dim static indicators when completed with their citation counts.

### [Turn 34] Layout realignment for component bottom borders
**U:** pointed out a misalignment between components (Agent Trace, Verdict, Sources, Breakdown, Methodology).
**A:** Refactored `app/page.tsx` to move `Methodology` ("How Altair decided") out of the two-column grid and place it full-width at the bottom. This allows the two columns to terminate on matching bottom elements (`Sources` and `Dimensions` respectively), restoring pixel-perfect alignment to their bottom borders using `flex-1`.

### [Turn 35] Primary color shift to Orangish-Red
**U:** requested making the UI accent color shift slightly towards red, like an "orangish red".
**A:** Updated the primary color across all CSS files and TS constants to a warm orangish-red (`#e6391a` / RGB `230, 57, 26`). Re-ran the Python Pillow script to programmatically recolor the branding logo (`public/logo.png`) and tab favicon (`app/icon.png`) to keep all assets completely in sync.

### [Turn 36] Shifting accent color to Blazing Red-Orange
**U:** requested making the UI accent color "a bit more red".
**A:** Updated the theme accent color to a hotter blazing red-orange (`#df2514` / RGB `223, 37, 20`). Re-ran the custom Pillow image script to update `public/logo.png` and `app/icon.png` (favicon) to the new blazing red shade. Appended records to the decisions log and progress transcripts.

### [Turn 33] Moved methodology → generic "How it works" in the top bar
**U:** "move 'how Altair decides' to the landing page top-right (replacing 'Equity Research
Terminal'); make it a generic, easy-to-understand write-up of how it works."
**A:** Replaced the run-specific result panel with a global explainer:
- New `app/components/HowItWorks.tsx` — a self-contained **"How it works" button + modal** (always
  available on landing *and* results), in plain English: the 4 steps (plans research → reads the live
  web → scores six factors → makes the call), the six factors as chips, and "why you can trust it"
  (real cited sources · honest about thin data · fixed explainable rule). No run-specific numbers.
- Put `<HowItWorks />` in the nav top-right where "Equity Research Terminal" was; removed the
  run-specific `<Methodology>` block from the results and **deleted `Methodology.tsx`**.
- *Why:* a generic, beginner-friendly explainer reaches users *before* they run anything and keeps
  the result view focused on the verdict. `tsc` clean.

### [Turn 34] Wider "How it works" dialog + minimal scrollbar
**U:** "increase the dialog width and use a minimal scroller that matches the UI."
**A:** Widened the modal (`max-w-lg` → `max-w-2xl`, padding `p-8`) and added a global minimal dark
scrollbar in `globals.css` (`scrollbar-width: thin`, translucent-white thumb, transparent track,
webkit + Firefox) so the whole app and the modal scroll consistently on-theme. `tsc` clean.

### [Turn 35] Fixed broken "trust" bullets in the modal
**U:** showed the "Why you can trust it" bullets rendering as broken fragments.
**A:** Root cause: each `<li>` was `display:flex`, so bare text nodes + inline highlight `<span>`s
each became *separate flex items* with gaps (e.g. "It / stays / honest"). Fix: wrapped each bullet's
text in a single `<span>` so it's one flex item that flows as normal inline text. `tsc` clean.

### [Turn 36] Modal scroll padding & ultra-thin custom scrollbar
**U:** requested managing the "How it works" dialog box so that there is no loss of top padding when scrolling, and using an ultra-minimal scrollbar matching the UI.
**A:** Redesigned the `HowItWorks` modal layout to keep the header and footer pinned at the top and bottom of the panel while the body content scrolls independently. Added a `.custom-scrollbar` class in `globals.css` with a 4px wide thumb, preventing elements from touching the top borders during scroll and keeping the overlay cleanly padded.

### [Turn 37] Remove tech stack footer from modal
**U:** "from the box remove Built with LangGraph · Groq · Tavily"
**A:** Removed the pinned tech stack footer from the `HowItWorks` component to keep the bottom section cleaner and focus strictly on product flow explainer content.

### [Turn 38] Increase modal dialog height
**U:** "increase the height of the box"
**A:** Increased the height of the `HowItWorks` modal dialog box to a fixed, tall frame (`h-[80vh] max-h-[800px] min-h-[560px]`). This creates a stable layout window with generous scroll space for step details and trust indicators.

### [Turn 39] Reduce modal top bar height
**U:** "reduce the height of top bar of how it works dialog box"
**A:** Reduced the vertical footprint of the modal header by shrinking the title font size to `text-lg` (from `text-xl`), shifting the subtitle to `text-xs text-zinc-500` (from `text-sm`), and tightening the bottom padding to `pb-3` (from `pb-4`).

### [Turn 40] Premium Dashboard Layout Reorganization
**U:** "in the final report page........put these sections in a better manner change their positions........do something different"
**A:** Moved `VerdictCard` to the top spanning the full width of the screen, providing ample space for the thesis and side-by-side Bull/Bear case panels. Put `Dimensions` (Category Breakdown) in a wide left column (`1fr`) and the supporting research trace (`AgentTrace` + `Sources`) in a right sidebar (`320px`), balancing final results with live updates.

### [Turn 41] Bi-Directional Hover Infographic Interactivity
**U:** requested adding more visual infographics, diagrams, and interactivity to make the report page easier to understand.
**A:** Connected the report's text and graphics through three high-fidelity micro-interactions:
1. **Radar Axis Linkage:** Hovering over a category row in `Dimensions` instantly highlights and pulses its corresponding vertex/label on the `ScoreRadar` spider chart. Upgraded the details panels to a smooth Framer Motion height-animated accordion.
2. **Sources & Trace Correlation:** Hovering over a domain badge in `Sources` highlights the specific sub-queries in the `AgentTrace` timeline that cited that source, and vice-versa (hovering over a timeline query highlights its cited sources), while fading unrelated items.
3. **Thesis Balance Glow:** Hovering over the Bull/Bear case cards in the `VerdictCard` triggers a scaling, glowing shadow effect on the corresponding side of the horizontal balance bar, dimming the opposite side.

### [Turn 42] Reproducibility — same company, same verdict
**U:** showed two OpenAI runs with the *same* displayed weighted score (6.5) but opposite verdicts
(HOLD vs INVEST). "Why a different answer for the same company?"
**A:** Diagnosed: OpenAI sits right on the 6.5 INVEST threshold; LLM temperature nudged the real
composite just across it (6.4x → HOLD vs 6.5x → INVEST), and the UI rounds to 1 decimal so both
*displayed* as 6.5. Fix: set **plan + analyze to temperature 0** in `graph.ts` → identical evidence
yields identical scores → a stable, reproducible verdict. Decide stays at 0.3 (wording only; the
verdict is computed from scores, not prose). Logged the reproducibility-vs-freshness trade-off in the
decisions doc; noted a future "borderline" label for genuine coin-flip companies. `tsc` clean.

### [Turn 43] Increased Radar Chart Visual Size
**U:** requested increasing the size of the radar chart.
**A:** Scaled up the spider chart SVG canvas display size from `max-w-[360px]` to `max-w-[450px]` (25% increase). Scaled the baseline label fonts from `11px` to `12px` (and active label text to `13px`) to keep the typography crisp and perfectly proportioned under the larger render size.

### [Turn 44] Distraction-Free Active Research Timeline Layout
**U:** requested showing only the Agent Trace on the report page while other sections are loading, and placing it back in the completed layout once the final verdict is achieved.
**A:** Refactored `app/page.tsx` layout to dynamically inspect the presence of `state.verdict`. While the research pipeline is executing, all placeholder skeletons and grid layouts are hidden, displaying *only* a centered, clean Agent Trace component. Once the final verdict resolves, the layout transitions to the complete executive dashboard.

### [Turn 45] Frameless Vertical Pipeline Timeline
**U:** "remove the box around make it a vertical pipeline...from top to bottom"
**A:** Removed the outer card container styles (`panel p-6 border bg-[#121214]`) from the `AgentTrace` component globally. It now renders borderless directly on the dark background with the vertical axis line extending from top to bottom, highlighting the pipeline structure.

### [Turn 46] Remove assignment text from footer
**U:** "— for the InsideIIM × AltUni AI Labs assignment. remeove this from home page"
**A:** Updated the footer in `app/page.tsx` to remove the academic assignment suffix, leaving only the clean product engine signature: "Built with Next.js · LangGraph.js · Groq · Tavily".

### [Turn 47] Enlarged Top Brand Logo
**U:** "increase the size of logo"
**A:** Scaled up the brand logo in the top navbar: increased the image size classes from `h-10 w-10` to `h-14 w-14`, increased the text size from `text-lg` to `text-2xl font-bold`, and widened the item gap to `gap-4.5` to maintain balanced brand spacing.

### [Turn 48] Compact Top Navbar Spacing
**U:** "reduced the height of top nav bar"
**A:** Tightened the navbar height by shrinking the vertical padding from `py-4` to `py-2` and decreasing the bottom spacing margin from `mb-10` to `mb-6`, creating a compact, modern header layout.

### [Turn 49] Clean Loading Page (Removed Footer & Researching Text)
**U:** requested removing the Next.js tech footer from the bottom of the page, and removing the "Altair Agent is researching..." text from the top of the timeline during research.
**A:** Updated `app/page.tsx` to completely remove the footer section and the active research text header. The page now renders in an ultra-clean fashion, displaying only the frameless pipeline timeline when active.

### [Turn 50] Smooth Loading-to-Dashboard Transitions
**U:** "also when the final verdict completes and that report comes.....keep it smooth"
**A:** Configured Framer Motion's `<AnimatePresence mode="wait">` wrapper in `app/page.tsx` to orchestrate transitions between layout states. When the research verdict resolves, the centered timeline smoothly crossfades (fades out and slides up) before the complete executive dashboard dashboard fades in and rises, eliminating all layout snaps.

### [Turn 51] Waterfall Progress Path Timeline
**U:** "now I got an idea that when showing that whole agent trace thingy......lets make it more interactive........lets make it look like a waterfall......one step leadss to another in an animated manner"
**A:** Designed a flowing waterfall timeline: added a track container with a glowing progress line (`bg-accent` + shadow glow) that dynamically "flows" down the timeline based on active and completed nodes. Configured branch line borders to glow softly during sub-query execution to indicate the flow of active research.

### [Turn 52] Staggered Slab Staircase/Waterfall Layout
**U:** "naah like this each step is a slab....one completes it leads to another"
**A:** Redesigned `AgentTrace` to display a Gantt-style diagonal stair-step waterfall layout. Replaced the vertical progress bar with a horizontal tracker line at the top, followed by a series of glowing rounded cards ("slabs") for each pipeline step. Slabs cascade diagonally (planning starting left, researching indented 16%, analyzing 32%, and verdict 48% on desktop) with responsive styling for smaller viewports.

### [Turn 53] Multi-Variant Agent Trace Layouts
**U:** "naah not for the agent trace we have in report"
**A:** Refactored `AgentTrace` to support dual layout variations: `variant="staircase"` and `variant="vertical"`. Kept the wide diagonal staircase waterfall view strictly for the full-width loading screen, and reverted the final report's sidebar component to the clean, space-saving vertical timeline tracker layout to fit perfectly within the 320px column.

### [Turn 54] Transition Buffer Delay (Delightful Progress Pause)
**U:** requested slowing down the transition to the final report so users have time to see the completed trace fully resolved instead of snapping instantly to the finished report.
**A:** Introduced a `showReport` transition hook with a 2-second visual delay buffer in `app/page.tsx`. When the research finishes and `state.verdict` is populated, the full staircase timeline displays completed at 100% with a compilation message at the bottom (`✓ Research complete. Compiling final dashboard...`) for exactly 2 seconds before fading out and smoothly crossfading into the final executive report.

### [Turn 55] Crimson Red Theme Adjustments
**U:** "add a hint of dark red in the orangish we have in UI"
**A:** Shifted the main accent color profile to a deeper cherry crimson red: updated `--accent` to `#c41a0d` (RGB: 196, 26, 13) and `--accent-600` to `#9e1106` in `globals.css` and `decision.ts`. Standardized all hardcoded color hex values and rgba drops shadow calculations inside `globals.css`, `decision.ts`, and `AgentTrace.tsx` to match the new crimson red theme.

### [Turn 56] Fixed Sidebar Progress Line Overflow (Segmented Timeline)
**U:** "what is this.fix the last node" (referring to the vertical progress track line extending past the last node in the final report)
**A:** Refactored the vertical timeline layout inside `AgentTrace` to construct the progress track line segment-by-segment inside each list item, rather than as a single full-length background container. If the item is the final node (index 3), no track segment is rendered, preventing the progress line from ever extending past the last status dot.

### [Turn 57] Expanded Waterfall Layout (Removed Congestion)
**U:** "span it from left to right why so congested" (referring to the narrow width of the staircase layout during loading)
**A:** Enlarged the active research loading state's container width in `app/page.tsx` from `max-w-xl` (576px) to a spacious `max-w-5xl` (1024px). Removed hardcoded query text constraints inside `AgentTrace.tsx` by changing `max-w-[110px]` to `max-w-[160px] md:max-w-none flex-1`, letting the Gantt-style staircase waterfall expand freely across the screen without truncating queries.

### [Turn 58] Deep Fixed Sidebar Progress Line Tail Segment
**U:** "in the final remove why the pipeline is broken"
**A:** Corrected the vertical segment structural CSS. Previously, the segment track containers were nested inside the status dot wrapper, whose height was constricted by its content. Lifted the segment absolute tracks out of the dot wrapper and directly into the parent relative `li` container. Now `bottom-0` anchors exactly to the `li` bottom boundary, enabling the progress line segments to perfectly stretch and bridge the exact gap to the next dot without coming up short.

### [Turn 59] Central Vertical Waterfall Layout (Total Revamp)
**U:** "naah I dont like this UI at all.....do something different" (referring to the horizontal staircase design in the loading state)
**A:** Scrapped the horizontal block layout for the loading state entirely. Built a majestic **Central Vertical Waterfall** layout (`variant="waterfall"`). Instead of spreading across columns, the loading trace is now centered in a wide `max-w-3xl` container. Steps animate downwards as large, premium glassmorphic slabs (`text-lg`). Crucially, when the agent enters the "Research" phase, the spawned search queries dynamically cascade vertically downwards out of the research block, using Framer Motion's `layout` properties to smoothly push the content below them out of the way. This perfectly matches the app's minimalist monochrome-and-crimson aesthetic.

### [Turn 60] Compressed Waterfall Spacing
**U:** "see its a loading animation I wan to see all in the same screen withpout scroll........so fix it"
**A:** Compressed the overall vertical footprint of the new Central Waterfall layout. Reduced the global top/bottom padding (`py-12` -> `py-4`), shrunk the glassmorphic slab inner paddings, reduced the gaps between steps, and scaled down the typography of the search queries to `text-xs`. This ensures the entire 4-step sequence and its dynamic cascading queries fit comfortably within a standard viewport height without pushing content below the fold.

### [Turn 61] Pipeline Logic and Autoscroll
**U:** "why we have so much of gap on top......also you see the inconsistency...one pipeline not completed and second started.......fix it........also if all the pipeline can not appear in the same page then autoscroll as the animation goes"
**A:** Fixed three key layout issues simultaneously:
1.  **Removed Top Gap:** Removed the heavy padding above the trace (`py-10` in `page.tsx` reduced to `pt-2 pb-10`), moving the UI closer to the top navigation for better space utilization.
2.  **Fixed Pipeline Leakage:** Adjusted the vertical red tracking lines. Previously, they grew to 50% height while a step was executing. Now, they strictly remain at `0%` until their parent step is completely `done`, ensuring the progress line accurately reflects task completion and doesn't prematurely drop into unstarted territory.
3.  **Dynamic Autoscroll:** Implemented a `useEffect` observer inside `AgentTrace.tsx`. While the trace is active, it seamlessly smooth-scrolls the browser window to the bottom of the page as new cascading searches push the height downwards, keeping the live action centered.

### [Turn 62] Report Auto-Scroll to Top
**U:** "when that animation finishes then the report page appears where the vertical auto scroll was left"
**A:** Added a `useEffect` hook in `page.tsx` that observes the `showReport` state. When the trace animation completes and `showReport` toggles to true, the browser instantly triggers `window.scrollTo({ top: 0, behavior: "smooth" })`, ensuring the user is positioned perfectly at the top of the final dashboard rather than stranded at the bottom from the previous waterfall auto-scroll.

### [Turn 63] Smoothed Waterfall Animations
**U:** "keep the animation more smooth.....it just feels like its too quick"
**A:** Softened and slowed down the Framer Motion physics throughout the waterfall loader:
1. Increased the `delay` stagger for the step slabs (from `0.15s` to `0.2s`) and reduced the spring `stiffness` (from `100` to `60`) with higher `damping` (`15`). This prevents the blocks from popping in abruptly and gives them a slow, premium slide.
2. Increased the `duration` of the red vertical progress line from `0.8s` to `1.2s`, making it feel like a smooth, slow-drawing laser connecting the steps.
3. Added softer `easeInOut` transitions (`0.5s`) for the height expansion of the search block, and applied gentler spring physics (`stiffness: 70, damping: 15`) to the cascading layout animations of the individual search queries as they slide downwards.

### [Turn 64] Debounced Autoscroll
**U:** "that auto vertical scrolll thingy.....it just jumps...keep it smooth"
**A:** Fixed the stuttering autoscroll caused by rapid state updates (e.g., when 6 searches fire at once, triggering 6 immediate smooth-scrolls that fight each other). Implemented a debounce (`setTimeout` of `200ms`) inside the `useEffect` hook in `AgentTrace.tsx`. This slight delay allows the rapid Framer Motion height changes to coalesce and begin animating before triggering a single, clean `window.scrollTo`, resulting in a perfectly fluid scrolling glide.

### [Turn 65] Minimal Horizontal Pipeline Loader
**U:** "okay leave it.......keep a horizontal pipeline with no expanaded text for nonee.......just a simple loading for the final report"
**A:** Scrapped the vertical waterfall UI entirely. Implemented a minimalist `horizontal` variant in `AgentTrace.tsx`. This new layout arranges the 4 tracking dots in a clean horizontal flex-row, completely hides the expanding search queries and step details, and connects the dots with horizontal `w-full` progress lines. Removed the autoscroll logic since the horizontal loader is fully static and never expands out of bounds. Switched `page.tsx` to mount `<AgentTrace variant="horizontal" />`.

### [Turn 66] Horizontal Pipeline Spacing
**U:** "now all this looks so compact add some gap"
**A:** Increased the vertical breathing room around the new horizontal pipeline loader. Pushed the entire component section down by changing top padding from `pt-8` to `pt-16` and bottom padding from `pb-4` to `pb-12`. Additionally, doubled the margin gap between the tracking dots and their step labels below them (from `mt-4` to `mt-8`) so the text doesn't feel cramped against the progress bar.

### [Turn 67] Fixed Horizontal Pipeline Overhang
**U:** "why do we have line bbefore and after first and last nodes??"
**A:** Fixed the overhanging gray background lines. Previously, a single absolute `bg-white/10` track spanned the entire width of the container, causing it to poke out past the first and last step dots (since `flex-1` adds padding around them). Removed the global line and instead rendered the `bg-white/10` track specifically inside the connecting segments between the dots, ensuring the inactive gray line exactly matches the geometry of the active red line without overhanging.

### [Turn 68] Minimalist Loader Cleanup
**U:** "look at the page ....I dont like way agent  trace is writeen and why the pieline is so close to it.....also research complete.....I dont like that as well"
**A:** Stripped away all redundant text from the loading phase to achieve absolute minimalism. Removed the "AGENT TRACE" `h3` heading from `AgentTrace.tsx` completely, allowing the horizontal pipeline to stand alone beautifully in the center of the screen. Also removed the flashing red "RESEARCH COMPLETE. COMPILING FINAL DASHBOARD..." text from `page.tsx`. Now, when the pipeline hits 100%, it simply rests on the final red dot for 2 seconds before seamlessly transitioning to the final report, with no unnecessary flashing text.

### [Turn 69] Centered Loader with Telemetry Header
**U:** "keep agent trace...but write it in a better manner......also that pieline thingy keep it in the middle of screen"
**A:** Completely transformed the loading screen presentation. Vertically centered the entire loading module in `page.tsx` by setting the container to `min-h-[60vh]` with `justify-center`. Brought back the "Agent Trace" header in `AgentTrace.tsx`, but upgraded it to a premium layout: it now features a glowing, pulsing "Live Telemetry" crimson badge, and elegant, wide-tracked typography flanked by subtle lines.

---

## Backfill — functional/correctness work (recorded in Turn 75)
> These engineering changes happened among the UI-polish turns above but weren't captured live
> (the transcript was being extended in parallel for the visual work). Logged here so the graded
> transcript stays complete and faithful.

### [Turn 70] Reproducibility — deterministic scoring
**U:** showed two runs of the same company with the *same* displayed weighted score but opposite
verdicts (HOLD vs INVEST). "Why a different answer for the same company?"
**A:** The company sat right on the 6.5 INVEST threshold; LLM temperature nudged the real composite
across it (6.4x → HOLD vs 6.5x → INVEST), and the UI rounds to 1 decimal so both *showed* 6.5. Fix:
set **plan + analyze to temperature 0** in `graph.ts` → identical evidence → identical scores → a
stable verdict. Decide stays at 0.3 (wording only; verdict is computed from scores). Documented the
reproducibility-vs-freshness trade-off (decisions log, Session 6).

### [Turn 71] Conviction varies run-to-run on high-news companies
**U:** "Tesla gave 73 one time, 80 the next — why?"
**A:** Explained the residual variance after temp 0: (1) **live web data changes** (Tesla's huge daily
news flow → different sources each run → different scores); (2) **Groq isn't bit-deterministic** even
at temp 0 (no seed); (3) the conviction formula amplifies small composite shifts (~0.7 score → ~7
conviction points). The *verdict* stayed INVEST both times — only the confidence dial moved. Offered
optional stabilizers (round conviction / show a band / cache per company); left as documented behavior.

### [Turn 72] Proactive bug audit
**U:** frustrated that avoidable defects were reaching them.
**A:** Switched to a proactive audit (agent core + hook + search + scoring). Fixed two real bugs:
**(1)** stuck "Researching…" forever when the stream ends without a terminal event → safety net in
`useResearchAgent` finalizes to done/error; **(2)** a **duplicate category** from the LLM skewing the
weighted composite + duplicate UI row → dedupe scores per category in `analyzeNode`. Confirmed safe:
empty/failed searches, missing keys, empty input, empty bull/bear/risks/sources, missing categories,
rate-limit retries. Saved a standing "rigor" instruction.

### [Turn 73] Agent-trace per-step outcome lines
**U:** "in agent trace why is only one step expanded?"
**A:** Clarified it's by design — only Research fans out into sub-searches. Balanced it by adding a
one-line outcome under the other steps (`stepDetail`): Plan → "N research questions", Analyze →
"Scored 6 factors · evidence high", Decide → "INVEST · conviction 77/100".

### [Turn 74] Streaming resilience — abrupt-drop fix + production design (interview Q)
**U:** asked how the frontend manages the stream, what happens if the connection drops mid-"Analyzing",
and how to architect it for production.
**A:** Current design = fold over SSE events into one in-memory React state via a pure `reduce()`; the
run is 1:1 coupled to a single HTTP request; no persistence/reconnect. Found a real gap: the read loop
wasn't in try/catch, so an **abrupt drop (`reader.read()` throws) froze the UI on "Analyzing" forever**.
**Fixed:** wrapped the loop so a mid-stream drop falls through to the safety net → clean retryable error
with the partial trace preserved. Production design given: durable background worker + **LangGraph
checkpointer** (Postgres/Redis), a **persisted per-run event log** with monotonic IDs, a **resumable
subscription** (native SSE + `Last-Event-ID` replay / WebSocket-with-resume / Vercel resumable streams),
and a **client snapshot** (localStorage keyed by `runId`) with an idempotent reducer + backoff reconnect.
Noted Vercel's 60s function cap as a forcing function. → strong "what I'd improve" README item.

### [Turn 75] Docs audit & backfill
**U:** "are you maintaining the docs?"
**A:** Honest check: the decisions log was current, but the transcript (extended in parallel with
UI-polish turns 33–69) had lost the functional turns above — including a previously-logged
reproducibility entry that got overwritten. Backfilled Turns 70–74 so the graded transcript is complete
and faithful again. Reaffirmed the standing rule to log functional changes immediately, not only UI ones.

### [Turn 76] Interview Q — structured-output enforcement & anti-hallucination guardrails
**U:** asked how we enforce the strict 6-factor structured output, and how we'd stop the LLM from
hallucinating scores/evidence for obscure, low-data startups at scale.
**A:** Explained enforcement in 3 layers: (1) framework (categories + weights + threshold) is **code,
not the model's choice** — the LLM only scores; the verdict is deterministic; (2) **Zod-validated
schema** — `dimensions[].name` is an enum locked to the 6 names, scores bounded, run via
`withStructuredOutput(jsonMode)` + `jsonSchemaHint` so shape is guaranteed at the parse layer;
(3) **LangGraph decomposition** — the `analyze` node has one job against one strict schema.
For anti-hallucination, described what's built (prompt gives a non-fabricating "out": score ~4–5 +
flag missing evidence; `dataQuality:low` hard-caps conviction; cited real sources; deepen loop) and
the honest gap (no hard groundedness check). Documented the production guardrails to add (see decisions
log, Session 7): faithfulness/grounding verifier node, **per-factor citation enforcement +
`hasEvidence`**, an explicit **"INSUFFICIENT DATA" abstention path**, a **retrieval relevance/entity
gate** (Tavily pads results with off-entity pages), numeric-claim verification, self-consistency/critic,
and observability + offline groundedness evals. No code change — captured as "what I'd improve."

### [Turn 77] Interview Q — streaming partial structured data (drop-off on long analyze)
**U:** Given a 30–45s analyze step and a hypothetical 40% drop-off, how would we stream *partial
structured data* (e.g. radar building dimension-by-dimension) instead of waiting for the whole JSON,
and what React patterns/libs handle incomplete streaming JSON without crashing?
**A:** Current behavior: `analyze` uses `withStructuredOutput(...).invoke()` → awaits the whole JSON →
one `analysis` event → everything renders at once after the slowest step. Fix = stream *inside* the
analyze step. Technique: token stream → **partial JSON parse** → `DeepPartial` snapshots forwarded as
`analysis-partial` SSE events. Backend options: LangChain `.stream()` (incremental JSON parser) or
**Vercel AI SDK `streamObject`** (`partialObjectStream` of `DeepPartial<T>`, repairs partial JSON
internally). Never `JSON.parse` a partial — use `partial-json`/AI SDK; only strict-`Zod.parse` the
final. Frontend: hold `DeepPartial<Analysis>`, defensive components (`?? []`, guard every field), the
radar already tolerates missing dims (maps fixed CATEGORIES, `?? 0`) so vertices animate 0→value as
they arrive; React patterns = `experimental_useObject` (AI SDK hook) or `useState`+reducer,
`useDeferredValue`/`startTransition` + rAF batching to coalesce token bursts, Framer Motion
`layout`/`AnimatePresence` keyed by category, typewriter the rationales, optimistic skeleton rows.
Nuance specific to us: the verdict is computed from the *full* weighted score, so stream the
factors/radar/rationales as build-up and **resolve the verdict as the finale** (a running provisional
composite would mislead by flipping). No code change — captured as a perceived-performance improvement.

### [Turn 78] Interview Q — paywalled/blocked sources & empty-content handling
**U:** In finance, the best data is behind paywalls (Bloomberg/WSJ) or blocks scrapers. If the top
results are all paywalled/blocked, how does the agent handle empty content gracefully without crashing
or fabricating?
**A:** Key design point: **we don't run our own scraper** — Tavily (managed retrieval) fetches/extracts
server-side, so we never see raw 403s; a paywalled page yields a **thin/empty `content`** snippet, not a
crash. Plus `searchWeb` try/catch → `[]` on failure, and `formatEvidence` handles the empty case
("No evidence was retrieved.") — so no crash. Hallucination containment: prompt scores thin factors ~4–5
+ flags missing evidence; `dataQuality:low` caps conviction; deepen loop re-queries (often hits
non-paywalled Crunchbase/IR/forums). Honest gaps: Tavily teasers can be misleading and we don't *detect*
paywall stubs; with empty text the LLM could still lean on title/URL/memory. Production handling
(decisions log, Session 9): detect/filter thin+paywall content; measure **real content coverage** (not
URL count) for dataQuality/deepen; **prefer free primary sources** (SEC EDGAR filings, IR pages,
earnings transcripts, Crunchbase, Yahoo) over paywalled journalism; **license** Bloomberg/Refinitiv
rather than circumvent (ToS/legal); explicit **"INSUFFICIENT DATA — sources paywalled"** abstention +
transparency banner; groundedness verifier as backstop. No code change.

### [Turn 79] README + missing-dependency fix + production build verified
**U:** "write the best README mentioning all the important points from the assignment."
**A:** Before writing, audited deps and **caught a real bug**: `page.tsx`/`PrintReport.tsx` import
`jspdf` and `dom-to-image-more` (the PDF export) but **neither was installed or in `package.json`** —
a fresh `npm install && npm run build` would have failed for a grader (dev server only worked off a
stale compile). Installed both (saved: `jspdf ^4.2.1`, `dom-to-image-more ^3.10.0`). Wrote a full
`README.md` with all 7 required sections (Overview, How to run + env, How it works + architecture/
diagram/6-factor table, Key decisions & trade-offs, Example runs [Nvidia/Zomato/Boult/Zentary], What
I'd improve, BONUS pointer to the transcript/decisions/principles docs) + tech stack + project
structure. **Verified `npm run build` passes cleanly** (compiled, TS OK, routes generated) — the app is
deploy-ready. Noted: `docs/` lives at repo root (one level above the app), so the submission zip must
include it; rotate keys before submitting.

### [Turn 80] Deployed to Vercel (bonus)
**U:** "let's deploy."
**A:** Drove the Vercel deploy after the user did the one-time `vercel login`. Linked the project
under team scope `codexs-projects-74a35d9b/investment-research-agent` (Hobby). Set the three
production env vars from `.env.local` **piped via stdin so the key values never appeared in any
command** (`GROQ_API_KEY`, `TAVILY_API_KEY`, `GROQ_REASONING_MODEL=llama-3.1-8b-instant`); confirmed
encrypted in Production. `vercel --prod` built remotely (31s) and deployed READY. Live + verified
(HTTP 200, renders "Altair"): **https://investment-research-agent-virid.vercel.app** — added to the
README's Live demo line.
**⚠️ Sequencing note for submission:** the deployed env vars hold the *current* keys. If keys are
rotated for transcript safety, the **Vercel env vars must be updated with the new keys + redeploy**,
or the live demo breaks.

*(appended live as code is written, tested, and deployed)*
