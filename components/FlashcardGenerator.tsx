
import React, { useState, useEffect, useCallback } from 'react';
import { User, Flashcard, Language, View, StudyMaterial } from '../types';
import { generateFlashcards } from '../services/geminiService';
import { translations } from '../lib/translations';
import { Loader2, RefreshCwIcon, ArrowLeftIcon, ArrowRightIcon, MicrophoneIcon, Volume2Icon, LayersIcon, PaperclipIcon } from './icons';
import { useSpeech } from '../hooks/useSpeech';

interface FlashcardGeneratorProps {
  user: User;
  language: Language;
  onNavigate: (view: View) => void;
  materials: StudyMaterial[];
}

const FlashcardGenerator: React.FC<FlashcardGeneratorProps> = ({ user, language, onNavigate, materials }) => {
  const T = translations[language];

  const [topic, setTopic] = useState<string>('');
  const [count, setCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [useMaterials, setUseMaterials] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { transcript, isListening, startListening, stopListening, speak, isSpeaking, cancelSpeaking } = useSpeech({ language });
  
  useEffect(() => {
    if (transcript) {
        setTopic(transcript);
    }
  }, [transcript]);

  const handleGenerate = async () => {
    if (!topic && !useMaterials) {
      setError(T.flashcardGenerator.errorTopic);
      return;
    }
    cancelSpeaking();
    setIsLoading(true);
    setError(null);
    setFlashcards([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    try {
      const materialsToUse = useMaterials ? materials : undefined;
      const cards = await generateFlashcards(topic, user.learningStyle, user.period, language, count, difficulty, materialsToUse);
      setFlashcards(cards);
    } catch (err) {
      setError(T.flashcardGenerator.errorGenerate);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = useCallback(() => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
      cancelSpeaking();
    }
  }, [currentIndex, flashcards.length, cancelSpeaking]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
      cancelSpeaking();
    }
  }, [currentIndex, cancelSpeaking]);

  const handleFlip = useCallback(() => {
      setIsFlipped(prev => !prev);
      cancelSpeaking();
  }, [cancelSpeaking]);

  const handleSpeak = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (flashcards.length === 0) return;
    const textToSpeak = isFlipped ? flashcards[currentIndex].answer : flashcards[currentIndex].question;
    if (isSpeaking) {
        cancelSpeaking();
    } else {
        speak(textToSpeak);
    }
  }, [flashcards, currentIndex, isFlipped, isSpeaking, speak, cancelSpeaking]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (flashcards.length === 0) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                handlePrev();
                break;
            case 'ArrowRight':
                handleNext();
                break;
            case ' ':
            case 'Enter':
                e.preventDefault();
                handleFlip();
                break;
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flashcards.length, handlePrev, handleNext, handleFlip]);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-20">
         <div className="flex items-center gap-4 mb-6">
            <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-1 text-[#007AFF] hover:opacity-80 font-medium transition-opacity">
                <ArrowLeftIcon className="w-5 h-5" />
                {T.common.backButton}
            </button>
        </div>
        <div className="text-center mb-8">
             <h1 className="text-3xl font-bold text-[#1C1C1E] tracking-tight">{T.flashcardGenerator.title}</h1>
             <p className="text-[#8E8E93] mt-2">{T.flashcardGenerator.subtitle}</p>
        </div>

        {/* Configuration Section */}
        <div className="bg-[#F2F2F7] p-4 rounded-3xl border border-[#E5E5EA] mb-10 space-y-4 shadow-sm">
             {materials.length > 0 && (
                <div className="flex items-center justify-center gap-4 bg-white p-2 rounded-xl">
                    <button 
                        onClick={() => setUseMaterials(false)}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${!useMaterials ? 'bg-[#007AFF] text-white shadow-sm' : 'text-[#8E8E93] hover:bg-[#F2F2F7]'}`}
                    >
                        {T.flashcardGenerator.useText}
                    </button>
                    <button 
                        onClick={() => setUseMaterials(true)}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${useMaterials ? 'bg-[#007AFF] text-white shadow-sm' : 'text-[#8E8E93] hover:bg-[#F2F2F7]'}`}
                    >
                         <PaperclipIcon className="w-4 h-4" />
                        {T.flashcardGenerator.useMaterials}
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-2xl border border-[#E5E5EA] flex items-center justify-between px-4">
                    <span className="text-sm font-medium text-[#8E8E93]">{T.flashcardGenerator.flashcardCount}</span>
                    <select 
                        value={count} 
                        onChange={(e) => setCount(Number(e.target.value))}
                        className="bg-transparent font-bold text-[#007AFF] outline-none cursor-pointer text-right"
                        disabled={isLoading}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                    </select>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-[#E5E5EA] flex items-center justify-between px-4">
                    <span className="text-sm font-medium text-[#8E8E93]">{T.flashcardGenerator.difficultyLevel}</span>
                    <select 
                        value={difficulty} 
                        onChange={(e) => setDifficulty(e.target.value as any)}
                        className="bg-transparent font-bold text-[#007AFF] outline-none cursor-pointer text-right"
                        disabled={isLoading}
                    >
                        <option value="easy">{T.flashcardGenerator.difficultyEasy}</option>
                        <option value="medium">{T.flashcardGenerator.difficultyMedium}</option>
                        <option value="hard">{T.flashcardGenerator.difficultyHard}</option>
                    </select>
                </div>
            </div>

            <div className="bg-white p-2 rounded-3xl shadow-sm border border-[#E5E5EA] flex flex-col md:flex-row items-stretch gap-2">
                {!useMaterials ? (
                    <div className="relative flex-grow">
                        <textarea
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder={T.flashcardGenerator.placeholder}
                            className="w-full p-4 pr-12 bg-transparent border-none resize-none focus:ring-0 text-[#1C1C1E] placeholder-[#AEAEB2] h-20 md:h-auto"
                            disabled={isLoading}
                        />
                        <button onClick={isListening ? stopListening : startListening} className="absolute right-2 top-2 p-2 rounded-full hover:bg-[#F2F2F7] transition-colors">
                            <MicrophoneIcon className={`w-5 h-5 ${isListening ? 'text-[#FF3B30] animate-pulse' : 'text-[#8E8E93]'}`} />
                        </button>
                    </div>
                ) : (
                    <div className="flex-grow flex items-center justify-center text-[#8E8E93] italic p-4 bg-[#F9F9F9] rounded-2xl">
                         <PaperclipIcon className="w-5 h-5 mr-2" />
                         {materials.length} file(s) selected as context
                    </div>
                )}
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="md:w-48 bg-[#007AFF] text-white font-bold rounded-2xl hover:bg-[#0062cc] disabled:bg-[#C7C7CC] disabled:cursor-not-allowed transition-all flex flex-col items-center justify-center p-4 active:scale-95"
                >
                    {isLoading ? <Loader2 className="animate-spin w-6 h-6 mb-1" /> : <RefreshCwIcon className="w-6 h-6 mb-1" />}
                    <span className="text-sm">{isLoading ? T.flashcardGenerator.generatingButton : T.flashcardGenerator.generateButton}</span>
                </button>
            </div>
        </div>
        
        {error && <div className="mb-6 p-4 bg-[#FF3B30]/10 text-[#FF3B30] rounded-2xl font-medium text-center">{error}</div>}

        <div className="min-h-[400px]">
            {isLoading ? (
                <div className="h-[400px] flex flex-col items-center justify-center bg-white rounded-[2rem] border border-[#E5E5EA] shadow-sm">
                    <Loader2 className="w-12 h-12 text-[#007AFF] animate-spin mb-4" />
                    <p className="text-[#8E8E93] font-medium animate-pulse">{T.flashcardGenerator.generatingButton}</p>
                </div>
            ) : flashcards.length > 0 ? (
                <div className="flex flex-col items-center max-w-2xl mx-auto">
                    {/* Progress Bar */}
                    <div className="w-full flex items-center gap-3 mb-6 px-2">
                        <span className="text-xs font-semibold text-[#8E8E93] font-mono min-w-[3rem] text-right">
                            {currentIndex + 1} / {flashcards.length}
                        </span>
                        <div className="flex-grow h-2 bg-[#E5E5EA] rounded-full overflow-hidden">
                             <div 
                                className="h-full bg-[#007AFF] transition-all duration-500 ease-out rounded-full"
                                style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Card */}
                    <div className="w-full aspect-[3/2] perspective-[1200px] group">
                        <div 
                            className={`relative w-full h-full cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] [transform-style:preserve-3d] shadow-xl hover:shadow-2xl rounded-[2rem] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
                            onClick={handleFlip}
                        >
                            {/* Front */}
                            <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-gradient-to-br from-[#007AFF] to-[#0055B3] text-white rounded-[2rem] flex flex-col items-center justify-center p-8 md:p-12 text-center border border-white/10">
                                <span className="absolute top-8 left-8 text-xs font-bold uppercase tracking-widest opacity-60 bg-black/20 px-3 py-1 rounded-full">Question</span>
                                <p className="text-2xl md:text-3xl font-bold leading-snug drop-shadow-sm overflow-y-auto max-h-full no-scrollbar">
                                    {flashcards[currentIndex].question}
                                </p>
                                <span className="absolute bottom-6 text-xs font-medium opacity-60 animate-pulse">Tap to flip or press Space</span>
                                
                                <button 
                                    onClick={handleSpeak} 
                                    className="absolute top-6 right-6 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm"
                                >
                                    <Volume2Icon className="w-5 h-5 text-white" />
                                </button>
                            </div>
                            
                            {/* Back */}
                            <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white text-[#1C1C1E] rounded-[2rem] flex flex-col items-center justify-center p-8 md:p-12 text-center border border-[#E5E5EA]">
                                <span className="absolute top-8 left-8 text-xs font-bold text-[#8E8E93] uppercase tracking-widest bg-[#F2F2F7] px-3 py-1 rounded-full">Answer</span>
                                <p className="text-xl md:text-2xl font-medium leading-relaxed overflow-y-auto max-h-full no-scrollbar">
                                    {flashcards[currentIndex].answer}
                                </p>
                                
                                <button 
                                    onClick={handleSpeak} 
                                    className="absolute top-6 right-6 p-2 rounded-full bg-[#F2F2F7] hover:bg-[#E5E5EA] transition-colors"
                                >
                                    <Volume2Icon className={`w-5 h-5 ${isSpeaking ? 'text-[#007AFF]' : 'text-[#8E8E93]'}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Controls */}
                    <div className="mt-8 flex items-center justify-between w-full px-4 md:px-12">
                         <button 
                            onClick={handlePrev} 
                            disabled={currentIndex === 0} 
                            className="flex flex-col items-center gap-2 group disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                         >
                            <div className="w-14 h-14 rounded-full bg-white border border-[#E5E5EA] shadow-sm flex items-center justify-center group-hover:bg-[#F2F2F7] group-active:scale-95 transition-all">
                                <ArrowLeftIcon className="w-6 h-6 text-[#1C1C1E]" />
                            </div>
                            <span className="text-xs font-medium text-[#8E8E93]">Prev</span>
                         </button>

                         <button 
                            onClick={handleFlip} 
                            className="px-8 py-3 bg-[#1C1C1E] text-white rounded-full font-bold shadow-lg hover:bg-black transition-transform active:scale-95 hidden md:block"
                         >
                             {isFlipped ? "Show Question" : "Reveal Answer"}
                         </button>

                         <button 
                            onClick={handleNext} 
                            disabled={currentIndex === flashcards.length - 1} 
                            className="flex flex-col items-center gap-2 group disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                         >
                            <div className="w-14 h-14 rounded-full bg-white border border-[#E5E5EA] shadow-sm flex items-center justify-center group-hover:bg-[#F2F2F7] group-active:scale-95 transition-all">
                                <ArrowRightIcon className="w-6 h-6 text-[#1C1C1E]" />
                            </div>
                            <span className="text-xs font-medium text-[#8E8E93]">Next</span>
                         </button>
                    </div>
                    <p className="mt-6 text-xs text-[#AEAEB2] text-center hidden md:block">
                        Use <kbd className="font-sans px-1 py-0.5 bg-[#E5E5EA] rounded text-[#1C1C1E]">←</kbd> <kbd className="font-sans px-1 py-0.5 bg-[#E5E5EA] rounded text-[#1C1C1E]">→</kbd> to navigate, <kbd className="font-sans px-1 py-0.5 bg-[#E5E5EA] rounded text-[#1C1C1E]">Space</kbd> to flip
                    </p>
                </div>
            ) : (
                 <div className="h-[400px] flex flex-col items-center justify-center bg-[#F2F2F7] rounded-[2rem] border border-dashed border-[#C7C7CC] group hover:border-[#8E8E93] transition-colors">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                        <LayersIcon className="w-10 h-10 text-[#C7C7CC] group-hover:text-[#8E8E93] transition-colors" />
                    </div>
                    <p className="text-[#8E8E93] font-medium text-lg">{T.flashcardGenerator.placeholderCard}</p>
                    <p className="text-sm text-[#AEAEB2] mt-2">Enter a topic above to begin</p>
                </div>
            )}
        </div>
    </div>
  );
};


export default FlashcardGenerator;
