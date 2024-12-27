import { Annotation } from "@langchain/langgraph";
import type { ResearchPlan, Analysis, Verdict, EvidenceGroup } from "./schemas";

/**
 * The shared state that flows through the LangGraph.
 *
 * Each node reads what it needs and writes its own slice. Using an explicit
 * graph state (rather than a linear chain) is a deliberate choice: the run is
 * inspectable and streamable step-by-step, which is exactly what powers the
 * live trace UI — and it's easy to defend in an interview.
 */
export const AgentState = Annotation.Root({
  // input
  company: Annotation<string>(),

  // produced by each step (last-write-wins, except evidence which accumulates)
  plan: Annotation<ResearchPlan | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  evidence: Annotation<EvidenceGroup[]>({
    reducer: (prev, next) => prev.concat(next),
    default: () => [],
  }),
  // set once the "deepen if thin" pass has run, so it can't loop forever
  deepened: Annotation<boolean>({
    reducer: (_prev, next) => next,
    default: () => false,
  }),
  analysis: Annotation<Analysis | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  verdict: Annotation<Verdict | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
});

export type AgentStateType = typeof AgentState.State;
