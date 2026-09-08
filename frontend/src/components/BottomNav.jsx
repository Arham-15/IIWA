import React from 'react';

export default function BottomNav({ currentScreen, onNavigate }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: 'dashboard' },
    { id: 'manual', label: 'Manual', icon: 'edit_calendar' },
    { id: 'ai', label: 'AI Upload', icon: 'document_scanner' },
    { id: 'results', label: 'Results', icon: 'analytics' },
  ];

  return (
    <nav className="fixed bottom-0 max-w-lg w-full z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-lg">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all gap-1 ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {item.icon}
              </span>
              <span className="text-[11px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
