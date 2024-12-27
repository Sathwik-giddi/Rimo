import type { Verdict } from "@/lib/agent/schemas";
import { DECISION, ACCENT } from "./decision";
import { ConvictionGauge } from "./ConvictionGauge";
import { motion } from "framer-motion";
import { useState } from "react";

/**
 * The headline output as a visual dashboard: decision badge, a radial conviction
 * gauge, the weighted score, a bull-vs-bear balance bar, and the thesis. "Decide,
 * don't dump" — the call leads, the reasoning is scannable, not a wall of text.
 */

const QUALITY_COLOR: Record<string, string> = {
  high: "bg-white/10 text-white",
  medium: "bg-white/[0.06] text-zinc-300",
  low: "bg-white/[0.04] text-zinc-500",
};

export function VerdictCard({
  company,
  verdict,
  dataQuality,
  onShowEvidence,
}: {
  company: string;
  verdict: Verdict;
  dataQuality?: "high" | "medium" | "low";
  onShowEvidence?: () => void;
}) {
  const d = DECISION[verdict.decision];
  const bull = verdict.bullCase.length;
  const bear = verdict.bearCase.length;
  const bullPct = bull + bear === 0 ? 50 : Math.round((bull / (bull + bear)) * 100);

  const [hoveredCase, setHoveredCase] = useState<"bull" | "bear" | null>(null);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-md border p-6 sm:p-8 ${d.border} panel relative overflow-hidden`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-400">Verdict for</p>
          <h2 className="text-2xl font-semibold text-white mt-1">{company}</h2>
        </div>
        
        <div className="flex items-center gap-3 print:hidden">
          {onShowEvidence && (
            <button
              onClick={onShowEvidence}
              title="View Raw Evidence"
              className="flex items-center justify-center w-8 h-8 rounded transition-colors text-zinc-400 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
          <span className={`rounded px-4 py-1.5 text-sm font-semibold tracking-wide ${d.badge}`}>
            {d.mark} {d.label.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Visual stat row: gauge + weighted score + data quality */}
      <div className="mt-6 flex flex-wrap items-center gap-6">
        <ConvictionGauge decision={verdict.decision} conviction={verdict.conviction} />

        <div className="flex flex-1 flex-wrap gap-6">
          <Stat label="Weighted score">
            <span className="text-2xl font-bold" style={{ color: ACCENT }}>
              {verdict.composite.toFixed(1)}
            </span>
            <span className="text-sm text-zinc-500"> / 10</span>
          </Stat>

          {dataQuality && (
            <Stat label="Evidence quality">
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-sm font-semibold capitalize ${QUALITY_COLOR[dataQuality]}`}
              >
                {dataQuality}
              </span>
            </Stat>
          )}
        </div>
      </div>

      {dataQuality && dataQuality !== "high" && (
        <p className="mt-3 text-xs text-zinc-500">
          Conviction is deliberately capped because public data on this company was {dataQuality}.
        </p>
      )}

      {/* Thesis */}
      <div
        className="mt-6 rounded border-l-2 bg-white/[0.03] p-4"
        style={{ borderColor: d.hex }}
      >
        <p className="text-[15px] leading-relaxed text-zinc-200">{verdict.thesis}</p>
      </div>

      {/* Bull vs Bear balance bar */}
      <div className="mt-6">
        <div className="mb-1.5 flex items-center justify-between text-xs font-medium">
          <span className="text-accent transition-colors duration-300">▲ Bull · {bull}</span>
          <span className="text-zinc-400 transition-colors duration-300">{bear} · Bear ▼</span>
        </div>
        <div className="flex h-2 overflow-hidden rounded-full bg-white/5 relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${bullPct}%` }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className={`bg-accent h-full transition-all duration-300 ${
              hoveredCase === "bull"
                ? "shadow-[0_0_12px_rgba(223,37,20,0.8)] scale-y-125 z-10"
                : hoveredCase === "bear"
                ? "opacity-20"
                : ""
            }`}
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${100 - bullPct}%` }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className={`bg-zinc-600 h-full transition-all duration-300 ${
              hoveredCase === "bear"
                ? "shadow-[0_0_12px_rgba(255,255,255,0.4)] scale-y-125 z-10 bg-white"
                : hoveredCase === "bull"
                ? "opacity-20"
                : ""
            }`}
          />
        </div>
      </div>

      {/* Bull / Bear lists */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <CaseList
          title="Bull case"
          tone="bull"
          items={verdict.bullCase}
          onMouseEnter={() => setHoveredCase("bull")}
          onMouseLeave={() => setHoveredCase(null)}
        />
        <CaseList
          title="Bear case"
          tone="bear"
          items={verdict.bearCase}
          onMouseEnter={() => setHoveredCase("bear")}
          onMouseLeave={() => setHoveredCase(null)}
        />
      </div>

      {/* Risks */}
      {verdict.keyRisks.length > 0 && (
        <div className="mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Key risks to monitor
          </h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {verdict.keyRisks.map((r, i) => (
              <li
                key={i}
                className="rounded border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-zinc-300"
              >
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.section>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function CaseList({
  title,
  tone,
  items,
  onMouseEnter,
  onMouseLeave,
}: {
  title: string;
  tone: "bull" | "bear";
  items: string[];
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const dot = tone === "bull" ? "bg-accent" : "bg-zinc-500";
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="rounded border border-white/10 bg-white/[0.03] p-5 relative overflow-hidden group hover:bg-white/[0.05] transition-colors cursor-default"
    >
      <h3 className="text-sm font-semibold text-zinc-200 relative z-10">{title}</h3>
      <ul className="mt-3 space-y-2 relative z-10">
        {items.map((it, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="flex gap-2.5 text-[13px] leading-relaxed text-zinc-400 transition-colors group-hover:text-zinc-300"
          >
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
            <span>{it}</span>
          </motion.li>
        ))}
      </ul>
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br ${tone === 'bull' ? 'from-accent/5' : 'from-zinc-500/5'} to-transparent`} />
    </div>
  );
}
