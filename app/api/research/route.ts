import type { NextRequest } from "next/server";
import { agentGraph } from "@/lib/agent/graph";
import type { AgentEvent } from "@/lib/agent/events";

/**
 * POST /api/research  { company: string }
 *
 * Runs the LangGraph agent and streams its trace to the browser as Server-Sent
 * Events (one `data: <json AgentEvent>` line per event). The agent's nodes emit
 * those events via `config.writer`, which LangGraph surfaces in `streamMode: "custom"`.
 * Streaming (not a single JSON response) is what powers the live "show your work" UI.
 */

// LangGraph + the Groq/Tavily SDKs need the Node.js runtime (not Edge).
export const runtime = "nodejs";
export const maxDuration = 60;

// Turn raw provider errors into a clear, human message for the UI.
function humanizeError(err: unknown): string {
  const e = err as { status?: number; message?: string; error?: { error?: { message?: string } } };
  const msg = e?.error?.error?.message || e?.message || "";

  if (e?.status === 429 || /rate.?limit|tokens per|TPD|TPM|RPM|RPD/i.test(msg)) {
    const m = msg.match(/try again in ([0-9hms.]+)/i);
    const when = m ? m[1] : "";
    const perDay = /per day|TPD|RPD/i.test(msg);
    if (perDay) {
      return `Groq's free daily token limit is exhausted (it resets automatically).${when ? ` ~${when} to go.` : ""} A fresh Groq account or the paid tier removes the cap.`;
    }
    // per-minute (TPM/RPM) — a brief, self-healing blip
    return `Hit Groq's per-minute rate limit (too many tokens this minute).${when ? ` Just wait ~${when} and try again.` : " Wait a few seconds and try again."}`;
  }
  if (/GROQ_API_KEY/i.test(msg)) return "Missing GROQ_API_KEY — add it to .env.local and restart.";
  if (/TAVILY_API_KEY/i.test(msg)) return "Missing TAVILY_API_KEY — add it to .env.local and restart.";
  return msg || "Unexpected error while researching this company.";
}

export async function POST(req: NextRequest) {
  let company = "";
  try {
    const body = await req.json();
    company = String(body?.company ?? "").trim();
  } catch {
    /* fall through to the empty-company guard */
  }

  if (!company) {
    return Response.json({ error: "A company name is required." }, { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: AgentEvent) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));

      try {
        const events = await agentGraph.stream(
          { company },
          { streamMode: "custom" }
        );
        for await (const event of events) {
          send(event as AgentEvent);
        }
        send({ type: "done" });
      } catch (err) {
        console.error("[/api/research] error:", err);
        send({ type: "error", message: humanizeError(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
