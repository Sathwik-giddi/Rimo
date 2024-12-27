import type { ResearchState } from "@/app/hooks/useResearchAgent";

export function PrintReport({ state }: { state: ResearchState }) {
  if (!state.verdict || !state.analysis) return null;

  const { company, verdict, analysis, evidence } = state;
  const d = verdict.decision === "INVEST" ? "INVEST" : verdict.decision === "PASS" ? "PASS" : "HOLD";
  
  // Decide the color of the verdict badge
  const badgeColor = 
    d === "INVEST" ? "bg-green-100 text-green-800 border-green-300" :
    d === "PASS" ? "bg-red-100 text-red-800 border-red-300" :
    "bg-yellow-100 text-yellow-800 border-yellow-300";

  return (
    <div className="hidden print:block print:bg-white print:text-black font-sans max-w-[210mm] mx-auto">
      {/* Branding Header */}
      <div className="flex items-end justify-between border-b-4 border-gray-900 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <img src="/logo.png" alt="Altair Logo" className="h-10 w-10 object-contain" />
             <span className="text-xl font-bold tracking-[0.2em] text-gray-900 uppercase">Altair</span>
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tight">{company}</h1>
          <p className="text-lg text-gray-500 font-medium mt-1">Deep-Dive Investment Analysis</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Generated On</p>
          <p className="text-sm font-semibold text-gray-800">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Top Metrics / Executive Summary */}
      <div className="mb-10">
        <div className="flex gap-4 mb-6">
          <div className={`flex-1 border p-4 rounded-lg flex flex-col justify-center items-center text-center ${badgeColor}`}>
            <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-80">Final Verdict</p>
            <p className="text-3xl font-black">{d}</p>
          </div>
          <div className="flex-1 border border-gray-200 bg-gray-50 p-4 rounded-lg flex flex-col justify-center items-center text-center">
            <p className="text-xs font-bold uppercase tracking-widest mb-1 text-gray-500">Conviction</p>
            <p className="text-3xl font-black text-gray-900">{verdict.conviction}<span className="text-lg text-gray-500 font-medium">/100</span></p>
          </div>
          <div className="flex-1 border border-gray-200 bg-gray-50 p-4 rounded-lg flex flex-col justify-center items-center text-center">
            <p className="text-xs font-bold uppercase tracking-widest mb-1 text-gray-500">Data Quality</p>
            <p className="text-3xl font-black text-gray-900 capitalize">{analysis.dataQuality}</p>
          </div>
        </div>
        
        <div className="bg-gray-50 border-l-4 border-[#df2514] p-5 rounded-r-lg">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Executive Thesis</h2>
          <p className="text-base leading-relaxed text-gray-900 font-medium">{verdict.thesis}</p>
        </div>
      </div>

      {/* Bull & Bear Cases */}
      <div className="grid grid-cols-2 gap-8 mb-10 print:break-inside-avoid">
        <div>
          <h2 className="text-lg font-black border-b-2 border-green-600 pb-2 mb-4 text-green-800 uppercase tracking-wide">Bull Case</h2>
          <ul className="space-y-3 text-sm text-gray-800">
            {verdict.bullCase.map((c, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">↑</span>
                <span className="leading-snug">{c}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-black border-b-2 border-red-600 pb-2 mb-4 text-red-800 uppercase tracking-wide">Bear Case</h2>
          <ul className="space-y-3 text-sm text-gray-800">
            {verdict.bearCase.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-red-600 font-bold mt-0.5">↓</span>
                <span className="leading-snug">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Key Risks */}
      <div className="mb-10 print:break-inside-avoid bg-orange-50 border border-orange-200 p-6 rounded-lg">
        <h2 className="text-lg font-black text-orange-900 uppercase tracking-wide mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          Key Risks to Monitor
        </h2>
        <ul className="space-y-2 text-sm text-orange-900">
          {verdict.keyRisks.map((r, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="font-bold mt-0.5">•</span>
              <span className="leading-snug">{r}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Dimensional Analysis */}
      <div className="mb-10">
        <h2 className="text-2xl font-black border-b-2 border-gray-200 pb-3 mb-6 text-gray-900">Dimensional Breakdown</h2>
        <div className="grid grid-cols-2 gap-4">
          {analysis.dimensions.map((dim, i) => (
            <div key={i} className="border border-gray-200 bg-white p-4 rounded-lg print:break-inside-avoid">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{dim.name}</h3>
                <span className="inline-flex items-center justify-center bg-gray-100 px-2 py-1 rounded text-xs font-black text-gray-700 border border-gray-200">
                  {dim.score.toFixed(1)} / 10
                </span>
              </div>
              <p className="text-xs leading-relaxed text-gray-600">{dim.rationale}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Synthesis */}
      <div className="mb-10 print:break-inside-avoid">
        <h2 className="text-2xl font-black border-b-2 border-gray-200 pb-3 mb-4 text-gray-900">Synthesis</h2>
        <p className="text-sm leading-relaxed text-gray-800 bg-gray-50 p-6 rounded-lg border border-gray-200">{analysis.summary}</p>
      </div>

      {/* References */}
      {evidence && evidence.length > 0 && (
        <div className="mt-12 pt-8 border-t-4 border-gray-900 print:break-inside-avoid">
          <h2 className="text-2xl font-black mb-6 text-gray-900">Appendix: Cited Evidence</h2>
          <div className="space-y-6">
            {evidence.map((group, i) => (
              <div key={i} className="print:break-inside-avoid">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 border-b border-gray-200 pb-1">
                  Query: {group.question}
                </h3>
                <ul className="space-y-2">
                  {group.sources.map((src, j) => (
                    <li key={j} className="text-xs text-gray-600 flex items-start gap-2">
                      <span className="text-gray-400 font-mono">[{j + 1}]</span>
                      <a href={src.url} className="text-blue-600 hover:underline break-all leading-snug">
                        {src.title || src.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
