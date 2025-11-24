
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, Question, Language, View, StudyMaterial } from '../types';
import { generateQuestion } from '../services/geminiService';
import { translations } from '../lib/translations';
import { Loader2, ArrowLeftIcon, Volume2Icon, CheckCircleIcon, PaperclipIcon } from './icons';
import { useSpeech } from '../hooks/useSpeech';

interface QuestionBankProps {
  user: User;
  updateProgress: (topic: string, isCorrect: boolean) => void;
  language: Language;
  onNavigate: (view: View) => void;
  materials: StudyMaterial[];
}

type QuestionMode = 'review' | 'timed';

const QuestionBank: React.FC<QuestionBankProps> = ({ user, updateProgress, language, onNavigate, materials }) => {
  const T = translations[language];
  const medicalTopics = T.medicalTopics;
  
  const [topic, setTopic] = useState<string>(medicalTopics[0]);
  const [useContext, setUseContext] = useState(false);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<QuestionMode>('review');
  const [timer, setTimer] = useState(90);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { speak, isSpeaking, cancelSpeaking } = useSpeech({ language });

  const handleAnswer = useCallback((optionKey: string) => {
    if (isAnswered) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedAnswer(optionKey);
    setIsAnswered(true);
    if (question) {
        updateProgress(useContext ? 'Context' : topic, optionKey === question.correctAnswer);
    }
  }, [isAnswered, question, topic, updateProgress, useContext]);
  
  const fetchQuestion = useCallback(async () => {
    cancelSpeaking();
    if (timerRef.current) clearInterval(timerRef.current);
    setIsLoading(true);
    setError(null);
    setQuestion(null);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setTimer(90);
    try {
      const materialsToUse = useContext ? materials : undefined;
      const q = await generateQuestion(topic, user.learningStyle, user.period, language, materialsToUse);
      setQuestion(q);
    } catch (err) {
      setError(T.questionBank.error);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [cancelSpeaking, topic, user.learningStyle, user.period, language, T.questionBank.error, useContext, materials]);

  useEffect(() => {
    if (mode === 'timed' && question && !isAnswered && !isLoading) {
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setSelectedAnswer(null);
            setIsAnswered(true);
            if (question) updateProgress(topic, false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, question, isAnswered, isLoading, updateProgress, topic]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isLoading || !question) return;
      const key = event.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key) && !isAnswered) {
        handleAnswer(key);
      }
      if (key === 'N' && isAnswered) {
        fetchQuestion();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoading, question, isAnswered, handleAnswer, fetchQuestion]);
  
  const getOptionClasses = (optionKey: string) => {
    const baseClasses = "w-full text-left p-5 flex items-center justify-between transition-all duration-200 border-b border-[#E5E5EA] last:border-0 group";
    if (!isAnswered) {
        return `${baseClasses} bg-white hover:bg-[#F2F2F7] active:bg-[#E5E5EA]`;
    }
    const isCorrect = optionKey === question?.correctAnswer;
    const isSelected = optionKey === selectedAnswer;

    if (isCorrect) return `${baseClasses} bg-[#E8F5E9]`;
    if (isSelected) return `${baseClasses} bg-[#FFEBEE]`;
    return `${baseClasses} bg-white opacity-50`;
  };
  
  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      cancelSpeaking();
    } else {
      speak(text);
    }
  }

  const renderTimer = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in pb-20">
        <div className="flex items-center gap-4 mb-6">
            <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-1 text-[#007AFF] hover:opacity-80 font-medium transition-opacity">
                <ArrowLeftIcon className="w-5 h-5" />
                {T.common.backButton}
            </button>
        </div>
        
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl font-bold text-[#1C1C1E] tracking-tight">{T.questionBank.title}</h1>
                <p className="text-[#8E8E93] mt-1">{T.questionBank.subtitle}</p>
            </div>
        </div>
        
        {/* Controls */}
        <div className="bg-[#F2F2F7] p-4 rounded-3xl mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-auto flex flex-col gap-2">
                {materials.length > 0 && (
                     <div className="flex items-center gap-2 mb-2 bg-white p-2 rounded-xl shadow-sm">
                        <PaperclipIcon className="w-4 h-4 text-[#8E8E93]" />
                        <span className="text-xs font-medium text-[#8E8E93] mr-2">{T.questionBank.sourceGeneral}</span>
                         <label htmlFor="context-toggle" className="flex items-center cursor-pointer">
                            <div className="relative">
                                <input type="checkbox" id="context-toggle" className="sr-only" checked={useContext} onChange={() => setUseContext(!useContext)} />
                                <div className={`block w-10 h-6 rounded-full transition-colors ${useContext ? 'bg-[#007AFF]' : 'bg-[#E5E5EA]'}`}></div>
                                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-300 ${useContext ? 'translate-x-4' : ''}`}></div>
                            </div>
                        </label>
                        <span className="text-xs font-medium text-[#007AFF] ml-2">{T.questionBank.sourceContext}</span>
                     </div>
                )}
                
                <div className="relative w-full">
                    <select
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className={`appearance-none w-full md:w-64 p-3 pl-4 pr-10 bg-white border-none rounded-xl shadow-sm text-[#1C1C1E] font-medium focus:ring-2 focus:ring-[#007AFF] outline-none ${useContext ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isLoading || useContext}
                    >
                        {medicalTopics.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {!useContext && (
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#8E8E93]">
                            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm w-full md:w-auto justify-between">
                <span className={`text-sm font-medium ${mode === 'review' ? 'text-[#007AFF]' : 'text-[#8E8E93]'}`}>{T.questionBank.reviewMode}</span>
                <label htmlFor="mode-toggle" className="flex items-center cursor-pointer">
                    <div className="relative">
                        <input type="checkbox" id="mode-toggle" className="sr-only" checked={mode === 'timed'} onChange={() => setMode(m => m === 'review' ? 'timed' : 'review')} />
                        <div className="block bg-[#E5E5EA] w-12 h-7 rounded-full transition-colors"></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full shadow-md transition-transform duration-300 ${mode === 'timed' ? 'translate-x-5' : ''}`}></div>
                    </div>
                </label>
                <span className={`text-sm font-medium ${mode === 'timed' ? 'text-[#007AFF]' : 'text-[#8E8E93]'}`}>{T.questionBank.timedMode}</span>
            </div>
            <style>{`#mode-toggle:checked ~ .block { background-color: #34C759; }`}</style>

            <button
                onClick={fetchQuestion}
                disabled={isLoading}
                className="w-full md:w-auto px-8 py-3 bg-[#007AFF] text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-[#0062cc] disabled:bg-[#C7C7CC] disabled:shadow-none disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center"
            >
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                {isLoading ? T.questionBank.generatingButton : T.questionBank.generateButton}
            </button>
        </div>

        {error && <div className="p-4 bg-[#FF3B30]/10 text-[#FF3B30] rounded-2xl font-medium text-center">{error}</div>}
        
        {isLoading && !error && (
            <div className="h-96 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 border-4 border-[#E5E5EA] border-t-[#007AFF] rounded-full animate-spin mb-6"></div>
                <p className="text-[#8E8E93] font-medium animate-pulse">{T.questionBank.loadingMessage}</p>
            </div>
        )}

        {question && !isLoading && (
            <div className="animate-fade-in-up">
                <div className="bg-white rounded-3xl shadow-sm border border-[#E5E5EA] overflow-hidden">
                    <div className="p-8 border-b border-[#E5E5EA]">
                        <div className="flex justify-between items-start gap-4">
                            <h2 className="text-xl md:text-2xl font-semibold text-[#1C1C1E] leading-relaxed">{question.question}</h2>
                            <button onClick={() => handleSpeak(question.question)} className="p-2 bg-[#F2F2F7] rounded-full hover:bg-[#E5E5EA] transition-colors flex-shrink-0">
                                <Volume2Icon className={`w-5 h-5 ${isSpeaking ? 'text-[#007AFF]' : 'text-[#8E8E93]'}`} />
                            </button>
                        </div>
                        {mode === 'timed' && (
                             <div className="mt-4 flex items-center gap-2">
                                <div className="w-full bg-[#E5E5EA] h-2 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-1000 ease-linear ${timer <= 10 ? 'bg-[#FF3B30]' : 'bg-[#007AFF]'}`} 
                                        style={{ width: `${(timer / 90) * 100}%` }}
                                    ></div>
                                </div>
                                <span className={`font-mono font-bold ${timer <= 10 ? 'text-[#FF3B30]' : 'text-[#8E8E93]'}`}>{renderTimer()}</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex flex-col">
                        {Object.entries(question.options).map(([key, value]) => {
                             const isCorrect = isAnswered && key === question.correctAnswer;
                             const isSelected = isAnswered && key === selectedAnswer;
                             
                             return (
                                <button
                                    key={key}
                                    onClick={() => handleAnswer(key)}
                                    disabled={isAnswered}
                                    className={getOptionClasses(key)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${
                                            isCorrect ? 'bg-[#34C759] border-[#34C759] text-white' : 
                                            isSelected ? 'bg-[#FF3B30] border-[#FF3B30] text-white' : 
                                            'bg-white border-[#C7C7CC] text-[#8E8E93] group-hover:border-[#8E8E93]'
                                        }`}>
                                            {key}
                                        </div>
                                        <span className={`text-lg ${isCorrect ? 'text-[#145222] font-semibold' : isSelected ? 'text-[#781813] font-semibold' : 'text-[#1C1C1E]'}`}>{value}</span>
                                    </div>
                                    {isCorrect && <CheckCircleIcon className="w-6 h-6 text-[#34C759]" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {isAnswered && (
                    <div className="mt-6 bg-[#F2F2F7] rounded-3xl p-6 border border-[#E5E5EA] animate-fade-in">
                         {timer === 0 && selectedAnswer === null && (
                          <p className="font-bold text-[#FF3B30] mb-4">{T.questionBank.timesUp}</p>
                        )}
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-bold text-[#1C1C1E]">{T.questionBank.explanation}</h3>
                             <button onClick={() => handleSpeak(question.explanation)} className="p-2 rounded-full hover:bg-[#E5E5EA] transition-colors">
                                <Volume2Icon className={`w-5 h-5 ${isSpeaking ? 'text-[#007AFF]' : 'text-[#8E8E93]'}`} />
                             </button>
                        </div>
                        <p className="text-[#3A3A3C] leading-relaxed text-lg">{question.explanation}</p>
                        <div className="mt-6 text-center">
                             <button onClick={fetchQuestion} className="text-[#007AFF] font-semibold hover:underline">Generate Next Question &rarr;</button>
                        </div>
                    </div>
                )}
                 <p className="text-xs text-[#AEAEB2] mt-8 text-center">{T.questionBank.keyboardShortcutHint}</p>
            </div>
        )}
    </div>
  );
};

export default QuestionBank;
