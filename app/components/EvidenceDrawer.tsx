import { motion, AnimatePresence } from "framer-motion";
import type { EvidenceGroup } from "@/lib/agent/schemas";
import { useEffect } from "react";

export function EvidenceDrawer({
  evidence,
  isOpen,
  onClose,
}: {
  evidence: EvidenceGroup[];
  isOpen: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-[#09090b] border-l border-white/10 z-50 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-lg font-semibold text-white">Agent Evidence Base</h2>
                <p className="text-xs text-zinc-400 mt-1">Raw sources and snippets gathered by the agent.</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
              {evidence.map((group, i) => (
                <div key={i} className="space-y-4">
                  <h3 className="text-sm font-medium text-accent">
                    Query: <span className="text-zinc-200">"{group.question}"</span>
                  </h3>
                  
                  {group.sources.length === 0 ? (
                    <p className="text-sm text-zinc-500 italic">No sources found for this query.</p>
                  ) : (
                    <div className="space-y-4">
                      {group.sources.map((src, j) => (
                        <a
                          key={j}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded border border-white/5 bg-white/[0.02] p-4 hover:bg-white/[0.04] hover:border-white/10 transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <h4 className="text-sm font-medium text-zinc-200 group-hover:text-accent transition-colors line-clamp-2">
                              {src.title}
                            </h4>
                            <span className="shrink-0 text-xs text-zinc-500 bg-white/5 px-2 py-0.5 rounded">
                              {Math.round(src.score * 100)}% Match
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 mt-1 truncate">
                            {(() => {
                              try {
                                return new URL(src.url).hostname;
                              } catch {
                                return src.url;
                              }
                            })()}
                          </p>
                          <p className="mt-3 text-[13px] leading-relaxed text-zinc-400 line-clamp-3">
                            {src.content}
                          </p>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
