import React, { useState } from 'react';
import { AppProvider, useAppStore } from './store';
import { Home } from './components/Home';
import { QuizSession } from './components/QuizSession';
import { Dashboard } from './components/Dashboard';
import { Subject } from './types';
import { Brain, LayoutDashboard, Home as HomeIcon, Trash2, Globe, Moon, Sun } from 'lucide-react';
import { getTranslation } from './i18n';

type View = 'home' | 'quiz' | 'dashboard';

const MainApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [quizConfig, setQuizConfig] = useState<{ subject: Subject; topic: string; easyCount: number; mediumCount: number; hardCount: number } | null>(null);
  const { clearHistory, history, language, setLanguage, theme, setTheme } = useAppStore();
  const t = (key: any) => getTranslation(language, key);

  const handleStartQuiz = (subject: Subject, topic: string, easyCount: number, mediumCount: number, hardCount: number) => {
    setQuizConfig({ subject, topic, easyCount, mediumCount, hardCount });
    setCurrentView('quiz');
  };

  const handleFinishQuiz = () => {
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors font-sans text-slate-900 dark:text-slate-100">
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('home')}>
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white hidden sm:block">
                EduAI
              </span>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-4">
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
                title={theme === 'light' ? t('darkMode') : t('lightMode')}
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
                className="px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">{language === 'vi' ? 'EN' : 'VI'}</span>
              </button>
              <button
                onClick={() => setCurrentView('home')}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${currentView === 'home' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <HomeIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{t('home')}</span>
              </button>
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${currentView === 'dashboard' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">{t('analytics')}</span>
              </button>
              
              {history.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm(t('confirmClear'))) {
                      clearHistory();
                      setCurrentView('home');
                    }
                  }}
                  className="ml-2 p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                  title={t('clearHistory')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="py-8">
        {currentView === 'home' && <Home onStart={handleStartQuiz} />}
        {currentView === 'quiz' && quizConfig && (
          <QuizSession 
            subject={quizConfig.subject} 
            topic={quizConfig.topic} 
            easyCount={quizConfig.easyCount}
            mediumCount={quizConfig.mediumCount}
            hardCount={quizConfig.hardCount}
            onFinish={handleFinishQuiz} 
          />
        )}
        {currentView === 'dashboard' && <Dashboard />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
