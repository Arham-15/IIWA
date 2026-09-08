import React, { useState } from 'react';

export default function ResultsScreen({ result, lastMode, onReset, onNavigate }) {
  const [toastText, setToastText] = useState(null);
  const [bookmarked, setBookmarked] = useState(false);

  if (!result) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-slate-500">No attendance calculation data available.</p>
        <button
          onClick={() => onNavigate('home')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold text-sm"
        >
          Go to Home
        </button>
      </div>
    );
  }

  const {
    current_percentage = 0,
    target_percentage = 75,
    max_bunks = 0,
    classes_needed = null,
    message = '',
  } = result;

  const isSafe = current_percentage >= target_percentage;
  const pctDiff = Math.abs(current_percentage - target_percentage).toFixed(1);

  // SVG Gauge calculations (Circumference = 2 * PI * 68 = ~427.25)
  const circumference = 427.25;
  const progressRatio = Math.min(Math.max(current_percentage / 100, 0), 1);
  const strokeDashoffset = circumference * (1 - progressRatio);

  const showToast = (text) => {
    setToastText(text);
    setTimeout(() => {
      setToastText(null);
    }, 2800);
  };

  const handleShare = () => {
    const summary = `Bunk Smart Attendance Report:\n` +
      `? Current Attendance: ${current_percentage}%\n` +
      `? Target Goal: ${target_percentage}%\n` +
      (isSafe
        ? `? Safe Bunks Available: ${max_bunks} class${max_bunks === 1 ? '' : 'es'}\n`
        : `? Consecutive Classes Needed: ${classes_needed ?? 0}\n`) +
      `? Note: ${message}\n` +
      `Calculated with Bunk Smart`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary).then(() => {
        showToast('Report copied to clipboard!');
      }).catch(() => {
        showToast('Summary copied!');
      });
    } else {
      showToast('Summary copied!');
    }
  };

  return (
    <div className="flex flex-col w-full space-y-4 animate-in fade-in zoom-in-95 duration-200">
      
      {/* Top Navigation & Report Meta Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <button
            aria-label="Go back"
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
            onClick={onReset}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <div className="flex flex-col min-w-0">
            <span className="text-base font-bold text-slate-900 dark:text-white truncate">Attendance Report</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Live Analysis ? 75% Rule</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
            onClick={() => {
              setBookmarked(!bookmarked);
              showToast(bookmarked ? 'Removed from bookmarks' : 'Report saved to bookmarks');
            }}
            type="button"
          >
            <span className={`material-symbols-outlined text-[18px] ${bookmarked ? 'text-indigo-600' : ''}`}>
              {bookmarked ? 'bookmark' : 'bookmark_border'}
            </span>
          </button>
          <button
            className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
            onClick={handleShare}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">ios_share</span>
          </button>
        </div>
      </div>

      {/* Hero Circular Progress Card */}
      <div className="relative w-full rounded-2xl bg-white dark:bg-slate-800/90 shadow-sm p-6 flex flex-col items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
        
        <div className="flex items-center justify-between w-full mb-2 z-10">
          <span className={`text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
            isSafe
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isSafe ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
            {isSafe ? 'Target Achieved' : 'Below Threshold'}
          </span>
          <span className="text-xs text-slate-400 font-medium">Bunk Smart Engine</span>
        </div>

        {/* Centered Gauge Visualizer */}
        <div className="relative flex items-center justify-center my-3 z-10">
          <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 160 160">
            {/* Track circle */}
            <circle
              className="text-slate-100 dark:text-slate-700"
              cx="80"
              cy="80"
              fill="transparent"
              r="68"
              stroke="currentColor"
              strokeWidth="12"
            />
            {/* Progress ring */}
            <circle
              className={`transition-all duration-1000 ease-out ${
                isSafe ? 'text-emerald-500' : 'text-rose-500'
              }`}
              cx="80"
              cy="80"
              fill="transparent"
              r="68"
              stroke="currentColor"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              strokeWidth="12"
            />
          </svg>

          {/* Center Data */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {current_percentage}<span className={`text-xl ${isSafe ? 'text-emerald-500' : 'text-rose-500'}`}>%</span>
            </span>
            <div className={`mt-1 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isSafe
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
            }`}>
              <span className="material-symbols-outlined text-[13px]">
                {isSafe ? 'verified' : 'warning'}
              </span>
              <span>{isSafe ? 'Safe Zone' : 'Action Required'}</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {isSafe ? `+${pctDiff}% above min req` : `-${pctDiff}% below 75% cutoff`}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 text-center z-10">
          Calculated against minimum mandatory threshold of <strong className="text-slate-800 dark:text-slate-200 font-semibold">{target_percentage.toFixed(1)}%</strong>
        </p>
      </div>

      {/* Key Takeaway Announcement Banner */}
      <div className={`w-full rounded-2xl p-4 shadow-sm relative overflow-hidden border ${
        isSafe
          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80'
          : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/80'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm mt-0.5 ${
            isSafe
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}>
            <span className="material-symbols-outlined text-[20px]">
              {isSafe ? 'celebration' : 'warning'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 flex-wrap">
              <span className={`text-[11px] uppercase font-bold tracking-wider ${
                isSafe ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
              }`}>
                {isSafe ? 'Good to relax' : 'Shortfall Alert'}
              </span>
              <span className="text-[11px] text-slate-400">
                ? {isSafe ? 'Max Safe Buffer' : 'Recovery Action'}
              </span>
            </div>

            <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {isSafe
                ? `You can safely skip ${max_bunks} more class${max_bunks === 1 ? '' : 'es'}!`
                : `Must attend next ${classes_needed ?? 0} consecutive class${classes_needed === 1 ? '' : 'es'}`}
            </h2>

            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {message}
            </p>
          </div>
        </div>
      </div>

      {/* Extracted Source Data Banner */}
      {(result.total_classes !== undefined && result.attended_classes !== undefined) && (
        <div className="w-full rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 p-3.5 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-[20px] shrink-0">fact_check</span>
            <div className="min-w-0">
              <span className="text-[10.5px] uppercase font-bold text-indigo-600 dark:text-indigo-400 block tracking-wider">
                {lastMode === 'ai' ? 'AI OCR Extracted Counts' : 'Entered Counts'}
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                {result.attended_classes} Attended / {result.total_classes} Total Classes Held
              </span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('manual')}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold text-xs border border-indigo-200 dark:border-slate-700 shadow-sm hover:scale-105 active:scale-95 transition-all shrink-0"
            type="button"
            title="Adjust numbers in manual entry"
          >
            Adjust
          </button>
        </div>
      )}

      {/* Breakdown Stats 4-Grid Card */}
      <div className="w-full rounded-2xl bg-white dark:bg-slate-800/90 p-4 shadow-sm space-y-3 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">Attendance Metrics</h3>
          <span className="text-[11px] text-slate-400 font-medium">75% Target Model</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Target Required */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px]">Required Cutoff</span>
              <span className="material-symbols-outlined text-[16px]">rule</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-slate-900 dark:text-white">75.0%</span>
              <span className="text-[11px] text-slate-400">cutoff</span>
            </div>
          </div>

          {/* Current Rate */}
          <div className={`p-3 rounded-xl flex flex-col justify-between border ${
            isSafe
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60'
          }`}>
            <div className={`flex items-center justify-between mb-1 ${
              isSafe ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
            }`}>
              <span className="text-[11px] font-bold">Current Rate</span>
              <span className="material-symbols-outlined text-[16px]">
                {isSafe ? 'trending_up' : 'trending_down'}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-xl font-bold ${
                isSafe ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
              }`}>
                {current_percentage}%
              </span>
              <span className="text-[11px] text-slate-400">actual</span>
            </div>
          </div>

          {/* Safe Bunks */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px]">Safe Bunks</span>
              <span className="material-symbols-outlined text-[16px] text-indigo-600 dark:text-indigo-400">beach_access</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{max_bunks}</span>
              <span className="text-[11px] text-slate-400">allowed</span>
            </div>
          </div>

          {/* Classes Needed */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px]">Classes Needed</span>
              <span className="material-symbols-outlined text-[16px] text-emerald-600 dark:text-emerald-400">check_circle</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {classes_needed ?? 0}
              </span>
              <span className="text-[11px] text-slate-400">consecutive</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pro-Tip Reassurance Card */}
      <div className="w-full rounded-2xl bg-slate-100 dark:bg-slate-800/60 p-3.5 border border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400">
          <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider block">
            Academic Pro-Tip
          </span>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-normal">
            {isSafe
              ? `Keep a safety cushion of 1-2 classes in case of surprise quiz days or unexpected roll calls.`
              : `Attend all scheduled classes this week to quickly pull your percentage back over 75%.`}
          </p>
        </div>
      </div>

      {/* Primary Action Stack */}
      <div className="w-full space-y-2 pt-1">
        <button
          onClick={onReset}
          className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">refresh</span>
          <span>Calculate Again / Another Subject</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleShare}
            className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-200 dark:border-slate-700"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">share</span>
            <span>Share Report</span>
          </button>

          <button
            onClick={() => onNavigate(lastMode === 'ai' ? 'manual' : 'ai')}
            className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-200 dark:border-slate-700"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">
              {lastMode === 'ai' ? 'edit_calendar' : 'document_scanner'}
            </span>
            <span>{lastMode === 'ai' ? 'Manual Entry' : 'AI Scanner'}</span>
          </button>
        </div>
      </div>

      {/* Toast Notification Modal */}
      {toastText && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 border border-slate-700">
          <span className="material-symbols-outlined text-emerald-400 text-[16px]">check_circle</span>
          <span>{toastText}</span>
        </div>
      )}

    </div>
  );
}
