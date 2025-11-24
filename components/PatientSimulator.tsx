
import React, { useState, useRef, useEffect } from 'react';
import { User, ChatMessage, Language, View, StudyMaterial } from '../types';
import { createPatientChat, evaluateTreatment } from '../services/geminiService';
import { translations } from '../lib/translations';
import { Loader2, SendIcon, StethoscopeIcon, ArrowLeftIcon, MicrophoneIcon, PaperclipIcon, CheckCircleIcon, TriangleAlertIcon, RefreshCwIcon } from './icons';
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
  const [treatmentInput, setTreatmentInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<{ correct: boolean, title: string, feedback: string } | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Speech hooks for Chat
  const chatSpeech = useSpeech({ language });
  
  // Speech hooks for Treatment Plan (Separate instance to manage separate input state)
  const treatmentSpeech = useSpeech({ language });

  const startNewCase = () => {
    chatSpeech.cancelSpeaking();
    const newChat = createPatientChat(user.period, language, materials);
    setChat(newChat);
    const initialMessage = T.patientSimulator.initialMessage;
    setMessages([{ role: 'model', content: initialMessage }]);
    setEvaluation(null);
    setTreatmentInput('');
    if (isVoiceOutputEnabled) {
      chatSpeech.speak(initialMessage);
    }
  };
  
  useEffect(() => {
    startNewCase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.period, language, materials]);
  
  // Handle speech-to-text for Chat
  useEffect(() => {
    if (chatSpeech.transcript) {
        setInput(chatSpeech.transcript);
    }
  }, [chatSpeech.transcript]);

  // Handle speech-to-text for Treatment
  useEffect(() => {
      if (treatmentSpeech.transcript) {
          setTreatmentInput(prev => prev + (prev ? ' ' : '') + treatmentSpeech.transcript);
      }
  }, [treatmentSpeech.transcript]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chat || isLoading) return;

    chatSpeech.cancelSpeaking();
    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    
    setInput('');
    setIsLoading(true);

    try {
      const result = await chat.sendMessage(input);
      const modelMessage: ChatMessage = { role: 'model', content: result.text };
      setMessages(prev => [...prev, modelMessage]);
      if (isVoiceOutputEnabled) {
        chatSpeech.speak(result.text);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessageContent = T.patientSimulator.error;
      const errorMessage: ChatMessage = { role: 'model', content: errorMessageContent };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitTreatment = async () => {
      if (!treatmentInput.trim()) return;
      setIsLoading(true);
      treatmentSpeech.stopListening();

      try {
          const result = await evaluateTreatment(messages, treatmentInput, language);
          setEvaluation(result);
      } catch (e) {
          console.error(e);
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-6rem)] max-w-4xl mx-auto animate-fade-in relative">
         <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#E5E5EA]">
             <div className="flex items-center gap-2">
                <button onClick={() => { chatSpeech.cancelSpeaking(); onNavigate('dashboard'); }} className="p-2 -ml-2 hover:bg-[#F2F2F7] rounded-full transition-colors text-[#007AFF]">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                 <div>
                    <h1 className="text-xl font-bold text-[#1C1C1E]">{T.patientSimulator.title}</h1>
                    <p className="text-xs text-[#8E8E93]">{T.patientSimulator.subtitle}</p>
                 </div>
            </div>
             <button onClick={startNewCase} className="px-4 py-1.5 bg-[#F2F2F7] text-[#007AFF] font-semibold rounded-full hover:bg-[#E5E5EA] transition-colors text-sm flex items-center gap-1">
                <RefreshCwIcon className="w-3.5 h-3.5" />
                {T.patientSimulator.newCaseButton}
            </button>
        </div>
        
        {materials.length > 0 && (
            <div className="bg-[#E8F5E9] border border-[#C6F6D5] px-3 py-2 rounded-xl mb-2 flex items-center gap-2 shrink-0">
                <PaperclipIcon className="w-4 h-4 text-[#2F855A]" />
                <span className="text-xs font-semibold text-[#22543D]">{T.patientSimulator.usingContext}</span>
            </div>
        )}
        
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4 mb-4">
            {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[85%] px-5 py-3 rounded-2xl shadow-sm text-base leading-relaxed ${
                        msg.role === 'user' 
                        ? 'bg-[#34C759] text-white rounded-br-sm' 
                        : 'bg-[#E9E9EB] text-black rounded-bl-sm'
                    }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                </div>
            ))}
            {isLoading && !evaluation && (
                 <div className="flex justify-start">
                    <div className="px-4 py-3 rounded-2xl bg-[#E9E9EB] rounded-bl-sm">
                       <Loader2 className="w-5 h-5 text-[#8E8E93] animate-spin" />
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Evaluation Overlay */}
        {evaluation && (
             <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in rounded-3xl">
                <div className="bg-white border border-[#E5E5EA] shadow-2xl rounded-3xl p-8 max-w-lg w-full text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${evaluation.correct ? 'bg-[#34C759]/10 text-[#34C759]' : 'bg-[#FF3B30]/10 text-[#FF3B30]'}`}>
                        {evaluation.correct ? <CheckCircleIcon className="w-8 h-8" /> : <TriangleAlertIcon className="w-8 h-8" />}
                    </div>
                    <h2 className="text-2xl font-bold text-[#1C1C1E] mb-2">{evaluation.title}</h2>
                    <p className="text-[#3A3A3C] text-lg leading-relaxed mb-8">{evaluation.feedback}</p>
                    <div className="flex gap-3">
                         <button onClick={() => setEvaluation(null)} className="flex-1 py-3 text-[#8E8E93] font-semibold hover:bg-[#F2F2F7] rounded-xl transition-colors">
                            {T.patientSimulator.tryAgain}
                         </button>
                         <button onClick={startNewCase} className="flex-1 py-3 bg-[#007AFF] text-white font-semibold rounded-xl hover:bg-[#0062cc] shadow-sm transition-colors">
                            {T.patientSimulator.nextCase}
                         </button>
                    </div>
                </div>
             </div>
        )}

        {/* Input Controls */}
        <div className="shrink-0 space-y-3">
            {/* Chat Input */}
            <div className="bg-[#F2F2F7] p-2 rounded-3xl flex items-center gap-2 border border-[#E5E5EA] shadow-sm">
                <button 
                    onClick={chatSpeech.isListening ? chatSpeech.stopListening : chatSpeech.startListening}
                    className={`p-3 rounded-full transition-all duration-200 ${chatSpeech.isListening ? 'bg-[#FF3B30] text-white shadow-md scale-110' : 'text-[#8E8E93] hover:bg-white'}`}
                >
                    <MicrophoneIcon className="w-5 h-5" />
                </button>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={chatSpeech.isListening ? T.common.listening : T.patientSimulator.placeholderQuestion}
                    className="flex-grow bg-transparent border-none focus:ring-0 text-[#1C1C1E] placeholder-[#AEAEB2] text-base"
                    disabled={isLoading || !!evaluation}
                />
                <button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim() || !!evaluation}
                    className="p-3 bg-[#34C759] text-white rounded-full shadow-sm hover:bg-[#2DB84D] disabled:bg-[#C7C7CC] disabled:shadow-none transition-all"
                >
                    <SendIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Treatment Plan Section */}
            <div className="bg-white p-4 rounded-3xl border border-[#E5E5EA] shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <StethoscopeIcon className="w-4 h-4 text-[#007AFF]" />
                    <span className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider">{T.patientSimulator.treatmentTitle}</span>
                </div>
                <div className="flex gap-2">
                    <div className="relative flex-grow">
                        <textarea
                            value={treatmentInput}
                            onChange={(e) => setTreatmentInput(e.target.value)}
                            placeholder={treatmentSpeech.isListening ? T.common.listening : T.patientSimulator.treatmentPlaceholder}
                            className="w-full bg-[#F2F2F7] rounded-2xl p-3 pr-10 text-sm focus:ring-2 focus:ring-[#007AFF]/20 border-none resize-none h-14"
                            disabled={isLoading || !!evaluation}
                        />
                         <button 
                            onClick={treatmentSpeech.isListening ? treatmentSpeech.stopListening : treatmentSpeech.startListening}
                            className={`absolute right-2 top-2 p-1.5 rounded-full transition-all ${treatmentSpeech.isListening ? 'text-[#FF3B30] bg-white shadow-sm' : 'text-[#8E8E93] hover:text-[#007AFF]'}`}
                        >
                            <MicrophoneIcon className="w-4 h-4" />
                        </button>
                    </div>
                    <button
                        onClick={handleSubmitTreatment}
                        disabled={isLoading || !treatmentInput.trim() || !!evaluation}
                        className="bg-[#007AFF] text-white px-4 rounded-2xl font-bold text-sm hover:bg-[#0062cc] disabled:bg-[#C7C7CC] disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                         {isLoading && treatmentInput ? <Loader2 className="w-5 h-5 animate-spin" /> : T.patientSimulator.submitTreatment}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default PatientSimulator;
