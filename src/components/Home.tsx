import React, { useState } from 'react';
import { Subject } from '../types';
import { useAppStore } from '../store';
import { getTranslation } from '../i18n';
import { BookOpen, Calculator, Atom, Beaker } from 'lucide-react';

interface HomeProps {
  onStart: (subject: Subject, topic: string, easyCount: number, mediumCount: number, hardCount: number) => void;
}

const TOPICS: Record<Subject, string[]> = {
  'Toán': ['Chương trình Toán 10', 'Chương trình Toán 11', 'Chương trình Toán 12'],
  'Vật lý': ['Chương trình Vật lý 10', 'Chương trình Vật lý 11', 'Chương trình Vật lý 12'],
  'Hóa học': ['Chương trình Hóa học 10', 'Chương trình Hóa học 11', 'Chương trình Hóa học 12']
};

export const Home: React.FC<HomeProps> = ({ onStart }) => {
  const { language } = useAppStore();
  const t = (key: any) => getTranslation(language, key);

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [easyCount, setEasyCount] = useState<number>(2);
  const [mediumCount, setMediumCount] = useState<number>(2);
  const [hardCount, setHardCount] = useState<number>(1);

  const handleStart = () => {
    if (selectedSubject && selectedTopic) {
      onStart(selectedSubject, selectedTopic, easyCount, mediumCount, hardCount);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('title') || 'Nền tảng Trắc nghiệm Thông minh'}
        </h1>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 space-y-8 transition-colors">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{t('selectSubject')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['Toán', 'Vật lý', 'Hóa học'] as Subject[]).map((subject) => (
              <button
                key={subject}
                onClick={() => {
                  setSelectedSubject(subject);
                  setSelectedTopic(TOPICS[subject][0]);
                }}
                className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                  selectedSubject === subject
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                {subject === 'Toán' && <Calculator className="w-6 h-6" />}
                {subject === 'Vật lý' && <Atom className="w-6 h-6" />}
                {subject === 'Hóa học' && <Beaker className="w-6 h-6" />}
                <span className="font-medium text-lg">
                  {subject === 'Toán' ? t('math') : subject === 'Vật lý' ? t('physics') : t('chemistry')}
                </span>
              </button>
            ))}
          </div>
        </div>

        {selectedSubject && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{t('selectTopic')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TOPICS[selectedSubject].map((topic) => (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedTopic === topic
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-md'
                      : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedSubject && selectedTopic && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{t('questionCount')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('easyCount')}</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={easyCount}
                  onChange={(e) => setEasyCount(Math.max(0, Math.min(10, Number(e.target.value))))}
                  className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/20 outline-none transition-all text-lg font-medium text-slate-700 dark:text-slate-200"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('mediumCount')}</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={mediumCount}
                  onChange={(e) => setMediumCount(Math.max(0, Math.min(10, Number(e.target.value))))}
                  className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/20 outline-none transition-all text-lg font-medium text-slate-700 dark:text-slate-200"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('hardCount')}</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={hardCount}
                  onChange={(e) => setHardCount(Math.max(0, Math.min(10, Number(e.target.value))))}
                  className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/20 outline-none transition-all text-lg font-medium text-slate-700 dark:text-slate-200"
                />
              </div>
            </div>
            {(easyCount + mediumCount + hardCount) === 0 && (
              <p className="text-rose-500 text-sm mt-2">Vui lòng chọn ít nhất 1 câu hỏi.</p>
            )}
          </div>
        )}

        <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
          <button
            onClick={handleStart}
            disabled={!selectedSubject || !selectedTopic || (easyCount + mediumCount + hardCount) === 0}
            className="px-8 py-3 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <BookOpen className="w-5 h-5" />
            {t('startQuiz')}
          </button>
        </div>
      </div>
    </div>
  );
};
