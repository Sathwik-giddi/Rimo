"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES } from "@/lib/agent/framework";

/**
 * A self-contained "How it works" button + modal for the top bar. Plain-English,
 * generic explanation of the agent — always available (landing page or results),
 * so anyone can understand what Altair does and why to trust it before running it.
 */

const STEPS = [
  {
    t: "Plans the research",
    d: "Turns the company name into the right set of questions — and digs differently for a big public name vs. an unknown startup.",
  },
  {
    t: "Reads the live web",
    d: "Runs real web searches and collects actual sources — it never guesses from memory.",
  },
  {
    t: "Scores six factors",
    d: "Weighs the evidence on six dimensions (0–10 each), and judges how trustworthy the evidence is.",
  },
  {
    t: "Makes the call",
    d: "Combines the scores into a clear verdict — Invest, Hold, or Pass — with a confidence level.",
  },
];

export function HowItWorks() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-medium tracking-wide text-zinc-500 transition-colors hover:text-white cursor-pointer"
      >
        How it works
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="panel h-[80vh] max-h-[800px] min-h-[560px] w-full max-w-2xl flex flex-col p-8 overflow-hidden"
            >
              {/* Pinned Header */}
              <div className="flex items-start justify-between pb-3 border-b border-white/5 flex-none">
                <div>
                  <h2 className="text-lg font-semibold text-white">How Altair works</h2>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    It researches a company the way an analyst would — then makes a call, and shows
                    its work.
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="ml-4 flex h-8 w-8 flex-none items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-white/5 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto mt-6 pr-2 custom-scrollbar">
                {/* Steps */}
                <ol className="space-y-4">
                  {STEPS.map((s, i) => (
                    <li key={s.t} className="flex gap-3">
                      <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-white">{s.t}</p>
                        <p className="text-sm leading-relaxed text-zinc-400">{s.d}</p>
                      </div>
                    </li>
                  ))}
                </ol>

                {/* The six factors */}
                <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    The six factors it weighs
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => (
                      <span
                        key={c.name}
                        className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-zinc-300"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Why trust it */}
                <div className="mt-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Why you can trust it
                  </p>
                  <ul className="mt-2 space-y-2 text-sm leading-relaxed text-zinc-300">
                    <li className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-accent" />
                      <span>
                        Every point is backed by a{" "}
                        <span className="font-medium text-white">real, clickable source</span> — no
                        black box.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-accent" />
                      <span>
                        It stays <span className="font-medium text-white">honest</span>: when there's
                        little public info, it says so and lowers its confidence instead of bluffing.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-accent" />
                      <span>
                        The final call follows a{" "}
                        <span className="font-medium text-white">fixed, explainable rule</span> — a
                        strong score leans Invest, a weak one leans Pass.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
