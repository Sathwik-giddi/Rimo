import { CATEGORIES, SHORT_LABELS } from "@/lib/agent/framework";
import type { Dimension } from "@/lib/agent/schemas";
import { DECISION, type Decision } from "./decision";
import { motion } from "framer-motion";

/**
 * Radar/spider chart of the six framework scores (hand-drawn SVG, no chart lib).
 * The shape gives an instant read of a company's strengths and weaknesses — far
 * faster than reading six bars and paragraphs.
 */

const CX = 210;
const CY = 160;
const R = 120;
const N = CATEGORIES.length;
const LEVELS = [2, 4, 6, 8, 10];

function point(value: number, i: number, radius = R) {
  const a = (-90 + (360 / N) * i) * (Math.PI / 180);
  const r = (value / 10) * radius;
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a), a };
}

function polygon(points: { x: number; y: number }[]) {
  return points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
}

export function ScoreRadar({
  dimensions,
  decision,
  activeIdx,
}: {
  dimensions: Dimension[];
  decision: Decision;
  activeIdx: number | null;
}) {
  const color = DECISION[decision].hex;
  const byName = new Map(dimensions.map((d) => [d.name, d.score]));
  const axes = CATEGORIES.map((c, i) => ({
    i,
    name: c.name,
    short: SHORT_LABELS[c.name],
    score: byName.get(c.name) ?? 0,
  }));

  return (
    <svg viewBox="0 0 420 320" className="w-full max-w-[450px]">
      {/* grid rings */}
      {LEVELS.map((lvl) => (
        <polygon
          key={lvl}
          points={polygon(axes.map((ax) => point(lvl, ax.i)))}
          fill="none"
          stroke="rgba(255,255,255,0.10)"
          strokeWidth={1}
        />
      ))}

      {/* axis spokes */}
      {axes.map((ax) => {
        const tip = point(10, ax.i);
        const isActive = activeIdx === ax.i;
        return (
          <line
            key={ax.i}
            x1={CX}
            y1={CY}
            x2={tip.x}
            y2={tip.y}
            stroke={isActive ? color : "rgba(255,255,255,0.10)"}
            strokeWidth={isActive ? 1.5 : 1}
            className="transition-colors duration-200"
          />
        );
      })}

      {/* score polygon */}
      <motion.polygon
        initial={{ opacity: 0, scale: 0.5, transformOrigin: "center" }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        points={polygon(axes.map((ax) => point(ax.score, ax.i)))}
        fill={color}
        fillOpacity={0.18}
        stroke={color}
        strokeWidth={2}
        style={{ transition: "fill 0.6s ease-out, stroke 0.6s ease-out" }}
      />

      {/* score dots (with native tooltip and active pulse) */}
      {axes.map((ax) => {
        const p = point(ax.score, ax.i);
        const isActive = activeIdx === ax.i;
        return (
          <g key={ax.i}>
            {isActive && (
              <circle
                cx={p.x}
                cy={p.y}
                r={8}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                className="animate-ping"
                style={{ transformOrigin: `${p.x}px ${p.y}px` }}
              />
            )}
            <circle
              cx={p.x}
              cy={p.y}
              r={isActive ? 5.5 : 3.5}
              fill={color}
              className="transition-all duration-200"
            >
              <title>
                {ax.name}: {ax.score.toFixed(1)}/10
              </title>
            </circle>
          </g>
        );
      })}

      {/* axis labels */}
      {axes.map((ax) => {
        const lp = point(10, ax.i, R + 25);
        const cos = Math.cos(lp.a);
        const sin = Math.sin(lp.a);
        const anchor = cos > 0.3 ? "start" : cos < -0.3 ? "end" : "middle";
        const dy = sin > 0.3 ? 9 : sin < -0.3 ? -2 : 4;
        const isActive = activeIdx === ax.i;
        return (
          <text
            key={ax.i}
            x={lp.x}
            y={lp.y + dy}
            textAnchor={anchor}
            style={{ fontSize: isActive ? 13 : 12, fontWeight: isActive ? 800 : 600 }}
            className={`transition-all duration-200 ${isActive ? "fill-white" : "fill-zinc-600"}`}
          >
            {ax.short}
          </text>
        );
      })}
    </svg>
  );
}
