import React from 'react';
import { ShieldCheck, Sparkles, Calculator, HelpCircle } from 'lucide-react';

export default function Navbar({ currentScreen, onNavigate }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <button 
          onClick={() => onNavigate('home')} 
          className="flex items-center gap-2.5 group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                AttendanceSafe
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                75% Target
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-none">Smart Bunk & Attendance Planner</p>
          </div>
        </button>

        {/* Navigation Switchers */}
        <nav className="flex items-center gap-2">
          {currentScreen !== 'home' && (
            <button
              onClick={() => onNavigate('home')}
              className="px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
            >
              Home
            </button>
          )}

          <button
            onClick={() => onNavigate('manual')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              currentScreen === 'manual'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Manual</span>
          </button>

          <button
            onClick={() => onNavigate('ai')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              currentScreen === 'ai'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Upload</span>
          </button>
        </nav>

      </div>
    </header>
  );
}
