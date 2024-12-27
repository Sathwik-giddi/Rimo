# Product Principles — derived from InsideIIM / AltUni Labs (Ayana)

> Source: a deep-research pass (5 search angles → 15 sources → 50 claims → 25 adversarially
> verified 3-0 → 11 findings). All evidence is first-party (insideiim.com, ayana.insideiim.com,
> about-us, careers). These are the principles our Investment Research Agent must follow so it
> reads as an InsideIIM/AltUni product, not a generic LLM demo.

## The one pattern that defines their products
**Take a messy real-world entity → benchmark it against a large corpus of real outcomes →
return a confident, reasoned, _tiered_ recommendation a human can act on.** Not raw data.
Not an open chatbox. Ayana does this for MBA aspirants; we do it for companies.

## What Ayana actually does (the template)
- Input raw, messy signal (exam section scores + profile).
- **Slot-wise normalization** + a **Profile Score** (Academics + Work Ex + Diversity).
- **Holistic/demographic reasoning** ("a Non-Engineer Female may get a call at a lower percentile
  than a General Engineer Male") — multiple signals combined, not one number.
- Output a **three-tier recommendation**: **Safe** (high probability) / **Practical-Reach**
  (profile + ROI aligned) / **Ambitious-Dream** (a fighting chance, needs a stellar case).
- Delivered as **discrete modules in a linear pipeline** (Percentile → Recommends → Finder →
  Profile Analyzer → Interview Prep → Tracker), each a focused tool — *not* one chat window.
- **Sequential numbered UX**: Step 1 → Step 2 → Step 3.

## How they build trust
Data-scale ("trained on 100,000+ real MBA success stories"), social proof (4.8/5, 100k+ users),
holistic reasoning, authority branding ("India's Most Trusted…"). **Gap we can exploit:** Ayana
discloses *no citations or methodology*. **Transparency + cited sources is our deliberate
upgrade** — same trust DNA, but we *show our work*.

## Voice & values
- Mission: **"We make AI that makes humans better." "From Aspiration to Outcomes."** AI as
  augmentation toward measurable outcomes, not replacement.
- Tone: warm, first-person, encouraging, **outcome- and action-oriented** ("Hi! I'm Ayana…").
- Values in practice: **Ownership** (ship with pace), **Kind Candor** (honest, caring feedback),
  **Speed** (test with real users, measure, iterate), **Craft** ("treat problems like products").
- Tech signal: Ayana ships as a **React/Vite SPA** on its own subdomain. (Their AI architecture
  is not public — LangChain/Gemini/Livekit are unconfirmed, so we choose our own and defend it.)

---

## → Translation to our AI Investment Research Agent (the 7 principles we build to)

| # | InsideIIM/Ayana principle | How our agent implements it |
|---|---------------------------|------------------------------|
| 1 | **Decide & tier, don't dump** | Output a clear **verdict** with a conviction tier: **INVEST / HOLD / PASS** + a 0–100 conviction score (mirrors Safe / Practical-Reach / Ambitious-Dream). |
| 2 | **Benchmark against a corpus** | Research the company **vs. its sector/peers & recent reality** — not abstract opinion. State the comparison. |
| 3 | **Holistic multi-signal reasoning** | Analyze across explicit dimensions (business/moat, financial signals, recent news, risks, sentiment) and **combine** them — like Ayana's profile score. |
| 4 | **Transparency as our edge** | Unlike Ayana, **cite every source**; expose the research trace and a **bull case / bear case**. Show *why*, not just *what*. |
| 5 | **Modular pipeline, not a chatbox** | A staged **LangGraph** agent: Plan → Research → Analyze → Decide, surfaced as **numbered live steps** the user watches. |
| 6 | **Warm, outcome-focused voice** | First-person analyst tone; end with a clear, **actionable takeaway**, not a hedge. Honest about gaps (Kind Candor). |
| 7 | **Craft + Speed** | Polished React/Next + Tailwind UI that **streams the agent thinking live**; fast, clean, "production-grade" (the JD's words). |

**North-star one-liner:** *"Ayana, but it researches a company and tells you Invest, Hold, or
Pass — and unlike Ayana, it shows its sources."*
