"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useResearchAgent } from "@/app/hooks/useResearchAgent";
import { AgentTrace } from "@/app/components/AgentTrace";
import { VerdictCard } from "@/app/components/VerdictCard";
import { Dimensions } from "@/app/components/Dimensions";
import { Sources } from "@/app/components/Sources";
import { HowItWorks } from "@/app/components/HowItWorks";
import { EvidenceDrawer } from "@/app/components/EvidenceDrawer";
import { PrintReport } from "@/app/components/PrintReport";

const EXAMPLES = ["Stripe", "Zomato", "Nvidia", "OpenAI", "Tesla"];
const FEATURES = ["Live web research", "6-factor framework", "Cited sources", "Invest / Hold / Pass"];

export default function Home() {
  const { state, run, reset } = useResearchAgent();
  const [company, setCompany] = useState("");

  const [hoveredSource, setHoveredSource] = useState<string | null>(null);
  const [hoveredQuery, setHoveredQuery] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const busy = state.phase === "running";
  const started = state.phase !== "idle";

  const downloadPDF = () => {
    // The browser uses document.title as the default file name for "Save to PDF"
    const originalTitle = document.title;
    const safeCompany = state.company ? state.company.replace(/[^a-zA-Z0-9]/g, '_') : 'Company';
    document.title = `Altair_Research_${safeCompany}`;

    // A small delay to ensure any UI states settle before printing
    setTimeout(() => {
      window.print();
      // Restore original title
      document.title = originalTitle;
    }, 100);
  };

  // Introduce a visual delay after verdict is received so users can see the completed waterfall timeline
  useState(() => {
    if (!started) {
      setShowReport(false);
    }
  });

  // Track state.verdict and delay report rendering
  const [lastVerdict, setLastVerdict] = useState<any>(null);
  if (state.verdict !== lastVerdict) {
    setLastVerdict(state.verdict);
    if (state.verdict) {
      setTimeout(() => {
        setShowReport(true);
      }, 2000);
    } else {
      setShowReport(false);
    }
  }

  // Scroll to top when the report takes over the screen
  useEffect(() => {
    if (showReport) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [showReport]);

  function submit(value: string) {
    if (busy) return;
    setCompany(value);
    setShowReport(false);
    run(value);
  }

  return (
    <>
      <PrintReport state={state} />
      <main className="mx-auto w-full flex-1 px-6 sm:px-8 lg:px-12 pb-12 sm:pb-16 print:hidden">
      {/* Top brand bar */}
      <nav className="flex items-center justify-between py-2 border-b border-white/5 mb-6">
        <button 
          onClick={() => {
            reset();
            setCompany("");
            setShowReport(false);
          }}
          className="flex items-center gap-4.5 cursor-pointer group border-none bg-transparent p-0 text-left outline-none"
        >
          <img src="/logo.png" alt="Altair Logo" className="h-14 w-14 object-contain transition-transform group-hover:scale-105" />
          <span className="text-2xl font-bold tracking-tight text-white transition-colors group-hover:text-accent">Altair</span>
        </button>
        <div className="flex items-center gap-4">
          <HowItWorks />
          {showReport && (
            <button
              onClick={downloadPDF}
              title="Print / Save PDF"
              className="text-xs font-medium bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white px-3 py-1.5 rounded border border-white/10 cursor-pointer transition-colors"
            >
              <svg className="w-3.5 h-3.5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              PDF
            </button>
          )}
          {started && (
            <button
              onClick={() => {
                reset();
                setCompany("");
                setShowReport(false);
              }}
              className="text-xs font-medium bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white px-4 py-1.5 rounded border border-white/10 cursor-pointer transition-colors"
            >
              New Search
            </button>
          )}
        </div>
      </nav>

      {/* Hero (Only render if NOT started) */}
      <AnimatePresence>
        {!started && (
          <motion.header 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, height: 0, transition: { duration: 0.3 } }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-24 text-center overflow-hidden"
          >
            <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              Should you invest in{" "}
              <span className="text-accent">
                anything?
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-zinc-400">
              Name any company — public giant or unknown startup. Altair researches the live
              web, scores it on six factors, and decides{" "}
              <span className="font-medium text-zinc-200">Invest</span>,{" "}
              <span className="font-medium text-zinc-200">Hold</span>, or{" "}
              <span className="font-medium text-zinc-200">Pass</span> — with its reasoning and
              sources.
            </p>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Input (Only render if NOT started) */}
      <AnimatePresence>
        {!started && (
          <motion.form
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15, height: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={(e) => {
              e.preventDefault();
              submit(company);
            }}
            className="mx-auto mt-8 flex max-w-xl gap-2 overflow-hidden w-full"
          >
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Stripe, Zomato, Nvidia…"
              disabled={busy}
              className="flex-1 rounded border border-white/15 bg-white/5 px-6 py-3 text-white outline-none placeholder:text-zinc-500 transition-colors focus:border-accent focus:bg-white/10 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={busy || !company.trim()}
              className="btn-accent rounded px-8 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {busy ? "Researching…" : "Analyze"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Examples + feature pills (idle only) */}
      <AnimatePresence>
        {!started && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-auto mt-5 w-full max-w-3xl"
          >
            <div className="mx-auto max-w-xl flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-zinc-500">Try:</span>
              {EXAMPLES.map((name) => (
                <button
                  key={name}
                  onClick={() => submit(name)}
                  className="rounded border border-white/10 bg-white/[0.02] px-3 py-1 text-xs text-zinc-400 transition-colors hover:border-accent/40 hover:text-white cursor-pointer"
                >
                  {name}
                </button>
              ))}
            </div>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-white/5 pt-6 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              {FEATURES.map((f, i) => (
                <motion.span 
                  key={f} 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -1, color: "#f4f4f5", transition: { duration: 0.2 } }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="inline-flex items-center gap-2.5 cursor-default transition-colors"
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent"></span>
                  </span>
                  {f}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {state.phase === "error" && (
        <div className="mx-auto mt-8 max-w-xl rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-zinc-300">
          <span className="font-medium text-white">Something went wrong.</span> {state.error}
        </div>
      )}

      {/* Results */}
      {started && state.phase !== "error" && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 flex flex-col gap-6"
        >
          <AnimatePresence mode="wait">
            {!showReport || !state.verdict ? (
              /* Loading/Running Phase: Show ONLY the Agent Trace centered and prominent */
              <motion.div
                key="loading-trace"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="mx-auto w-full max-w-5xl min-h-[60vh] flex flex-col items-center justify-center pb-12"
              >
                <AgentTrace
                  state={state}
                  hoveredSource={null}
                  hoveredQuery={null}
                  onHoverQuery={() => {}}
                  variant="horizontal"
                />
              </motion.div>
            ) : (
              /* Completed Phase: Show the full executive dashboard */
              <motion.div
                key="completed-dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-6"
              >
                <div id="dashboard-content" className="flex flex-col gap-6 w-full relative z-0 bg-[#09090b]">
                {/* Top: Verdict Card (Full Width) */}
                <VerdictCard
                  company={state.company}
                  verdict={state.verdict!}
                  dataQuality={state.analysis?.dataQuality}
                  onShowEvidence={() => setShowEvidence(true)}
                />

                {/* Bottom Grid: Analysis vs. Trace/Citations */}
                <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                  {/* Left: Category Breakdown */}
                  {state.analysis ? (
                    <Dimensions
                      analysis={state.analysis}
                      decision={state.verdict?.decision}
                      className="flex-1"
                    />
                  ) : (
                    <div className="panel p-6 flex flex-col items-center justify-center text-zinc-500 text-sm min-h-[300px]">
                      <span className="h-4 w-4 rounded-full border-2 border-accent/20 border-t-accent animate-spin mb-3" />
                      Analyzing company dimensions...
                    </div>
                  )}

                  {/* Right: Agent Trace + Sources */}
                  <div className="flex flex-col gap-6">
                    <AgentTrace
                      state={state}
                      hoveredSource={hoveredSource}
                      hoveredQuery={hoveredQuery}
                      onHoverQuery={setHoveredQuery}
                    />
                    {state.evidence && state.evidence.length > 0 && (
                      <Sources
                        evidence={state.evidence}
                        className="flex-1"
                        hoveredSource={hoveredSource}
                        onHoverSource={setHoveredSource}
                        hoveredQuery={hoveredQuery}
                      />
                    )}
                  </div>
                </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Raw Evidence Drawer */}
      <EvidenceDrawer
        isOpen={showEvidence}
        evidence={state.evidence || []}
        onClose={() => setShowEvidence(false)}
      />
    </main>
    </>
  );
}
