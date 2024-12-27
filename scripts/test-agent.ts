/**
 * Dev smoke-test for the agent graph (run outside Next.js).
 *
 *   npx tsx scripts/test-agent.ts "Stripe"
 *
 * Loads .env.local, runs the graph with streaming, and prints the live trace
 * plus the final verdict. Lets us verify Groq + Tavily + LangGraph end-to-end
 * before wiring the API/UI.
 */
import fs from "node:fs";
import path from "node:path";

// Load .env.local into process.env BEFORE importing modules that read keys.
const envPath = path.join(process.cwd(), ".env.local");
for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].trim();
}

const company = process.argv[2] || "Stripe";

async function main() {
  const { agentGraph } = await import("../lib/agent/graph");

  console.log(`\n🔎 Researching: ${company}\n${"─".repeat(50)}`);

  const stream = await agentGraph.stream(
    { company },
    { streamMode: ["updates", "custom"] }
  );

  let verdict: Record<string, unknown> | undefined;
  let analysis: Record<string, unknown> | undefined;

  for await (const [mode, chunk] of stream as AsyncIterable<[string, unknown]>) {
    if (mode !== "custom") continue;
    const e = chunk as Record<string, unknown>;
    if (e.type === "node-start") console.log(`\n▶ ${e.label}`);
    else if (e.type === "search-start") console.log(`   · searching: ${e.query}`);
    else if (e.type === "search-done") console.log(`     ↳ ${e.count} sources`);
    else if (e.type === "plan")
      console.log(`   questions: ${JSON.stringify((e.plan as { questions: string[] }).questions)}`);
    else if (e.type === "analysis") analysis = e.analysis as Record<string, unknown>;
    else if (e.type === "verdict") verdict = e.verdict as Record<string, unknown>;
  }

  console.log(`\n${"─".repeat(50)}\n🏁 VERDICT for ${company}:\n`);
  console.log(`   Decision  : ${verdict?.decision}  (conviction ${verdict?.conviction}/100)`);
  console.log(`   Thesis    : ${verdict?.thesis}`);
  console.log(`   Bull      : ${(verdict?.bullCase as string[])?.join(" | ")}`);
  console.log(`   Bear      : ${(verdict?.bearCase as string[])?.join(" | ")}`);
  console.log(`   DataQual  : ${analysis?.dataQuality}`);
  console.log(`\n✅ Done.\n`);
}

main().catch((err) => {
  console.error("\n❌ Agent run failed:\n", err);
  process.exit(1);
});
