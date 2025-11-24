
import React, { useState, useRef, useEffect } from 'react';
import { User, ChatMessage, Language, View, StudyMaterial } from '../types';
import { createPatientChat, evaluateDiagnosis } from '../services/geminiService';
import { translations } from '../lib/translations';
import { Loader2, SendIcon, StethoscopeIcon, ArrowLeftIcon, MicrophoneIcon, PaperclipIcon } from './icons';
import { useSpeech } from '../hooks/useSpeech';

interface PatientSimulatorProps {
  user: User;
  language: Language;
  onNavigate: (view: View) => void;
  isVoiceOutputEnabled: boolean;
  materials: StudyMaterial[];
}

const PatientSimulator: React.FC<PatientSimulatorProps> = ({ user, language, onNavigate, isVoiceOutputEnabled, materials }) => {
  const T = translations[language];
  const [chat, setChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDiagnosisMode, setIsDiagnosisMode] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { transcript, isListening, startListening, stopListening, speak, cancelSpeaking } = useSpeech({ language });

  const startNewCase = () => {
    cancelSpeaking();
    const newChat = createPatientChat(user.period, language, materials);
    setChat(newChat);
    const initialMessage = T.patientSimulator.initialMessage;
    setMessages([{ role: 'model', content: initialMessage }]);
    setIsDiagnosisMode(false);
    if (isVoiceOutputEnabled) {
      speak(initialMessage);
    }
  };
  
  useEffect(() => {
    startNewCase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.period, language, materials]);
  
  useEffect(() => {
    if (transcript) {
        setInput(transcript);
    }
  }, [transcript]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chat || isLoading) return;

    cancelSpeaking();
    const userMessageContent = isDiagnosisMode ? `${T.patientSimulator.diagnosisPrefix}: ${input}` : input;
    const userMessage: ChatMessage = { role: 'user', content: userMessageContent };
    setMessages(prev => [...prev, userMessage]);
    
    setInput('');
    setIsLoading(true);

    try {
        let modelResponseContent: string;
        if (isDiagnosisMode) {
            const history = [...messages, userMessage];
            modelResponseContent = await evaluateDiagnosis(history, user.learningStyle, user.period, language);
        } else {
            const result = await chat.sendMessage(input);
            modelResponseContent = result.text;
        }
        
      const modelMessage: ChatMessage = { role: 'model', content: modelResponseContent };
      setMessages(prev => [...prev, modelMessage]);
      if (isVoiceOutputEnabled) {
        speak(modelResponseContent);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessageContent = T.patientSimulator.error;
      const errorMessage: ChatMessage = { role: 'model', content: errorMessageContent };
      setMessages(prev => [...prev, errorMessage]);
      if (isVoiceOutputEnabled) {
        speak(errorMessageContent);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-6rem)] max-w-4xl mx-auto animate-fade-in">
         <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#E5E5EA]">
             <div className="flex items-center gap-2">
                <button onClick={() => { cancelSpeaking(); onNavigate('dashboard'); }} className="p-2 -ml-2 hover:bg-[#F2F2F7] rounded-full transition-colors text-[#007AFF]">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                 <div>
                    <h1 className="text-xl font-bold text-[#1C1C1E]">{T.patientSimulator.title}</h1>
                    <p className="text-xs text-[#8E8E93]">{T.patientSimulator.subtitle}</p>
                 </div>
            </div>
             <button onClick={startNewCase} className="px-4 py-1.5 bg-[#F2F2F7] text-[#007AFF] font-semibold rounded-full hover:bg-[#E5E5EA] transition-colors text-sm">
                {T.patientSimulator.newCaseButton}
            </button>
        </div>
        
        {materials.length > 0 && (
            <div className="bg-[#E8F5E9] border border-[#C6F6D5] px-3 py-2 rounded-xl mb-4 flex items-center gap-2">
                <PaperclipIcon className="w-4 h-4 text-[#2F855A]" />
                <span className="text-xs font-semibold text-[#22543D]">{T.patientSimulator.usingContext}</span>
            </div>
        )}
        
        <div className="flex-1 overflow-y-auto px-2 space-y-6 mb-4">
            {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[80%] px-5 py-3 rounded-2xl shadow-sm text-base leading-relaxed ${
                        msg.role === 'user' 
                        ? 'bg-[#34C759] text-white rounded-br-sm' 
                        : 'bg-[#E9E9EB] text-black rounded-bl-sm'
                    }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                </div>
            ))}
            {isLoading && (
                 <div className="flex justify-start">
                    <div className="px-4 py-3 rounded-2xl bg-[#E9E9EB] rounded-bl-sm">
                       <Loader2 className="w-5 h-5 text-[#8E8E93] animate-spin" />
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        <div className="mb-2 px-4 py-2 bg-white rounded-2xl border border-[#E5E5EA] shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-[#E8F5E9] p-1.5 rounded-full">
                     <StethoscopeIcon className="w-5 h-5 text-[#34C759]" />
                </div>
                <span className="text-sm font-medium text-[#1C1C1E]">{T.patientSimulator.diagnosisPrompt}</span>
            </div>
            <label htmlFor="diagnosis-toggle" className="flex items-center cursor-pointer">
                <div className="relative">
                    <input type="checkbox" id="diagnosis-toggle" className="sr-only" checked={isDiagnosisMode} onChange={() => setIsDiagnosisMode(!isDiagnosisMode)} />
                    <div className="block bg-[#E5E5EA] w-12 h-7 rounded-full transition-colors"></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full shadow-md transition-transform duration-300 ${isDiagnosisMode ? 'translate-x-5 bg-[#34C759]' : ''}`}></div>
                </div>
            </label>
            <style>{`#diagnosis-toggle:checked ~ .block { background-color: #D1FAE5; }`}</style>
        </div>

        <div className="bg-[#F2F2F7] p-2 rounded-3xl flex items-center gap-2 border border-[#E5E5EA] shadow-sm">
            <button 
                onClick={isListening ? stopListening : startListening}
                className={`p-3 rounded-full transition-all duration-200 ${isListening ? 'bg-[#FF3B30] text-white shadow-md scale-110' : 'text-[#8E8E93] hover:bg-white'}`}
            >
                <MicrophoneIcon className="w-5 h-5" />
            </button>
             <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isListening ? T.common.listening : (isDiagnosisMode ? T.patientSimulator.placeholderDiagnosis : T.patientSimulator.placeholderQuestion)}
                 className="flex-grow bg-transparent border-none focus:ring-0 text-[#1C1C1E] placeholder-[#AEAEB2] text-base"
                disabled={isLoading}
            />
            <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                 className="p-3 bg-[#34C759] text-white rounded-full shadow-sm hover:bg-[#2DB84D] disabled:bg-[#C7C7CC] disabled:shadow-none transition-all"
            >
                <SendIcon className="w-5 h-5" />
            </button>
        </div>
    </div>
  );
};

export default PatientSimulator;
