import type { Verdict } from "@/lib/agent/schemas";

export type Decision = Verdict["decision"];

export const ACCENT = "#c41a0d"; // the one accent colour
export const MUTED = "#a1a1aa"; // zinc-400 (grey)

/**
 * Strict monochrome + orange system: black, white, orange, and greys — no other
 * hues. Since we can't use green/amber/red, the verdict is conveyed by INTENSITY
 * and an icon, not colour: Invest = solid orange (loud), Hold = orange outline,
 * Pass = muted grey (quiet).
 */
export const DECISION: Record<
  Decision,
  { label: string; mark: string; hex: string; border: string; badge: string; glow: string }
> = {
  INVEST: {
    label: "Invest",
    mark: "▲",
    hex: ACCENT,
    border: "border-[#c41a0d]/40 bg-[#c41a0d]/[0.06]",
    badge: "bg-accent text-black",
    glow: "0 0 44px -14px rgba(196,26,13,0.6)",
  },
  HOLD: {
    label: "Hold",
    mark: "●",
    hex: ACCENT,
    border: "border-white/12 bg-white/[0.03]",
    badge: "border border-[#c41a0d]/60 text-accent",
    glow: "none",
  },
  PASS: {
    label: "Pass",
    mark: "▼",
    hex: MUTED,
    border: "border-white/10 bg-white/[0.02]",
    badge: "border border-white/20 text-zinc-400",
    glow: "none",
  },
};

// Bars / radar / chips all use the single accent; strength is shown by length or
// opacity (scoreAlpha below), never by a different colour.
// Low score → faint orange, high score → solid orange (encodes score in intensity).
export function scoreAlpha(score: number): number {
  const s = Math.max(0, Math.min(10, score));
  return 0.3 + (s / 10) * 0.7;
}
