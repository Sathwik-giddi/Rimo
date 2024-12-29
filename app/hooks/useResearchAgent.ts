"use client";

import { useCallback, useState } from "react";
import type { AgentEvent, NodeName } from "@/lib/agent/events";
import type {
  ResearchPlan,
  Analysis,
  Verdict,
  EvidenceGroup,
} from "@/lib/agent/schemas";

/**
 * Client hook that runs the agent and turns its SSE trace into React state.
 * It opens POST /api/research, reads the event stream, and reduces each
 * `AgentEvent` into a shape the UI can render live (steps, searches, verdict).
 */

export type StepStatus = "pending" | "active" | "done";
export type TraceStep = { node: NodeName; label: string; status: StepStatus };
export type SearchItem = { query: string; count?: number };
export type Phase = "idle" | "running" | "done" | "error";

export type ResearchState = {
  phase: Phase;
  company: string;
  steps: TraceStep[];
  searches: SearchItem[];
  plan?: ResearchPlan;
  evidence?: EvidenceGroup[];
  analysis?: Analysis;
  verdict?: Verdict;
  error?: string;
  notFound?: boolean; // the input wasn't a real, identifiable company
};

const ORDER: NodeName[] = ["plan", "research", "analyze", "decide"];
const DEFAULT_LABEL: Record<NodeName, string> = {
  plan: "Plan the research",
  research: "Research the web",
  analyze: "Analyze the evidence",
  decide: "Reach a verdict",
};

function freshSteps(): TraceStep[] {
  return ORDER.map((node) => ({
    node,
    label: DEFAULT_LABEL[node],
    status: "pending",
  }));
}

function initialState(company = ""): ResearchState {
  return { phase: "idle", company, steps: freshSteps(), searches: [] };
}

// Pure reducer: fold one agent event into the running state.
function reduce(state: ResearchState, event: AgentEvent): ResearchState {
  switch (event.type) {
    case "node-start": {
      const steps = state.steps.map((s) =>
        s.node === event.node
          ? { ...s, label: event.label, status: s.status === "done" ? "done" : "active" as StepStatus }
          : s
      );
      return { ...state, steps };
    }
    case "node-end": {
      const steps = state.steps.map((s) =>
        s.node === event.node ? { ...s, status: "done" as StepStatus } : s
      );
      return { ...state, steps };
    }
    case "search-start":
      return { ...state, searches: [...state.searches, { query: event.query }] };
    case "search-done": {
      const searches = state.searches.map((s) =>
        s.query === event.query && s.count === undefined
          ? { ...s, count: event.count }
          : s
      );
      return { ...state, searches };
    }
    case "plan":
      return { ...state, plan: event.plan };
    case "evidence":
      return { ...state, evidence: event.evidence };
    case "analysis":
      return { ...state, analysis: event.analysis };
    case "verdict":
      return { ...state, verdict: event.verdict };
    case "notfound":
      return { ...state, phase: "error", error: event.message, notFound: true };
    case "error":
      return { ...state, phase: "error", error: event.message };
    case "done": {
      // Don't clobber a terminal error / not-found state with "done".
      if (state.phase === "error") return state;
      const steps = state.steps.map((s) => ({ ...s, status: "done" as StepStatus }));
      return { ...state, phase: "done", steps };
    }
    default:
      return state;
  }
}

export function useResearchAgent() {
  const [state, setState] = useState<ResearchState>(initialState());

  const run = useCallback(async (company: string) => {
    const trimmed = company.trim();
    if (!trimmed) return;

    setState({ ...initialState(trimmed), phase: "running" });

    let res: Response;
    try {
      res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: trimmed }),
      });
    } catch {
      setState((s) => ({ ...s, phase: "error", error: "Could not reach the server." }));
      return;
    }

    if (!res.ok || !res.body) {
      setState((s) => ({
        ...s,
        phase: "error",
        error: `Request failed (${res.status}).`,
      }));
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    // Parse the SSE stream: events are separated by a blank line; each carries
    // one `data: <json>` line. The read loop is wrapped so an abrupt mid-stream
    // drop (spotty network → reader.read() throws) doesn't leave the UI frozen —
    // it falls through to the safety net below, which surfaces a retryable error
    // while keeping whatever partial trace we've already received.
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() ?? "";

        for (const block of blocks) {
          const line = block.split("\n").find((l) => l.startsWith("data:"));
          if (!line) continue;
          try {
            const event = JSON.parse(line.slice(5).trim()) as AgentEvent;
            setState((s) => reduce(s, event));
          } catch {
            /* ignore malformed chunk */
          }
        }
      }
    } catch {
      /* connection dropped mid-stream — fall through to the safety net */
    }

    // Safety net: if the stream ended without a terminal "done"/"error" event
    // (dropped connection or a server/function timeout), don't hang in "running".
    setState((s) =>
      s.phase !== "running"
        ? s
        : s.verdict
          ? { ...s, phase: "done", steps: s.steps.map((st) => ({ ...st, status: "done" })) }
          : {
              ...s,
              phase: "error",
              error: "The connection ended before a verdict was reached. Please try again.",
            }
    );
  }, []);

  const reset = useCallback(() => setState(initialState()), []);

  return { state, run, reset };
}
