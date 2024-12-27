import { TavilySearchAPIWrapper } from "@langchain/tavily";
import type { Source } from "./schemas";

/**
 * Web search via Tavily — the agent's "eyes" on the live web.
 *
 * We use the low-level API wrapper (not the LangChain tool) on purpose: it hands
 * back structured results ({ title, url, content, score }) that we can render as
 * clickable, citable sources — the transparency edge over a black-box recommender.
 */

let wrapper: TavilySearchAPIWrapper | null = null;

function getWrapper() {
  if (!process.env.TAVILY_API_KEY) {
    throw new Error(
      "TAVILY_API_KEY is missing. Add it to .env.local (see .env.example)."
    );
  }
  wrapper ??= new TavilySearchAPIWrapper({
    tavilyApiKey: process.env.TAVILY_API_KEY,
  });
  return wrapper;
}

export function hasSearch() {
  return Boolean(process.env.TAVILY_API_KEY);
}

export async function searchWeb(
  query: string,
  opts?: { maxResults?: number; topic?: "general" | "news" | "finance" }
): Promise<Source[]> {
  try {
    const res = await getWrapper().rawResults({
      query,
      max_results: opts?.maxResults ?? 4,
      topic: opts?.topic ?? "general",
      search_depth: "basic",
    });
    return (res.results ?? []).map((r) => ({
      title: r.title,
      url: r.url,
      content: r.content,
      score: r.score,
    }));
  } catch (err) {
    // Degrade gracefully: a single failed search shouldn't kill the whole run.
    console.error(`[search] "${query}" failed:`, err);
    return [];
  }
}
