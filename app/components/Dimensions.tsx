import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Analysis } from "@/lib/agent/schemas";
import { ScoreRadar } from "./ScoreRadar";
import { ACCENT, scoreAlpha, type Decision } from "./decision";

/**
 * The multi-signal analysis, visualised: a radar chart for the at-a-glance shape,
 * then compact per-category rows whose rationale is tucked behind a tap. "Holistic
 * reasoning shown transparently" — without burying the user in paragraphs.
 */
export function Dimensions({
  analysis,
  decision = "HOLD",
  className = "",
}: {
  analysis: Analysis;
  decision?: Decision;
  className?: string;
}) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setExpandedIdx(expandedIdx === idx ? null : idx);
  };

  return (
    <section className={`panel animate-rise p-6 ${className}`}>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
        Category breakdown
      </h3>

      {/* Radar */}
      <div className="mt-2 flex justify-center">
        <ScoreRadar
          dimensions={analysis.dimensions}
          decision={decision}
          activeIdx={activeIdx}
        />
      </div>

      {/* Compact rows; rationale on demand */}
      <div className="mt-4 divide-y divide-white/5">
        {analysis.dimensions.map((dim, i) => {
          const isExpanded = expandedIdx === i;
          return (
            <div
              key={i}
              className="py-3 cursor-pointer group"
              onMouseEnter={() => setActiveIdx(i)}
              onMouseLeave={() => setActiveIdx(null)}
              onClick={() => toggle(i)}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-7 w-10 flex-none items-center justify-center rounded text-xs font-bold text-white font-mono transition-transform group-hover:scale-105"
                  style={{ backgroundColor: `rgba(223,37,20,${scoreAlpha(dim.score)})` }}
                >
                  {dim.score.toFixed(1)}
                </span>
                <span className={`flex-1 text-sm font-medium transition-colors ${isExpanded ? "text-accent" : "text-zinc-200 group-hover:text-white"}`}>
                  {dim.name}
                </span>
                <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-white/5 sm:block">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${(dim.score / 10) * 100}%`, backgroundColor: ACCENT }}
                  />
                </div>
                <span className={`text-zinc-500 font-mono transition-transform duration-200 ${isExpanded ? "rotate-90 text-accent" : ""}`}>
                  ›
                </span>
              </div>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: "auto", opacity: 1, marginTop: 8 }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="pl-13 pr-4 text-sm leading-relaxed text-zinc-400">
                      {dim.rationale}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Synthesis */}
      <div className="mt-4 rounded-md border border-white/[0.06] bg-white/[0.02] p-5">
        <p className="text-sm leading-relaxed text-zinc-300">{analysis.summary}</p>
      </div>
    </section>
  );
}
