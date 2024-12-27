import { DECISION, type Decision } from "./decision";

/**
 * Conviction shown as a radial ring (SVG, no chart library). The arc fills to the
 * conviction %, coloured by the decision — an at-a-glance read instead of a number
 * buried in text.
 */
export function ConvictionGauge({
  decision,
  conviction,
  size = 132,
}: {
  decision: Decision;
  conviction: number;
  size?: number;
}) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, conviction)) / 100;
  const dash = c * pct;
  const color = DECISION[decision].hex;
  const center = size / 2;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* track */}
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        {/* value arc — starts at 12 o'clock */}
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: "stroke-dasharray 0.8s ease-out" }}
        />
        <text
          x={center}
          y={center - 4}
          textAnchor="middle"
          className="fill-white"
          style={{ fontSize: 26, fontWeight: 700 }}
        >
          {Math.round(conviction)}
        </text>
        <text
          x={center}
          y={center + 16}
          textAnchor="middle"
          className="fill-zinc-500"
          style={{ fontSize: 11, fontWeight: 500 }}
        >
          / 100
        </text>
      </svg>
      <span className="mt-1 text-xs font-medium text-zinc-400">Conviction</span>
    </div>
  );
}
