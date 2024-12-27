/**
 * Proves the sources are real: runs ONE Tavily search (no LLM) and prints the
 * actual URLs returned.  npx tsx scripts/test-search.ts "Zomato latest results"
 */
import fs from "node:fs";
import path from "node:path";

for (const line of fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].trim();
}

const query = process.argv.slice(2).join(" ") || "Zomato latest financial results";

async function main() {
  const { searchWeb } = await import("../lib/agent/search");
  const sources = await searchWeb(query, { maxResults: 5 });
  console.log(`\nQuery: "${query}"  →  ${sources.length} real sources:\n`);
  for (const s of sources) {
    console.log(`• ${s.title}`);
    console.log(`  ${s.url}`);
    console.log(`  score ${s.score.toFixed(2)} · "${s.content.slice(0, 90)}…"\n`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
