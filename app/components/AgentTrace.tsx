"use client";

import { useEffect } from "react";
import type { ResearchState } from "@/app/hooks/useResearchAgent";
import { motion, AnimatePresence } from "framer-motion";

/**
 * The live "show your work" timeline: the four agent steps structured as a
 * vertical pipeline. Highlights the active stage, pulses during execution,
 * and flows live sub-queries under the research stage.
 */
export function AgentTrace({
  state,
  hoveredSource,
  hoveredQuery,
  onHoverQuery,
  variant = "vertical",
}: {
  state: ResearchState;
  hoveredSource: string | null;
  hoveredQuery: string | null;
  onHoverQuery: (query: string | null) => void;
  variant?: "vertical" | "horizontal";
}) {
  // Auto-scroll is no longer needed for the horizontal layout since it doesn't expand
  useEffect(() => {
    // We intentionally removed the vertical scrolling logic for the loading screen
    // because the horizontal bar doesn't take up much space.
  }, [variant]);

  // Check if a search query cited the hovered source domain
  const isCitingHoveredSource = (query: string) => {
    if (!hoveredSource) return false;
    const group = state.evidence?.find((g) => g.question === query);
    if (!group) return false;
    return group.sources.some((src) => {
      try {
        return new URL(src.url).hostname.replace(/^www\./, "") === hoveredSource;
      } catch {
        return false;
      }
    });
  };

  const isResearchActive = state.steps.find((s) => s.node === "research")?.status === "active";
  const isBranchActive = isResearchActive && state.searches.some((s) => s.count === undefined);

  // A one-line outcome for the steps that don't fan out into searches, so every
  // step shows what it produced (not just Research).
  const stepDetail = (node: string): string | null => {
    if (node === "plan")
      return state.plan ? `${state.plan.questions.length} research questions` : null;
    if (node === "analyze")
      return state.analysis
        ? `Scored ${state.analysis.dimensions.length} factors · evidence ${state.analysis.dataQuality}`
        : null;
    if (node === "decide")
      return state.verdict
        ? `${state.verdict.decision} · conviction ${state.verdict.conviction}/100`
        : null;
    return null;
  };

  // ==================== VERTICAL VARIANT ====================
  if (variant === "vertical") {
    return (
      <section className="py-2 pl-2 animate-rise">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-6 pl-1">
          Agent trace
        </h3>

        <div className="relative pl-1">
          <ol className="relative space-y-0">
            <AnimatePresence>
              {state.steps.map((step, index) => {
                const isActive = step.status === "active";
                const isDone = step.status === "done";
                const hasLine = index < state.steps.length - 1;
                
                return (
                  <motion.li 
                    key={step.node}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4 pb-6 relative"
                  >
                    {/* Status Dot */}
                    <div className="relative flex flex-col items-center shrink-0 min-h-[24px] z-10">
                      <VerticalStatusDot status={step.status} />
                    </div>

                    {/* Segment track background & progress */}
                    {hasLine && (
                      <div className="absolute left-[9px] top-5 bottom-0 w-[2px] bg-white/10 z-0">
                        <motion.div
                          className="w-full bg-accent shadow-[0_0_8px_rgba(196,26,13,0.5)]"
                          initial={{ height: 0 }}
                          animate={{
                            height: isDone ? "100%" : "0%",
                          }}
                          style={{ transformOrigin: "top" }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0 pt-0.5">
                      <p
                        className={`text-sm font-medium transition-colors duration-300 ${
                          isActive
                            ? "text-accent font-semibold"
                            : isDone
                            ? "text-zinc-200"
                            : "text-zinc-600"
                        }`}
                      >
                        {step.label}
                      </p>

                      {/* Under the research step, list the live searches */}
                      <AnimatePresence>
                        {step.node === "research" && state.searches.length > 0 && (
                          <motion.ul 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className={`mt-3 ml-2 border-l pl-4 space-y-2 overflow-hidden transition-colors duration-300 ${
                              isBranchActive ? "border-accent/20" : "border-white/5"
                            }`}
                          >
                            <AnimatePresence>
                              {state.searches.map((s, i) => {
                                const isCited = isCitingHoveredSource(s.query);

                                return (
                                  <motion.li 
                                    key={i}
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    onMouseEnter={() => s.count !== undefined && onHoverQuery(s.query)}
                                    onMouseLeave={() => onHoverQuery(null)}
                                    className={`group flex items-center gap-2 text-xs transition-all duration-200 cursor-default ${
                                      isCited
                                        ? "text-accent font-semibold scale-[1.02]"
                                        : "text-zinc-400"
                                    }`}
                                  >
                                    {s.count === undefined ? (
                                      <span className="h-1 w-1 rounded-full bg-accent animate-pulse shrink-0" />
                                    ) : (
                                      <span className="h-1 w-1 rounded-full bg-zinc-600 shrink-0" />
                                    )}
                                    <span className={`truncate max-w-[220px] ${s.count === undefined ? "text-zinc-300" : ""}`}>
                                      {s.query}
                                    </span>
                                    <span className={`text-[9px] font-mono shrink-0 ${isCited ? "text-accent/80" : "text-zinc-600"}`}>
                                      {s.count === undefined ? "searching..." : `${s.count} src`}
                                    </span>
                                  </motion.li>
                                );
                              })}
                            </AnimatePresence>
                          </motion.ul>
                        )}
                      </AnimatePresence>

                      {/* Outcome line for the non-research steps */}
                      {step.node !== "research" && stepDetail(step.node) && (
                        <motion.p
                          initial={{ opacity: 0, y: -2 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1.5 ml-2 border-l border-white/5 pl-4 text-xs text-zinc-500"
                        >
                          {stepDetail(step.node)}
                        </motion.p>
                      )}
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ol>
        </div>
      </section>
    );
  }

  // ==================== HORIZONTAL VARIANT ====================
  return (
    <section className="w-full flex justify-center animate-rise">
      <div className="w-full max-w-4xl flex flex-col items-center">
        {/* Elegant glowing telemetry heading */}
        <div className="flex flex-col items-center justify-center mb-16">
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-lg bg-accent/10 border border-accent/20 mb-3 shadow-[0_0_15px_-3px_rgba(196,26,13,0.2)]">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_5px_rgba(196,26,13,0.8)]" />
            <span className="text-[10px] font-mono tracking-widest uppercase text-accent">Live Telemetry</span>
          </div>
          <h3 className="flex items-center gap-4 text-[11px] font-medium uppercase tracking-[0.3em] text-zinc-400">
            <span className="w-8 h-[1px] bg-zinc-800"></span>
            Agent Trace
            <span className="w-8 h-[1px] bg-zinc-800"></span>
          </h3>
        </div>

        <div className="w-full flex items-start justify-between relative px-8">
          {state.steps.map((step, index) => {
            const isActive = step.status === "active";
            const isDone = step.status === "done";
            const hasLine = index < state.steps.length - 1;

            return (
              <div key={step.node} className="relative z-10 flex flex-col items-center flex-1">
                {/* Active connecting line to the next node */}
                {hasLine && (
                  <div className="absolute top-3.5 left-1/2 w-full h-[2px] bg-white/10 z-0">
                    <motion.div
                      className="h-full bg-accent shadow-[0_0_8px_rgba(196,26,13,0.5)]"
                      initial={{ width: 0 }}
                      animate={{ width: isDone ? "100%" : "0%" }}
                      transition={{ duration: 1.2, ease: "easeInOut" }}
                      style={{ transformOrigin: "left" }}
                    />
                  </div>
                )}
                
                {/* Dot */}
                <div className="bg-[#09090b] px-4 relative z-10">
                  <WaterfallStatusDot status={step.status} />
                </div>
                
                {/* Label */}
                <div className="mt-8 text-center px-2">
                  <p className={`text-sm font-medium transition-colors duration-500 ${isActive ? "text-white" : isDone ? "text-zinc-300" : "text-zinc-600"}`}>
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function VerticalStatusDot({ status }: { status: "pending" | "active" | "done" }) {
  if (status === "done") {
    return (
      <div className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-black shadow-md shadow-accent/15">
        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.3 3.3 6.8-6.8a1 1 0 011.4 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  }
  if (status === "active") {
    return (
      <div className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black border border-accent">
        <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
        <span className="absolute inset-0 rounded-full border border-accent animate-ping opacity-30 scale-125" />
      </div>
    );
  }
  return (
    <div className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#121214] border border-white/10">
      <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
    </div>
  );
}

function WaterfallStatusDot({ status }: { status: "pending" | "active" | "done" }) {
  if (status === "done") {
    return (
      <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-black shadow-md shadow-accent/15">
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.3 3.3 6.8-6.8a1 1 0 011.4 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  }
  if (status === "active") {
    return (
      <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black border border-accent">
        <span className="h-2.5 w-2.5 rounded-full bg-accent animate-pulse" />
        <span className="absolute inset-0 rounded-full border border-accent animate-ping opacity-30 scale-125" />
      </div>
    );
  }
  return (
    <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#121214] border border-white/10">
      <span className="h-2 w-2 rounded-full bg-zinc-700" />
    </div>
  );
}
