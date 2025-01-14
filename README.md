# Rimo — AI Investment Research Agent

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![LangGraph](https://img.shields.io/badge/LangGraph.js-state--machine-7c3aed?logo=langchain)](https://langchain-ai.github.io/langgraphjs/)
[![Groq](https://img.shields.io/badge/Groq-Llama-FF4D00)](https://groq.com)
[![Tavily](https://img.shields.io/badge/Tavily-Web%20Search-0B3D91)](https://tavily.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

> **Rimo** (formerly *Altair*) is an autonomous research agent that analyzes **any** company — from a
> public giant to an unknown startup — against the live web, scores it on a fixed six-factor
> framework, and delivers a clear **Invest / Hold / Pass** verdict with full reasoning, a
> confidence level, and every source cited.

It is an **agent**, not a chatbot. Each run streams its internal process live: **plan → research → analyze → decide** — then lands on a dashboard with a conviction gauge, a radar chart of the six factors, a bull-vs-bear breakdown, and clickable sources.

---

## Highlights

- **Decide, don't dump** — commits to a verdict and thesis instead of a wall of text.
- **Cited & verifiable** — every claim traces to a real source surfaced in the UI.
- **Honest uncertainty** — confidence is hard-capped by data quality; low-information companies are never over-sold.
- **Anti-hallucination guardrail** — a gibberish or non-existent name returns an honest *"company not found"*, never a fabricated verdict.
- **Works for any company size** — a reflect-and-retry deepen loop gives small/unlisted startups a fair shot.
- **Transparent decisions** — Invest/Hold/Pass is a deterministic weighted rule, not an opaque LLM whim.

## Tech Stack

**Next.js** (App Router) · **React 19** · **TypeScript** · **LangGraph.js** + **LangChain core** · **Groq** (Llama 3.3 70B / 3.1 8B) · **Tavily** (web search) · **Zod** (structured output) · **Tailwind CSS** · **Framer Motion** · hand-built **SVG** charts (no chart library).

---

## Quick Start

### Prerequisites

- **Node.js 18.18+** (developed on Node 24)
- Two free API keys — no credit card required:
  - **Groq** — LLM provider → <https://console.groq.com/keys> (`gsk_...`)
  - **Tavily** — web search → <https://app.tavily.com> (`tvly-...`)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your local env file from the template
cp .env.example .env.local
```

Open `.env.local` and fill in your keys:

```bash
GROQ_API_KEY=gsk_your_key_here
TAVILY_API_KEY=tvly_your_key_here

# Optional model overrides:
# GROQ_REASONING_MODEL=llama-3.3-70b-versatile   # analysis (quality)
# GROQ_FAST_MODEL=llama-3.1-8b-instant           # planning / narrative
```

### Run

```bash
npm run dev          # dev server → http://localhost:3000
# or
npm run build && npm start   # production build
```

Open **http://localhost:3000**, type a company name (or click an example), and hit **Analyze**. A full run takes ~20–40 seconds — the agent performs several live web searches plus multi-step LLM reasoning.

> **Free-tier notes:** Groq's free tier has per-minute and per-day token limits. The app handles these gracefully (clear messaging + automatic retries on transient limits). If the daily cap is hit from heavy testing, wait for reset or set `GROQ_REASONING_MODEL=llama-3.1-8b-instant` — each Groq model has its own daily bucket.

---

## How It Works

### The agent: a LangGraph state machine

The core is a **LangGraph.js** graph (`lib/agent/graph.ts`) — an explicit, inspectable, streamable state machine:

```
            ┌─────────────── reflect & retry (if data is thin) ───────────────┐
            │                                                                  ▼
  START ─▶ Plan ─▶ Research ─▶ Analyze ─▶ (dataQuality "low" & not deepened?) ─▶ Deepen ─┐
                                   │                                                      │
                                   └────────────── else ──────────────▶ Decide ─▶ END    │
                                                                           ▲               │
                                                                           └── re-analyze ─┘
```

| Node | Job | Model |
|------|-----|-------|
| **Plan** | Turn the company name into 4–6 targeted, searchable questions; adapts for small/obscure names (founders, funding, reviews) | Llama 3.1 8B |
| **Research** | Run questions through **Tavily** concurrently; collect real sources `{title, url, content, score}` | — |
| **Analyze** | Score the company **0–10 on each of 6 fixed factors** with evidence-based rationale; rate `dataQuality` honestly | Llama 3.3 70B |
| **Deepen** *(conditional)* | If data quality is low, re-research with broader queries and re-analyze (reflect-and-retry loop) | — |
| **Decide** | Write the narrative (thesis, bull/bear, risks); the *decision itself* is computed in code | Llama 3.1 8B |

Every node emits typed progress events (`lib/agent/events.ts`) via LangGraph's stream writer.

### The decision is a transparent rule

The six factors and their weights live in **code** (`lib/agent/framework.ts`), not in the model's hands:

| Factor | Weight | What it evaluates |
|--------|:------:|-------------------|
| Business Fundamentals | 1.0 | business model, revenue mix, customer concentration |
| **Financial Health** | **1.2** | growth, margins, cash flow, debt, liquidity, trends |
| Competitive Moat | 1.1 | market share, brand, switching costs, network effects, IP |
| Industry & Macro | 0.9 | industry growth, regulation, disruption, cycle sensitivity |
| Management & Governance | 0.8 | leadership, insider ownership, capital allocation, red flags |
| Growth Catalysts & Risks | 1.0 | upside drivers vs. downside risks |

1. The LLM **scores** each factor from the evidence.
2. A **weighted average** yields a composite score (0–10).
3. **Threshold rule:** `≥ 7.0 → INVEST · ≥ 5.5 → HOLD · else PASS`.
4. **Conviction** is sized by decisiveness, then **capped by data quality** (`low → 45, medium → 72, high → 95`) — the agent is never falsely confident about a company it could barely research.

The verdict is explainable math; the LLM handles only language and scoring.

### Enforcing structured output

- **Zod schemas** (`lib/agent/schemas.ts`) define every structured output. Factor names are a Zod **enum** locked to the six categories — the model cannot invent a seventh or rename one.
- Outputs run through `withStructuredOutput(schema, { method: "jsonMode" })` plus a JSON-schema hint injected into the prompt (`lib/agent/structured.ts`), then are **Zod-validated** — shape is guaranteed at the parse layer. (JSON mode was chosen over function calling because Llama-on-Groq returned `tool_use_failed` on the function-call envelope.)
- **Reproducibility:** plan + analyze run at **temperature 0**, so identical evidence yields identical scores and a stable verdict.

### Streaming UI

- `app/api/research/route.ts` runs the graph and streams events to the browser as **Server-Sent Events (SSE)**.
- `app/hooks/useResearchAgent.ts` consumes the stream and folds events into a single React state via a pure reducer — driving the live **Agent Trace**, then the dashboard (`VerdictCard`, `ScoreRadar`, `ConvictionGauge`, `Dimensions`, `Sources`). All charts are hand-built SVG, keeping the bundle light.

---

## Project Structure

```
repo/
├─ app/
│  ├─ api/research/route.ts        # streaming SSE endpoint (runs the agent)
│  ├─ hooks/useResearchAgent.ts    # client SSE consumer + reducer
│  ├─ components/                  # VerdictCard, ScoreRadar, ConvictionGauge, Dimensions,
│  │                               #   AgentTrace, Sources, HowItWorks, EvidenceDrawer, PrintReport
│  ├─ page.tsx · layout.tsx · globals.css
├─ lib/agent/
│  ├─ graph.ts        # LangGraph: Plan → Research → Analyze → (Deepen) → Decide
│  ├─ framework.ts    # 6 weighted factors + compositeScore + deriveVerdict (decision rule)
│  ├─ schemas.ts      # Zod schemas + types
│  ├─ llm.ts          # Groq model factory (env-configurable)
│  ├─ search.ts       # Tavily web-search wrapper (degrades gracefully)
│  ├─ structured.ts   # JSON-mode structured-output helper
│  ├─ state.ts        # LangGraph state annotation
│  └─ events.ts       # typed trace events (SSE)
├─ screenshots/       # example outputs
└─ .env.example
```

---

## Key Design Decisions

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| **LangGraph state machine** (vs. a single prompt) | Explicit, inspectable, streamable steps; each node has one job → controllable structured output | More moving parts than a one-shot prompt |
| **Groq + Llama** as the LLM | Free, fast, strong reasoning; native LangChain ecosystem (`ChatGroq`) | Free-tier rate limits (handled gracefully) |
| **Tavily web search** (vs. a financial-data API) | Input is free-text — a stock API returns nothing for private/non-US companies; web search covers any company and yields citable, qualitative signal | Returns snippets, not full filings; external service dependency |
| **Decision = deterministic weighted rule** | Invest/Hold/Pass is explainable math, not an LLM's mood | Linear weighted model is simpler than real investing |
| **Data-quality conviction cap** | An investment tool must never sound more certain than the data allows | — |
| **Not-found guardrail** | A hallucinated verdict for a fake name is worse than useless | A genuinely obscure real company could occasionally be misjudged — mitigated by basing the call on evidence, not the name |
| **Temperature 0 for scoring** | Same company → same verdict; no threshold flipping between runs | Live web data legitimately changes over time |
| **Hand-built SVG charts** | Small bundle, full control, fast on Vercel | More component code |

---

## Example Outputs

> Screenshots live in [`screenshots/`](screenshots). Live web data means exact numbers vary slightly between runs.

| Landing page | Live agent trace |
|---|---|
| ![Landing](screenshots/landing.png) | ![Trace](screenshots/trace.png) |

**Nvidia → INVEST · high conviction** — strong moat (CUDA + ecosystem), excellent financials, dominant AI/GPU position. Bull: data-center growth, software moat, partnerships. Bear: competition (AMD/Intel), customer concentration, regulatory/supply-chain risk.

![Nvidia verdict](screenshots/nvidia.png)

**Zomato (Eternal Ltd) → INVEST · moderate conviction** — strong brand and large user base in a growing market; expansion into quick-commerce. Surfaced the company's own investor-relations PDFs and Moneycontrol as sources. Bear: profitability questions, regulatory risk, competition.

![Zomato verdict](screenshots/zomato.png)

**Boult Audio (small Indian startup) → INVEST · conviction capped** — impressive revenue growth and a clear product niche, but limited public data on margins/cash flow; conviction is deliberately tempered and the verdict says so.

![Boult Audio verdict](screenshots/boult-audio.png)

---

## Roadmap

- **Groundedness verification** — an LLM-as-judge / NLI verifier that checks each rationale against its sources and discards unsupported claims; per-factor citation enforcement and an explicit **"INSUFFICIENT DATA"** abstention when coverage is too low.
- **Source quality & paywalls** — rank by domain authority, prefer free primary sources (SEC EDGAR, investor-relations pages, earnings transcripts), and filter paywalled/blocked stubs so empty content never counts as evidence.
- **Stream partial structured data** — render the radar dimension-by-dimension and typewriter rationales as the LLM generates (`streamObject` / partial-JSON parsing).
- **Production streaming resilience** — durable worker + LangGraph checkpointer, persisted per-run event log, and resumable SSE (`Last-Event-ID` replay).
- **Richer analysis** — valuation lens for public companies (P/E, EV/EBITDA via a financial API), peer benchmarking, and a "borderline" label for coin-flip companies.
- **Evals & observability** — trace every `evidence → score → rationale` to LangSmith/Langfuse and run offline groundedness/hallucination eval sets in CI.

---

## Contributing

Contributions are welcome. Please open an issue first to discuss the change, then submit a pull request.

## Security

The template `.env.example` contains **no real keys** — never commit real API keys. See [SECURITY.md](SECURITY.md) for the security policy.

## License

MIT — see [LICENSE](LICENSE).
