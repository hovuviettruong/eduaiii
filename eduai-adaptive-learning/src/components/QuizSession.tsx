import React, { useState, useEffect } from 'react';
import { Subject, Difficulty, QuestionType, Question, AnswerRecord } from '../types';
import { generateQuestionBatch } from '../services/gemini';
import { useAppStore } from '../store';
import { getTranslation } from '../i18n';
import { Loader2, CheckCircle2, XCircle, ArrowRight, AlertTriangle, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import html2pdf from 'html2pdf.js';

interface QuizSessionProps {
  subject: Subject;
  topic: string;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  onFinish: () => void;
}

export const QuizSession: React.FC<QuizSessionProps> = ({ subject, topic, easyCount, mediumCount, hardCount, onFinish }) => {
  const { addRecord, language } = useAppStore();
  const t = (key: any) => getTranslation(language, key);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const batch = await generateQuestionBatch(subject, topic, easyCount, mediumCount, hardCount, language);
      setQuestions(batch);
      setStartTime(Date.now());
    } catch (error) {
      console.error("Failed to generate questions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null || !currentQuestion) return;
    
    setSelectedAnswer(index);
    setShowExplanation(true);
    
    const isCorrect = index === currentQuestion.correctAnswerIndex;
    const timeTaken = Date.now() - startTime;

    const record: AnswerRecord = {
      id: Math.random().toString(36).substring(7),
      questionId: currentQuestion.id,
      question: currentQuestion,
      selectedAnswerIndex: index,
      isCorrect,
      timeTakenMs: timeTaken,
      timestamp: Date.now(),
    };

    addRecord(record);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      onFinish();
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setStartTime(Date.now());
    }
  };

  const downloadQuestions = () => {
    const element = document.getElementById('pdf-export-content');
    if (!element) return;
    
    const opt = {
      margin:       15,
      filename:     `bo-cau-hoi-${subject}-${Date.now()}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      pagebreak:    { mode: 'avoid-all' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
        <p className="text-slate-600 dark:text-slate-400 animate-pulse">{t('analyzing')} {easyCount + mediumCount + hardCount} {t('question').toLowerCase()}...</p>
      </div>
    );
  }

  if (questions.length === 0) return null;

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium">
            {t('question')} {currentIndex + 1}/{questions.length}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            currentQuestion.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
            currentQuestion.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
            'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
          }`}>
            {t('difficulty')}: {currentQuestion.difficulty === 'Easy' ? t('easy') : currentQuestion.difficulty === 'Medium' ? t('medium') : t('hard')}
          </span>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={downloadQuestions}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-lg transition-colors border border-indigo-100 dark:border-indigo-500/20"
          title="Download"
        >
          <Download className="w-4 h-4" />
          <span>{t('download')}</span>
        </button>
      </div>

      <div style={{ overflow: 'hidden', height: 0 }}>
        <div id="pdf-export-content" className="p-8 bg-white text-black w-[800px] font-sans">
          <h1 className="text-2xl font-bold mb-6 text-center">Bộ câu hỏi: {topic} - Môn {subject}</h1>
          {questions.map((q, i) => (
            <div key={i} className="mb-8 break-inside-avoid">
              <div className="font-bold mb-2 flex gap-2">
                <span className="whitespace-nowrap">Câu {i + 1}:</span>
                <div>
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {q.content}
                  </ReactMarkdown>
                </div>
              </div>
              <div className="ml-4 space-y-2 mb-4">
                {q.options.map((opt, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="font-medium">{String.fromCharCode(65 + idx)}.</span>
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={{p: React.Fragment}}>
                      {opt}
                    </ReactMarkdown>
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="font-bold text-emerald-600 mb-2">Đáp án đúng: {String.fromCharCode(65 + q.correctAnswerIndex)}</p>
                <div className="font-medium mb-1">Giải thích:</div>
                <div className="text-slate-700">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {q.explanation}
                  </ReactMarkdown>
                </div>
                <div className="mt-2 text-sm text-slate-500 italic">
                  Độ khó: {q.difficulty} | Loại: {q.type}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 space-y-8 transition-colors">
        <div className="prose prose-slate dark:prose-invert max-w-none text-lg">
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
            {currentQuestion.content}
          </ReactMarkdown>
        </div>

        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedAnswer === idx;
            const isCorrect = idx === currentQuestion.correctAnswerIndex;
            const showResult = selectedAnswer !== null;
            
            let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all ";
            
            if (!showResult) {
              btnClass += "border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-700/50";
            } else {
              if (isCorrect) {
                btnClass += "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-900 dark:text-emerald-400";
              } else if (isSelected) {
                btnClass += "border-rose-500 bg-rose-50 dark:bg-rose-500/10 text-rose-900 dark:text-rose-400";
              } else {
                btnClass += "border-slate-200 dark:border-slate-700 opacity-50";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={showResult}
                className={btnClass}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {String.fromCharCode(65 + idx)}.{' '}
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={{p: React.Fragment}}>
                      {option}
                    </ReactMarkdown>
                  </span>
                  {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 ml-2" />}
                  {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0 ml-2" />}
                </div>
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-4">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">{t('explanation')}</h4>
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                {currentQuestion.explanation}
              </ReactMarkdown>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleNext}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                {currentIndex + 1 >= questions.length ? t('viewResults') : t('nextQuestion')}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
