import fs from "node:fs";
import path from "node:path";
import { ChatGroq } from "@langchain/groq";

const envPath = path.join(process.cwd(), ".env.local");
for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].trim();
}
import { z } from "zod";

const TestSchema = z.object({
  answer: z.string(),
});

const model = new ChatGroq({ model: "llama-3.3-70b-versatile", maxRetries: 0 }).withStructuredOutput(TestSchema, { name: "test", method: "jsonMode" });
const fallbackModel = new ChatGroq({ model: "llama-3.1-8b-instant", maxRetries: 0 }).withStructuredOutput(TestSchema, { name: "test", method: "jsonMode" });

const fallbackChain = model.withFallbacks({ fallbacks: [fallbackModel] });

async function run() {
  try {
    const res = await fallbackChain.invoke([
      { role: "user", content: "Say hello and answer something in json." }
    ]);
    console.log("Success:", res);
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
