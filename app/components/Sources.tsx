import type { EvidenceGroup } from "@/lib/agent/schemas";

/**
 * The citations. Every source the agent read, deduped, with a clickable link.
 * Instead of a heavy text list, they are formatted as a compact grid of badges
 * with hover tooltips to keep the layout clean and modern.
 */
export function Sources({
  evidence,
  className = "",
  hoveredSource,
  onHoverSource,
  hoveredQuery,
}: {
  evidence: EvidenceGroup[];
  className?: string;
  hoveredSource: string | null;
  onHoverSource: (domain: string | null) => void;
  hoveredQuery: string | null;
}) {
  const all = evidence.flatMap((g) => g.sources);
  const unique = dedupeByUrl(all);
  if (unique.length === 0) return null;

  const rowCount = Math.ceil(unique.length / 2);

  // Check if a source is cited by the hovered timeline query
  const isCitedByHoveredQuery = (url: string) => {
    if (!hoveredQuery) return false;
    const group = evidence.find((g) => g.question === hoveredQuery);
    if (!group) return false;
    return group.sources.some((src) => src.url === url);
  };

  return (
    <section className={`panel p-6 ${className}`}>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 mb-4">
        Sources <span className="text-zinc-600">({unique.length})</span>
      </h3>
      <div 
        className="grid grid-flow-col gap-2"
        style={{ gridTemplateRows: `repeat(${rowCount}, minmax(0, auto))` }}
      >
        {unique.map((s, i) => {
          const domainName = hostname(s.url);
          const isCited = isCitedByHoveredQuery(s.url);
          const isHovered = hoveredSource === domainName;

          return (
            <a
              key={i}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              title={s.title || s.url}
              onMouseEnter={() => onHoverSource(domainName)}
              onMouseLeave={() => onHoverSource(null)}
              className={`inline-flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs transition-all duration-200 min-w-0 ${
                isCited || isHovered
                  ? "border-accent bg-accent/10 text-white scale-[1.03] shadow-[0_0_12px_-3px_rgba(223,37,20,0.4)]"
                  : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-accent/40 hover:text-white"
              }`}
            >
              <span className="font-mono text-[9px] text-zinc-600 flex-none">{i + 1}</span>
              <span className="truncate font-medium">{domainName}</span>
            </a>
          );
        })}
      </div>
    </section>
  );
}

function dedupeByUrl<T extends { url: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((it) => {
    if (seen.has(it.url)) return false;
    seen.add(it.url);
    return true;
  });
}

function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
