import { ChatGroq } from "@langchain/groq";

/**
 * LLM factory (Groq — blazing-fast open-source inference).
 *
 * The provider lives behind these two helpers so the graph never imports a
 * provider directly — swapping providers later is a one-file change.
 *
 * - `reasoningLLM` → the heavier model for analysis, where reasoning quality
 *   matters most.  Default: llama-3.3-70b-versatile (12 000 TPM on free tier).
 * - `fastLLM`      → cheap & quick for planning + verdict narrative.
 *   Default: llama-3.1-8b-instant (separate 6 000 TPM bucket).
 *
 * Splitting across two model sizes means their per-minute token buckets are
 * independent, so a full run (plan on 8B + analyze on 70B + decide on 8B)
 * fits comfortably without pacing delays.
 */

const REASONING_MODEL =
  process.env.GROQ_REASONING_MODEL || "llama-3.3-70b-versatile";
const FAST_MODEL =
  process.env.GROQ_FAST_MODEL || "llama-3.1-8b-instant";

function assertKey() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error(
      "GROQ_API_KEY is missing. Add it to .env.local (see .env.example)."
    );
  }
}

// Keep retries low (1) — on the free tier, a 429 retry storm just compounds
// the problem. One gentle retry handles transient blips; anything worse should
// surface to the user immediately.
const MAX_RETRIES = 1;

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
