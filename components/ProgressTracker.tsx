
import React from 'react';
import { ProgressData, Language, View } from '../types';
import { translations } from '../lib/translations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowLeftIcon, ClockIcon, CheckCircleIcon, TrophyIcon, TriangleAlertIcon } from './icons';

interface ProgressTrackerProps {
  progressData: ProgressData;
  usageData: Record<string, number>;
  language: Language;
  onNavigate: (view: View) => void;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ progressData, usageData, language, onNavigate }) => {
  const T = translations[language];

  // 1. Calculate Stats for Charts & Cards
  const chartData = Object.entries(progressData).map(([topic, rawData]) => {
    const data = rawData as { correct: number; total: number };
    return {
      name: topic,
      [T.progressTracker.chartKey]: data.total > 0 ? (data.correct / data.total) * 100 : 0,
      'Answered': data.total,
    };
  });

  const progressValues = Object.values(progressData) as { correct: number; total: number }[];
  const totalQuestions = progressValues.reduce((acc, curr) => acc + curr.total, 0);
  const totalCorrect = progressValues.reduce((acc, curr) => acc + curr.correct, 0);
  const averageAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

  const usageValues = Object.values(usageData) as number[];
  const totalTimeSeconds = usageValues.reduce((acc, curr) => acc + curr, 0);
  
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  // 2. Identify Weak Areas (Accuracy < 60% and at least 1 question answered)
  const weakAreas = Object.entries(progressData)
    .map(([topic, rawData]) => {
        const data = rawData as { correct: number; total: number };
        return {
            topic,
            accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0,
            total: data.total
        };
    })
    .filter(item => item.total >= 1 && item.accuracy < 60)
    .sort((a, b) => a.accuracy - b.accuracy);

  // 3. Prepare Pie Chart Data for Time Spent
  const pieData = Object.entries(usageData)
    .filter(([key]) => ['question_bank', 'flashcards', 'tutor', 'patient_sim'].includes(key))
    .map(([key, value]) => {
        let name = key;
        if (key === 'question_bank') name = T.sidebar.questionBank;
        if (key === 'flashcards') name = T.sidebar.flashcards;
        if (key === 'tutor') name = T.sidebar.aiTutor;
        if (key === 'patient_sim') name = T.sidebar.patientSimulator;
        return { name, value };
    });

  const PIE_COLORS = ['#FF9500', '#AF52DE', '#007AFF', '#34C759'];

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-12">
      <div className="flex items-center gap-4 mb-6">
            <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-1 text-[#007AFF] hover:opacity-80 font-medium transition-opacity">
                <ArrowLeftIcon className="w-5 h-5" />
                {T.common.backButton}
            </button>
        </div>
      <h1 className="text-3xl font-bold text-[#1C1C1E] tracking-tight">{T.progressTracker.title}</h1>
      <p className="mt-1 text-[#8E8E93]">{T.progressTracker.subtitle}</p>

      {/* Summary Widgets */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-[#E5E5EA] shadow-sm flex flex-col items-center justify-center text-center h-48">
            <div className="w-12 h-12 bg-[#007AFF]/10 rounded-full flex items-center justify-center text-[#007AFF] mb-4">
                <ClockIcon className="w-6 h-6" />
            </div>
            <p className="text-3xl font-bold text-[#1C1C1E] tracking-tight">{formatTime(totalTimeSeconds)}</p>
            <p className="text-sm text-[#8E8E93] font-medium mt-1">{T.progressTracker.totalTime}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-[#E5E5EA] shadow-sm flex flex-col items-center justify-center text-center h-48">
            <div className="w-12 h-12 bg-[#34C759]/10 rounded-full flex items-center justify-center text-[#34C759] mb-4">
                <CheckCircleIcon className="w-6 h-6" />
            </div>
            <p className="text-3xl font-bold text-[#1C1C1E] tracking-tight">{totalQuestions}</p>
            <p className="text-sm text-[#8E8E93] font-medium mt-1">{T.progressTracker.totalQuestions}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-[#E5E5EA] shadow-sm flex flex-col items-center justify-center text-center h-48">
            <div className="w-12 h-12 bg-[#FF9500]/10 rounded-full flex items-center justify-center text-[#FF9500] mb-4">
                <TrophyIcon className="w-6 h-6" />
            </div>
            <p className="text-3xl font-bold text-[#1C1C1E] tracking-tight">{averageAccuracy.toFixed(1)}%</p>
            <p className="text-sm text-[#8E8E93] font-medium mt-1">{T.progressTracker.averageAccuracy}</p>
        </div>
      </div>

      {/* Weak Areas Alert */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-[#1C1C1E] mb-4 px-1">{T.progressTracker.focusAreas}</h2>
        {weakAreas.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {weakAreas.map((area) => (
                    <div key={area.topic} className="bg-[#FFF1F0] border border-[#FFCCC7] rounded-2xl p-4 flex items-start gap-3">
                        <div className="bg-[#FF4D4F] rounded-full p-1 mt-1">
                             <TriangleAlertIcon className="w-3 h-3 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#A8071A]">{area.topic}</h3>
                            <p className="text-sm text-[#CF1322] mt-1">
                                {T.progressTracker.needsReview} • {area.accuracy.toFixed(0)}% {T.progressTracker.chartKey}
                            </p>
                        </div>
                    </div>
                ))}
             </div>
        ) : totalQuestions > 0 ? (
            <div className="bg-[#F6FFED] border border-[#B7EB8F] rounded-2xl p-6 flex items-center gap-4">
                <CheckCircleIcon className="w-8 h-8 text-[#52C41A]" />
                <div>
                    <h3 className="font-bold text-[#237804] text-lg">{T.progressTracker.noWeakAreas}</h3>
                    <p className="text-[#389E0D]">{T.progressTracker.strongPerformance}</p>
                </div>
            </div>
        ) : (
            <div className="p-6 bg-white rounded-2xl border border-dashed border-[#C7C7CC] text-[#8E8E93] text-center italic">
                {T.progressTracker.noData}
            </div>
        )}
      </div>

      {/* Charts Grid */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Bar Chart */}
          <div className="bg-white p-8 rounded-3xl border border-[#E5E5EA] shadow-sm h-[450px] flex flex-col">
                <h3 className="text-lg font-bold text-[#1C1C1E] mb-6">{T.progressTracker.topicPerformance}</h3>
                <div className="flex-1 min-h-0">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E5EA" />
                            <XAxis type="number" unit="%" domain={[0, 100]} hide />
                            <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 12, fill: '#8E8E93'}} axisLine={false} tickLine={false} />
                            <Tooltip 
                                formatter={(value: number) => `${value.toFixed(1)}%`} 
                                cursor={{fill: '#F2F2F7'}}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey={T.progressTracker.chartKey} fill="#007AFF" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-[#C7C7CC] italic">{T.progressTracker.noData}</div>
                )}
                </div>
          </div>

          {/* Right: Pie Chart */}
          <div className="bg-white p-8 rounded-3xl border border-[#E5E5EA] shadow-sm h-[450px] flex flex-col">
                <h3 className="text-lg font-bold text-[#1C1C1E] mb-6">{T.progressTracker.timeSpent}</h3>
                <div className="flex-1 min-h-0">
                {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={120}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatTime(value)} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            <Legend iconType="circle" layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '20px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                     <div className="h-full flex items-center justify-center text-[#C7C7CC] italic">{T.progressTracker.noData}</div>
                )}
                </div>
          </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
