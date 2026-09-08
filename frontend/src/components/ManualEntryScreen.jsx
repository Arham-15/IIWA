import React, { useState } from 'react';

export default function ManualEntryScreen({ onCalculate, onNavigate, isLoading }) {
  const [total, setTotal] = useState('48');
  const [attended, setAttended] = useState('40');
  const [remaining, setRemaining] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);

  const totalNum = parseInt(total, 10);
  const attendedNum = parseInt(attended, 10);
  const remainingNum = remaining !== '' ? parseInt(remaining, 10) : null;

  const hasValidNumbers = !isNaN(totalNum) && !isNaN(attendedNum) && totalNum > 0 && attendedNum >= 0 && attendedNum <= totalNum;
  const currentPercentage = hasValidNumbers ? ((attendedNum / totalNum) * 100).toFixed(1) : '0.0';
  const isSafe = hasValidNumbers ? parseFloat(currentPercentage) >= 75 : false;

  const allowedBunks = hasValidNumbers && isSafe ? Math.floor((attendedNum - (0.75 * totalNum)) / 0.75) : 0;
  
  let neededClasses = 0;
  if (hasValidNumbers && !isSafe) {
    let n = 0;
    while ((attendedNum + n) / (totalNum + n) < 0.75 && n < 100000) {
      n++;
    }
    neededClasses = n;
  }

  const adjustValue = (field, delta) => {
    setErrorMsg(null);
    if (field === 'total') {
      const val = Math.max(1, (isNaN(totalNum) ? 0 : totalNum) + delta);
      setTotal(String(val));
      if (attendedNum > val) setAttended(String(val));
    } else if (field === 'attended') {
      const maxVal = isNaN(totalNum) ? 300 : totalNum;
      const val = Math.max(0, Math.min(maxVal, (isNaN(attendedNum) ? 0 : attendedNum) + delta));
      setAttended(String(val));
    } else if (field === 'remaining') {
      const current = isNaN(remainingNum) ? 0 : (remainingNum || 0);
      const val = Math.max(0, current + delta);
      setRemaining(String(val));
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    if (isNaN(totalNum) || totalNum <= 0) {
      setErrorMsg('Total classes held must be greater than 0.');
      return;
    }

    if (isNaN(attendedNum) || attendedNum < 0) {
      setErrorMsg('Attended classes cannot be negative.');
      return;
    }

    if (attendedNum > totalNum) {
      setErrorMsg('Attended classes cannot exceed total classes held.');
      return;
    }

    if (remaining !== '' && (isNaN(remainingNum) || remainingNum < 0)) {
      setErrorMsg('Remaining classes must be 0 or positive.');
      return;
    }

    onCalculate({
      total: totalNum,
      attended: attendedNum,
      remaining: remainingNum,
    });
  };

  return (
    <div className="flex flex-col w-full space-y-4">
      {/* Back Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="group inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold text-xs py-1 hover:underline"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-0.5">arrow_back</span>
          <span>Back to Home</span>
        </button>

        <button
          onClick={() => onNavigate('ai')}
          className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline text-xs font-semibold"
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">document_scanner</span>
          <span>Switch to AI Scanner</span>
        </button>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Manual Calculation</h1>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] uppercase font-bold tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Calc
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Enter your official attendance numbers from your student portal.
        </p>
      </div>

      {/* Live Ratio Preview Card */}
      <div className="flex items-center justify-between p-3.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <span className="material-symbols-outlined text-[20px]">donut_large</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Current Ratio</span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
              {currentPercentage}% Attended
            </span>
          </div>
        </div>

        <span className={`px-2.5 py-1 rounded-full text-xs uppercase font-bold tracking-wide border ${
          isSafe
            ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
            : 'bg-rose-100 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
        }`}>
          {isSafe ? 'Safe Zone' : 'Action Required'}
        </span>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Entry Form Surface */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5 bg-white dark:bg-slate-800/90 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        
        {/* Mandatory Target Locked Pill */}
        <div className="flex items-center justify-between p-2.5 px-3 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <span className="material-symbols-outlined text-[14px]">lock</span>
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Target Requirement</span>
          </div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
            75% Mandatory
          </span>
        </div>

        {/* Field 1: Total Classes Held */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-baseline">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200" htmlFor="total-held">
              Total classes held <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">Conducted so far</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              aria-label="Decrease total classes held"
              className="w-11 h-11 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95 flex items-center justify-center text-slate-800 dark:text-slate-100 transition-all font-bold"
              onClick={() => adjustValue('total', -1)}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">remove</span>
            </button>
            <div className="relative flex-1">
              <input
                className="w-full h-11 px-3 text-center font-bold text-lg text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                id="total-held"
                min="1"
                max="500"
                value={total}
                onChange={(e) => {
                  setTotal(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="e.g. 48"
                type="number"
              />
            </div>
            <button
              aria-label="Increase total classes held"
              className="w-11 h-11 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95 flex items-center justify-center text-slate-800 dark:text-slate-100 transition-all font-bold"
              onClick={() => adjustValue('total', 1)}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400 px-0.5">
            Total number of lectures/labs conducted so far this semester.
          </p>
        </div>

        {/* Field 2: Classes Attended */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-baseline">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200" htmlFor="classes-attended">
              Classes attended <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">Marked present</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              aria-label="Decrease classes attended"
              className="w-11 h-11 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95 flex items-center justify-center text-slate-800 dark:text-slate-100 transition-all font-bold"
              onClick={() => adjustValue('attended', -1)}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">remove</span>
            </button>
            <div className="relative flex-1">
              <input
                className="w-full h-11 px-3 text-center font-bold text-lg text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                id="classes-attended"
                min="0"
                max="500"
                value={attended}
                onChange={(e) => {
                  setAttended(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="e.g. 40"
                type="number"
              />
            </div>
            <button
              aria-label="Increase classes attended"
              className="w-11 h-11 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95 flex items-center justify-center text-slate-800 dark:text-slate-100 transition-all font-bold"
              onClick={() => adjustValue('attended', 1)}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400 px-0.5">
            Number of lectures you were marked present for.
          </p>
        </div>

        {/* Field 3: Classes Remaining (Optional) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-baseline">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200" htmlFor="classes-remaining">
              Classes remaining this semester
            </label>
            <span className="text-[11px] text-slate-400">Optional</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              aria-label="Decrease remaining classes"
              className="w-11 h-11 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95 flex items-center justify-center text-slate-800 dark:text-slate-100 transition-all font-bold"
              onClick={() => adjustValue('remaining', -1)}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">remove</span>
            </button>
            <div className="relative flex-1">
              <input
                className="w-full h-11 px-3 text-center font-bold text-lg text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                id="classes-remaining"
                min="0"
                max="300"
                value={remaining}
                onChange={(e) => {
                  setRemaining(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="e.g. 24 (optional)"
                type="number"
              />
            </div>
            <button
              aria-label="Increase remaining classes"
              className="w-11 h-11 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95 flex items-center justify-center text-slate-800 dark:text-slate-100 transition-all font-bold"
              onClick={() => adjustValue('remaining', 1)}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400 px-0.5">
            Estimated future classes left in the term to project maximum safe bunks.
          </p>
        </div>

        {/* Live Calculation Teaser Bar */}
        {hasValidNumbers && (
          <div className={`p-3 rounded-xl flex items-center gap-2.5 border ${
            isSafe
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-slate-800 dark:text-slate-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-slate-800 dark:text-slate-200'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              isSafe
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                : 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300'
            }`}>
              <span className="material-symbols-outlined text-[18px]">
                {isSafe ? 'verified' : 'warning'}
              </span>
            </div>
            <p className="text-xs leading-relaxed">
              {isSafe ? (
                <>
                  You can safely bunk <strong className="font-bold text-emerald-600 dark:text-emerald-400">{allowedBunks} more classes</strong> right now.
                </>
              ) : (
                <>
                  Attendance low! Must attend next <strong className="font-bold text-rose-600 dark:text-rose-400">{neededClasses} consecutive classes</strong> to reach 75%.
                </>
              )}
            </p>
          </div>
        )}

        {/* Prominent CTA Button */}
        <button
          disabled={isLoading}
          className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
          type="submit"
        >
          {isLoading ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">refresh</span>
              <span>Computing Bunks...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">calculate</span>
              <span>Calculate Bunks</span>
            </>
          )}
        </button>
      </form>

      {/* Formula Disclaimer */}
      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start gap-2 text-slate-500 dark:text-slate-400 text-xs">
        <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">info</span>
        <p className="leading-relaxed">
          Formula follows standard university attendance criteria: <strong className="text-slate-700 dark:text-slate-300 font-semibold">(Attended / Total) ? 0.75</strong>.
        </p>
      </div>
    </div>
  );
}
