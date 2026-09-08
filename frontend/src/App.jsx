import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import HomeScreen from './components/HomeScreen';
import ManualEntryScreen from './components/ManualEntryScreen';
import AIUploadScreen from './components/AIUploadScreen';
import ResultsScreen from './components/ResultsScreen';
import ErrorModal from './components/ErrorModal';
import { calculateManual, calculateAI } from './api/attendanceApi';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home' | 'manual' | 'ai' | 'results'
  const [lastMode, setLastMode] = useState('manual');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSubmittedData, setLastSubmittedData] = useState(null);

  // Top-level Theme Manager
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('bunksmart_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      try { localStorage.setItem('bunksmart_theme', 'dark'); } catch(e) {}
    } else {
      root.classList.remove('dark');
      try { localStorage.setItem('bunksmart_theme', 'light'); } catch(e) {}
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const handleNavigate = (screen) => {
    setError(null);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCalculateManual = async (formData) => {
    setIsLoading(true);
    setError(null);
    setLastSubmittedData({ type: 'manual', data: formData });
    setLastMode('manual');

    try {
      const data = await calculateManual(formData);
      setResult(data);
      setCurrentScreen('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError({
        status: err.status || 0,
        message: err.message,
        detail: err.detail,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalculateAI = async (file) => {
    setIsLoading(true);
    setError(null);
    setLastSubmittedData({ type: 'ai', file });
    setLastMode('ai');

    try {
      const data = await calculateAI(file);
      setResult(data);
      setCurrentScreen('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError({
        status: err.status || 0,
        message: err.message,
        detail: err.detail,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (!lastSubmittedData) return;
    setError(null);
    if (lastSubmittedData.type === 'manual') {
      handleCalculateManual(lastSubmittedData.data);
    } else if (lastSubmittedData.type === 'ai') {
      handleCalculateAI(lastSubmittedData.file);
    }
  };

  const handleReset = () => {
    setError(null);
    setCurrentScreen(lastMode === 'ai' ? 'ai' : 'manual');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'} transition-colors duration-200 flex justify-center antialiased`}>
      {/* Centered Mobile/Tablet App Shell Container */}
      <div className="w-full max-w-lg min-h-screen bg-white dark:bg-slate-900 border-x border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col relative pb-20 transition-colors duration-200">
        
        {/* Fixed Top Header */}
        <Header
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />

        {/* Main Screen Content Area */}
        <main className="flex-1 flex flex-col w-full px-4 pt-20 pb-8 relative">
          {currentScreen === 'home' && (
            <HomeScreen onNavigate={handleNavigate} />
          )}

          {currentScreen === 'manual' && (
            <ManualEntryScreen
              onCalculate={handleCalculateManual}
              onNavigate={handleNavigate}
              isLoading={isLoading}
            />
          )}

          {currentScreen === 'ai' && (
            <AIUploadScreen
              onAnalyze={handleCalculateAI}
              onNavigate={handleNavigate}
              isLoading={isLoading}
            />
          )}

          {currentScreen === 'results' && (
            <ResultsScreen
              result={result}
              lastMode={lastMode}
              onReset={handleReset}
              onNavigate={handleNavigate}
            />
          )}
        </main>

        {/* Fixed Bottom Navigation */}
        <BottomNav currentScreen={currentScreen} onNavigate={handleNavigate} />

        {/* Error Alert Modal */}
        {error && (
          <ErrorModal
            error={error}
            onClose={() => setError(null)}
            onSwitchToManual={currentScreen === 'ai' ? () => handleNavigate('manual') : null}
            onRetry={lastSubmittedData ? handleRetry : null}
          />
        )}

      </div>
    </div>
  );
}
