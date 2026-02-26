import React, { createContext, useContext, useState, useEffect } from 'react';
import { AnswerRecord, Subject, Language, Theme } from './types';

interface AppState {
  history: AnswerRecord[];
  addRecord: (record: AnswerRecord) => void;
  clearHistory: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const AppContext = createContext<AppState | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<AnswerRecord[]>(() => {
    const saved = localStorage.getItem('quiz_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('quiz_language') as Language) || 'vi';
  });

  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('quiz_theme') as Theme) || 'light';
  });

  useEffect(() => {
    localStorage.setItem('quiz_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('quiz_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('quiz_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const addRecord = (record: AnswerRecord) => {
    setHistory((prev) => [...prev, record]);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <AppContext.Provider value={{ 
      history, addRecord, clearHistory,
      language, setLanguage,
      theme, setTheme
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppStore must be used within AppProvider');
  return context;
};
