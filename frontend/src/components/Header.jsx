import React from 'react';

export default function Header({ currentScreen, onNavigate, isDark, onToggleTheme }) {
  const getSubtitle = () => {
    switch (currentScreen) {
      case 'manual': return 'Manual Entry';
      case 'ai': return 'AI Upload';
      case 'results': return 'Attendance Results';
      default: return 'Home';
    }
  };

  return (
    <header className="fixed top-0 max-w-lg w-full z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
      <div className="h-16 px-4 flex items-center justify-between gap-2">
        <button 
          onClick={() => onNavigate('home')} 
          className="flex items-center gap-2.5 min-w-0 text-left focus:outline-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 shrink-0 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[20px]">shield</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-base text-slate-900 dark:text-white leading-tight truncate">
              Bunk Smart
            </span>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
              {getSubtitle()}
            </span>
          </div>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-2.5 py-1 flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300">
            <span className="material-symbols-outlined text-[15px]">verified</span>
            <span className="text-xs font-bold">75% Target</span>
          </div>

          <button
            aria-label="Toggle theme"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all focus:outline-none border border-slate-200 dark:border-slate-700"
            onClick={onToggleTheme}
            type="button"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <span className={`material-symbols-outlined text-[20px] transition-transform ${isDark ? 'text-amber-400' : 'text-slate-700'}`}>
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
