import React, { useMemo } from 'react';
import { useAppStore } from '../store';
import { getTranslation } from '../i18n';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, CheckCircle2, BrainCircuit, TrendingDown, Clock, Activity, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import html2pdf from 'html2pdf.js';

export const Dashboard: React.FC = () => {
  const { history, language } = useAppStore();
  const t = (key: any) => getTranslation(language, key);

  const stats = useMemo(() => {
    if (history.length === 0) return null;

    const total = history.length;
    const correct = history.filter(h => h.isCorrect).length;
    const accuracy = Math.round((correct / total) * 100);
    const avgTime = Math.round(history.reduce((acc, curr) => acc + curr.timeTakenMs, 0) / total / 1000);

    // Knowledge Gap Prediction (Simple heuristic for demo)
    const recentErrors = history.slice(-5).filter(h => !h.isCorrect).length;
    const timeTrend = history.slice(-3).map(h => h.timeTakenMs);
    const isSlowingDown = timeTrend.length === 3 && timeTrend[2] > timeTrend[1] && timeTrend[1] > timeTrend[0];
    
    let riskLevel = 'Thấp';
    if (recentErrors >= 3 || (recentErrors >= 2 && isSlowingDown)) riskLevel = 'Cao';
    else if (recentErrors === 2) riskLevel = 'Trung bình';

    const chartData = history.map((h, i) => ({
      name: `${t('question')} ${i + 1}`,
      time: Math.round(h.timeTakenMs / 1000),
      isCorrect: h.isCorrect ? 1 : 0,
      difficulty: h.question.difficulty === 'Easy' ? 1 : h.question.difficulty === 'Medium' ? 2 : 3
    }));

    return { total, correct, accuracy, avgTime, riskLevel, chartData };
  }, [history]);

  const downloadHistory = () => {
    const element = document.getElementById('pdf-history-content');
    if (!element) return;
    
    const opt = {
      margin:       15,
      filename:     `lich-su-hoc-tap-${Date.now()}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      pagebreak:    { mode: 'avoid-all' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 space-y-4">
        <Activity className="w-12 h-12 opacity-20" />
        <p>{t('noData')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('analytics')}</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={downloadHistory}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-lg transition-colors border border-indigo-100 dark:border-indigo-500/20"
          >
            <Download className="w-4 h-4" />
            <span>{t('downloadHistory')}</span>
          </button>
          <span className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full font-medium text-sm border border-slate-200 dark:border-slate-700">
            {t('totalQuestions')}: {stats.total}
          </span>
        </div>
      </div>

      <div style={{ overflow: 'hidden', height: 0 }}>
        <div id="pdf-history-content" className="p-8 bg-white text-black w-[800px] font-sans">
          <h1 className="text-2xl font-bold mb-6 text-center">Lịch sử làm bài</h1>
          <div className="flex gap-4 mb-8 justify-center text-sm font-medium text-slate-600">
            <span>Độ chính xác: {stats.accuracy}%</span>
            <span>Tốc độ TB: {stats.avgTime}s/câu</span>
            <span>Nguy cơ: {stats.riskLevel}</span>
          </div>
          {history.map((h, i) => (
            <div key={i} className="mb-8 break-inside-avoid">
              <div className="font-bold mb-2 flex gap-2">
                <span className="whitespace-nowrap">Câu {i + 1}:</span>
                <div>
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {h.question.content}
                  </ReactMarkdown>
                </div>
              </div>
              <div className="ml-4 space-y-2 mb-4">
                {h.question.options.map((opt, idx) => {
                  const isCorrect = idx === h.question.correctAnswerIndex;
                  const isSelected = idx === h.selectedAnswerIndex;
                  let colorClass = "text-slate-700";
                  if (isCorrect) colorClass = "text-emerald-600 font-bold";
                  else if (isSelected) colorClass = "text-rose-600 font-bold line-through";
                  
                  return (
                    <div key={idx} className={`flex gap-2 ${colorClass}`}>
                      <span>{String.fromCharCode(65 + idx)}.</span>
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={{p: React.Fragment}}>
                        {opt}
                      </ReactMarkdown>
                      {isCorrect && " (Đáp án đúng)"}
                      {isSelected && !isCorrect && " (Bạn chọn)"}
                    </div>
                  );
                })}
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="font-medium mb-1">Giải thích:</div>
                <div className="text-slate-700">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {h.question.explanation}
                  </ReactMarkdown>
                </div>
                <div className="mt-2 text-sm text-slate-500 italic">
                  Độ khó: {h.question.difficulty} | Loại: {h.question.type} | Thời gian: {Math.round(h.timeTakenMs / 1000)}s
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start gap-4 transition-colors">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t('accuracy')}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.accuracy}%</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start gap-4 transition-colors">
          <div className="p-3 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t('avgSpeed')}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.avgTime}s <span className="text-base font-normal text-slate-500 dark:text-slate-400">/ {t('question').toLowerCase()}</span></p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start gap-4 transition-colors">
          <div className={`p-3 rounded-xl ${
            stats.riskLevel === 'Cao' ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400' :
            stats.riskLevel === 'Trung bình' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400' :
            'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
          }`}>
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t('risk')}</p>
            <p className={`text-2xl font-bold ${
              stats.riskLevel === 'Cao' ? 'text-rose-600 dark:text-rose-400' :
              stats.riskLevel === 'Trung bình' ? 'text-amber-600 dark:text-amber-400' :
              'text-emerald-600 dark:text-emerald-400'
            }`}>{stats.riskLevel === 'Cao' ? t('high') : stats.riskLevel === 'Trung bình' ? t('medium') : t('low')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6 transition-colors">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 pb-4">
            <Activity className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{t('progress')}</h3>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} ticks={[1, 2, 3]} tickFormatter={(val) => val === 1 ? t('easy') : val === 2 ? t('medium') : t('hard')} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number, name: string) => {
                    if (name === 'Độ khó') return value === 1 ? t('easy') : value === 2 ? t('medium') : t('hard');
                    if (name === 'Thời gian (s)') return `${value}s`;
                    return value;
                  }}
                />
                <Line type="monotone" dataKey="difficulty" name="Độ khó" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="time" name="Thời gian (s)" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
