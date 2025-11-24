
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, Flashcard, Language, View, StudyMaterial } from '../types';
import { generateFlashcards } from '../services/geminiService';
import { translations } from '../lib/translations';
import { Loader2, ArrowLeftIcon, MicrophoneIcon, Volume2Icon, PaperclipIcon, UploadCloudIcon, TrashIcon, FileTextIcon, ImageIcon } from './icons';
import { useSpeech } from '../hooks/useSpeech';

interface FlashcardGeneratorProps {
  user: User;
  language: Language;
  onNavigate: (view: View) => void;
  materials: StudyMaterial[];
  setMaterials: React.Dispatch<React.SetStateAction<StudyMaterial[]>>;
}

const FlashcardGenerator: React.FC<FlashcardGeneratorProps> = ({ user, language, onNavigate, materials, setMaterials }) => {
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (transcript) {
        setTopic(transcript);
    }
  }, [transcript]);

  const processFile = (file: File) => {
    // Validate file type
    if (!['image/png', 'image/jpeg', 'application/pdf'].includes(file.type)) {
        alert("Only PNG, JPEG, and PDF files are supported.");
        return;
    }
    
    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const result = e.target?.result as string;
        // Strip the data:image/png;base64, part
        const base64Data = result.split(',')[1];
        
        const newMaterial: StudyMaterial = {
            id: Math.random().toString(36).substring(7),
            name: file.name,
            type: file.type,
            data: base64Data
        };
        setMaterials(prev => [...prev, newMaterial]);
        setUseMaterials(true); // Automatically switch to using materials
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        Array.from(e.target.files).forEach(processFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
        Array.from(e.dataTransfer.files).forEach(processFile);
    }
  };

  const handleDeleteMaterial = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setMaterials(prev => prev.filter(m => m.id !== id));
  };

  const handleGenerate = async () => {
    if (!topic && !useMaterials) {
      setError(T.flashcardGenerator.errorTopic);
      return;
    }
    if (useMaterials && materials.length === 0) {
        setError(T.flashcardGenerator.uploadFiles);
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

            <div className="bg-white p-2 rounded-3xl shadow-sm border border-[#E5E5EA] flex flex-col items-stretch gap-2">
                {!useMaterials ? (
                    <div className="relative flex-grow">
                        <textarea
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder={T.flashcardGenerator.placeholder}
                            className="w-full p-4 pr-12 bg-transparent border-none resize-none focus:ring-0 text-[#1C1C1E] placeholder-[#AEAEB2] h-32"
                            disabled={isLoading}
                        />
                        <button onClick={isListening ? stopListening : startListening} className="absolute right-2 top-2 p-2 rounded-full hover:bg-[#F2F2F7] transition-colors">
                            <MicrophoneIcon className={`w-5 h-5 ${isListening ? 'text-[#FF3B30] animate-pulse' : 'text-[#8E8E93]'}`} />
                        </button>
                    </div>
                ) : (
                    <div className="flex-grow p-4 bg-[#F9F9F9] rounded-2xl min-h-[8rem] flex flex-col">
                        {materials.length === 0 ? (
                            <div 
                                className="flex-grow flex flex-col items-center justify-center border-2 border-dashed border-[#C7C7CC] rounded-xl cursor-pointer hover:bg-[#E5E5EA] transition-colors p-4"
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                            >
                                <input 
                                    type="file" 
                                    multiple 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept=".pdf, .png, .jpg, .jpeg, image/png, image/jpeg, application/pdf"
                                    onChange={handleFileChange}
                                />
                                <UploadCloudIcon className="w-8 h-8 text-[#8E8E93] mb-2" />
                                <p className="text-sm font-medium text-[#1C1C1E]">{T.flashcardGenerator.uploadFiles}</p>
                                <p className="text-xs text-[#8E8E93] mt-1">{T.flashcardGenerator.dropFiles}</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-semibold text-[#8E8E93] uppercase">{materials.length} {T.flashcardGenerator.filesSelected}</span>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                        className="text-[#007AFF] text-xs font-bold hover:underline"
                                    >
                                        + Add More
                                    </button>
                                     <input 
                                        type="file" 
                                        multiple 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept=".pdf, .png, .jpg, .jpeg, image/png, image/jpeg, application/pdf"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1">
                                    {materials.map(m => (
                                        <div key={m.id} className="bg-white border border-[#E5E5EA] rounded-xl p-2 flex items-center justify-between">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <div className="w-8 h-8 bg-[#F2F2F7] rounded-lg flex items-center justify-center text-[#8E8E93] flex-shrink-0">
                                                    {m.type === 'application/pdf' ? <FileTextIcon className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                                                </div>
                                                <span className="text-sm text-[#1C1C1E] truncate">{m.name}</span>
                                            </div>
                                            <button 
                                                onClick={(e) => handleDeleteMaterial(m.id, e)}
                                                className="p-1.5 text-[#FF3B30] hover:bg-[#FF3B30]/10 rounded-full transition-colors"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full py-3.5 bg-[#007AFF] text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-[#0062cc] disabled:bg-[#C7C7CC] disabled:shadow-none disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center"
            >
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                {isLoading ? T.flashcardGenerator.generatingButton : T.flashcardGenerator.generateButton}
            </button>
        </div>

        {error && <div className="p-4 bg-[#FF3B30]/10 text-[#FF3B30] rounded-2xl font-medium text-center mb-8">{error}</div>}

        {/* Results Section */}
        {flashcards.length > 0 && !isLoading && (
            <div className="animate-fade-in-up">
                 {/* Progress Bar */}
                <div className="flex items-center gap-4 mb-6 px-4">
                     <span className="text-sm font-medium text-[#8E8E93] w-12 text-right">{(currentIndex + 1).toString().padStart(2, '0')}</span>
                     <div className="flex-1 h-2 bg-[#E5E5EA] rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-[#007AFF] transition-all duration-300 ease-out"
                            style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
                        ></div>
                     </div>
                     <span className="text-sm font-medium text-[#8E8E93] w-12">{flashcards.length.toString().padStart(2, '0')}</span>
                </div>

                <div className="relative h-80 md:h-96 w-full perspective-1000 group">
                    <div 
                        className={`relative w-full h-full transition-all duration-500 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
                        onClick={handleFlip}
                    >
                        {/* Front */}
                        <div className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-[#E5E5EA] flex flex-col items-center justify-center p-8 md:p-12 text-center">
                            <span className="text-xs font-bold tracking-widest text-[#8E8E93] uppercase mb-6">Question</span>
                            <p className="text-xl md:text-2xl font-medium text-[#1C1C1E] leading-relaxed select-none">{flashcards[currentIndex].question}</p>
                             <p className="mt-8 text-sm text-[#007AFF] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Tap to Flip</p>
                        </div>

                        {/* Back */}
                        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-[#007AFF] to-[#0055D4] rounded-3xl shadow-xl shadow-blue-500/20 text-white flex flex-col items-center justify-center p-8 md:p-12 text-center">
                            <span className="text-xs font-bold tracking-widest text-white/60 uppercase mb-6">Answer</span>
                            <p className="text-xl md:text-2xl font-medium leading-relaxed select-none">{flashcards[currentIndex].answer}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center justify-center gap-6 mt-10">
                    <button 
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="p-4 rounded-full bg-white border border-[#E5E5EA] shadow-sm text-[#1C1C1E] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F2F2F7] transition-all active:scale-90"
                    >
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>

                     <button 
                        onClick={(e) => handleSpeak(e)}
                        className={`p-4 rounded-full border shadow-sm transition-all active:scale-90 ${isSpeaking ? 'bg-[#007AFF] border-[#007AFF] text-white' : 'bg-white border-[#E5E5EA] text-[#1C1C1E] hover:bg-[#F2F2F7]'}`}
                    >
                        <Volume2Icon className="w-6 h-6" />
                    </button>

                    <button 
                        onClick={handleNext}
                        disabled={currentIndex === flashcards.length - 1}
                        className="p-4 rounded-full bg-white border border-[#E5E5EA] shadow-sm text-[#1C1C1E] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F2F2F7] transition-all active:scale-90"
                    >
                         <ArrowLeftIcon className="w-6 h-6 rotate-180" />
                    </button>
                </div>
                 <p className="text-center text-xs text-[#8E8E93] mt-6">
                    Use <span className="font-mono bg-[#E5E5EA] px-1 rounded">←</span> <span className="font-mono bg-[#E5E5EA] px-1 rounded">→</span> to navigate, <span className="font-mono bg-[#E5E5EA] px-1 rounded">Space</span> to flip
                </p>
            </div>
        )}
    </div>
  );
};

export default FlashcardGenerator;
