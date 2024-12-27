import { z } from "zod";

/**
 * Why this exists:
 * Groq + Llama can fail in *function-calling* structured-output mode — the model
 * emits a `<function=name>{...}` wrapper that Groq's tool parser rejects, even
 * when the JSON inside is perfectly valid (error: `tool_use_failed`).
 *
 * The reliable path on Groq is **JSON mode**: force `response_format: json_object`,
 * describe the target shape in the prompt, then parse + validate with Zod ourselves.
 * `withStructuredOutput(schema, { method: "jsonMode" })` sets the response_format;
 * we supply the schema hint below so the model knows the exact shape to return.
 */
export function jsonSchemaHint(schema: z.ZodType, name: string): string {
  const json = JSON.stringify(z.toJSONSchema(schema), null, 2);
  return [
    `Respond with a single valid JSON object for "${name}" that conforms exactly to`,
    `this JSON schema. Output ONLY the JSON — no prose, no markdown, no code fences.`,
    ``,
    `JSON schema:`,
    json,
  ].join("\n");
}
