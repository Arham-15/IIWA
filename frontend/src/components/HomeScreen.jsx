import React, { useState } from 'react';

export default function HomeScreen({ onNavigate }) {
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  return (
    <div className="flex flex-col w-full space-y-5">
      
      {/* Hero Header */}
      <section className="flex flex-col items-center text-center pt-2 pb-2 relative">
        <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full shadow-sm mb-3">
          <span className="material-symbols-outlined text-[15px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>electric_bolt</span>
          <span className="text-[11px] uppercase tracking-wider font-bold">Attendance &amp; Bunk Planner</span>
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-2">
          Bunk Smart
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
          Know exactly when you can take a breather without dropping below 75%.
        </p>

        <div className="mt-3 inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1.5 rounded-full shadow-sm text-emerald-800 dark:text-emerald-300">
          <span className="material-symbols-outlined text-[16px] text-emerald-600 dark:text-emerald-400">verified</span>
          <span className="text-xs font-semibold">Goal: <strong className="font-bold text-emerald-600 dark:text-emerald-400">75% Safe Threshold</strong></span>
        </div>
      </section>

      {/* Choice Action Cards */}
      <section className="flex flex-col gap-4">
        
        {/* Card 1: Enter Manually */}
        <button
          onClick={() => onNavigate('manual')}
          className="group relative flex flex-col text-left p-5 rounded-2xl bg-white dark:bg-slate-800/90 shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200 dark:border-slate-700 overflow-hidden active:scale-[0.99]"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
              <span className="material-symbols-outlined text-[24px]">calculate</span>
            </div>
            <div className="flex items-center gap-1 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 rounded-full">
              <span>Fast Formula</span>
              <span className="material-symbols-outlined text-[13px]">bolt</span>
            </div>
          </div>

          <div className="flex flex-col mb-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Enter Manually
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Type your attended &amp; total held classes directly to calculate instantly with precision.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
              <span className="material-symbols-outlined text-[16px] text-emerald-600 dark:text-emerald-400">check_circle</span>
              <span>No login needed</span>
            </div>
            <span className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
              Start Calculation
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </span>
          </div>
        </button>

        {/* Card 2: AI Screenshot Upload */}
        <button
          onClick={() => onNavigate('ai')}
          className="group relative flex flex-col text-left p-5 rounded-2xl bg-white dark:bg-slate-800/90 shadow-sm hover:shadow-md transition-all duration-200 border border-emerald-200/80 dark:border-emerald-800/50 overflow-hidden active:scale-[0.99]"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
              <span className="material-symbols-outlined text-[24px]">document_scanner</span>
            </div>
            
            <div className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 rounded-full shadow-sm text-[11px] font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <span>AI Powered</span>
            </div>
          </div>

          <div className="flex flex-col mb-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Upload Screenshot (AI)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Snap or drop your college portal attendance table and let smart OCR parse all subjects.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
              <span className="material-symbols-outlined text-[16px] text-indigo-600 dark:text-indigo-400">speed</span>
              <span>Takes 5 seconds</span>
            </div>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
              Scan Attendance
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </span>
          </div>
        </button>

      </section>

      {/* How the Buffer Works */}
      <section className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">How The Buffer Works</span>
          <span className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">Standard 75% Rule</span>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 dark:text-slate-400">Target Baseline</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">75.0% (Safe Limit)</span>
          </div>
          <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
            <div className="h-full bg-emerald-500 transition-all" style={{ width: '75%' }}></div>
            <div className="h-full bg-rose-400/70 transition-all" style={{ width: '25%' }}></div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
            <span>Minimum Attended: 75%</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Safe Buffer Zone</span>
            <span>Max Misses: 25%</span>
          </div>
        </div>
      </section>

      {/* Formula Dialog Trigger */}
      <div className="flex justify-center pt-1">
        <button
          onClick={() => setShowFormulaModal(true)}
          className="inline-flex items-center gap-1.5 py-1.5 px-3.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-semibold transition-colors rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">info</span>
          <span>See Bunk Allowance Formulas &amp; Rules</span>
        </button>
      </div>

      {/* Formula Modal */}
      {showFormulaModal && (
        <div 
          onClick={() => setShowFormulaModal(false)}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 space-y-4"
          >
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto sm:hidden"></div>
            
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">functions</span>
                The Bunk Smart Math
              </h3>
              <button
                onClick={() => setShowFormulaModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl space-y-1">
                <span className="text-emerald-700 dark:text-emerald-400 font-bold block">When Above 75% (Safe Bunk Zone):</span>
                <code className="block font-mono bg-white dark:bg-slate-900 p-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold">
                  Bunks = Floor((Attended - 0.75 * Total) / 0.75)
                </code>
                <p>How many classes you can miss before crossing under the 75% threshold.</p>
              </div>
              
              <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl space-y-1">
                <span className="text-rose-700 dark:text-rose-400 font-bold block">When Below 75% (Catch-Up Goal):</span>
                <code className="block font-mono bg-white dark:bg-slate-900 p-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold">
                  Required = Smallest n where (Attended + n)/(Total + n) ? 0.75
                </code>
                <p>The number of consecutive classes you must attend to recover.</p>
              </div>
            </div>

            <button
              onClick={() => setShowFormulaModal(false)}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center shadow-md active:scale-[0.98] transition-transform"
              type="button"
            >
              Got it, let's calculate!
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
