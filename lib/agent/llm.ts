import { ChatGroq } from "@langchain/groq";

/**
 * LLM factory (Groq).
 *
 * The provider lives behind these two helpers, so swapping providers later
 * (OpenAI, Gemini, Anthropic, ...) is a one-file change — the graph never
 * imports a provider directly.
 *
 * - `reasoningLLM`  → Llama 3.3 70B: the heavier model for analysis & the final
 *   decision, where reasoning quality matters most.
 * - `fastLLM`       → Llama 3.1 8B Instant: cheap & quick, for the planning step.
 */

// Models are env-overridable so you can trade quality vs. throughput without code
// changes. Each Groq model has its OWN daily token bucket, so dropping the reasoning
// model to 8B also dodges the 70B bucket when it's exhausted on the free tier.
const REASONING_MODEL = process.env.GROQ_REASONING_MODEL || "llama-3.3-70b-versatile";
const FAST_MODEL = process.env.GROQ_FAST_MODEL || "llama-3.1-8b-instant";

function assertKey() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error(
      "GROQ_API_KEY is missing. Add it to .env.local (see .env.example)."
    );
  }
}

// Auto-retry transient rate limits (Groq honours the Retry-After header), so a
// brief per-minute spike recovers silently instead of surfacing an error.
const MAX_RETRIES = 5;

export function reasoningLLM(temperature = 0.2) {
  assertKey();
  return new ChatGroq({
    model: REASONING_MODEL,
    temperature,
    apiKey: process.env.GROQ_API_KEY,
    maxRetries: MAX_RETRIES,
  });
}

export function fastLLM(temperature = 0.3) {
  assertKey();
  return new ChatGroq({
    model: FAST_MODEL,
    temperature,
    apiKey: process.env.GROQ_API_KEY,
    maxRetries: MAX_RETRIES,
  });
}
