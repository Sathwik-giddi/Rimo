import type { ResearchPlan, Analysis, Verdict, EvidenceGroup } from "./schemas";

/**
 * The trace events streamed from the agent to the UI.
 *
 * The whole point of the live trace is the "show your work" principle: the user
 * watches the agent Plan -> Research -> Analyze -> Decide in real time, then
 * lands on a sourced verdict. These are the typed messages that drive that UI.
 */

export type NodeName = "plan" | "research" | "analyze" | "decide";

export type AgentEvent =
  // a step started / finished (drives the stepper UI)
  | { type: "node-start"; node: NodeName; label: string }
  | { type: "node-end"; node: NodeName }
  // fine-grained progress inside the research step
  | { type: "search-start"; query: string }
  | { type: "search-done"; query: string; count: number }
  // the actual produced artifacts, emitted as each step completes
  | { type: "plan"; plan: ResearchPlan }
  | { type: "evidence"; evidence: EvidenceGroup[] }
  | { type: "analysis"; analysis: Analysis }
  | { type: "verdict"; verdict: Verdict }
  // terminal states
  | { type: "error"; message: string }
  | { type: "done" };
