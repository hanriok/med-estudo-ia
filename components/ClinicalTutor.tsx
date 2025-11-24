
import React, { useState, useRef, useEffect } from 'react';
import { User, ChatMessage, Language, View, StudyMaterial } from '../types';
import { createTutorChat } from '../services/geminiService';
import { translations } from '../lib/translations';
import { Loader2, SendIcon, ArrowLeftIcon, MicrophoneIcon, PaperclipIcon } from './icons';
import { useSpeech } from '../hooks/useSpeech';

interface ClinicalTutorProps {
  user: User;
  language: Language;
  onNavigate: (view: View) => void;
  isVoiceOutputEnabled: boolean;
  materials: StudyMaterial[];
}

const ClinicalTutor: React.FC<ClinicalTutorProps> = ({ user, language, onNavigate, isVoiceOutputEnabled, materials }) => {
  const T = translations[language];
  const [chat, setChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { transcript, isListening, startListening, stopListening, speak, cancelSpeaking } = useSpeech({ language });

  useEffect(() => {
    const initChat = () => {
      cancelSpeaking();
      const newChat = createTutorChat(user.learningStyle, user.period, language, materials);
      setChat(newChat);
      const initialMessage = T.clinicalTutor.initialMessage;
      setMessages([{ role: 'model', content: initialMessage }]);
      if (isVoiceOutputEnabled) {
        speak(initialMessage);
      }
    };
    initChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.learningStyle, user.period, language, materials]); // Re-init if materials change
  
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
    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chat.sendMessage(input);
      const modelMessage: ChatMessage = { role: 'model', content: result.text };
      setMessages(prev => [...prev, modelMessage]);
      if (isVoiceOutputEnabled) {
        speak(result.text);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessageContent = T.clinicalTutor.error;
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
                    <h1 className="text-xl font-bold text-[#1C1C1E]">{T.clinicalTutor.title}</h1>
                    <p className="text-xs text-[#8E8E93]">{T.clinicalTutor.subtitle}</p>
                 </div>
            </div>
            {materials.length > 0 && (
                <div className="bg-[#E5E5EA] px-3 py-1 rounded-full flex items-center gap-2">
                    <PaperclipIcon className="w-3 h-3 text-[#007AFF]" />
                    <span className="text-xs font-medium text-[#1C1C1E]">{T.clinicalTutor.usingContext}</span>
                </div>
            )}
        </div>
        
        <div className="flex-1 overflow-y-auto px-2 space-y-6 mb-4">
            {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-5 py-3 rounded-2xl shadow-sm text-base leading-relaxed ${
                        msg.role === 'user' 
                        ? 'bg-[#007AFF] text-white rounded-br-sm' 
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
                placeholder={isListening ? T.common.listening : T.clinicalTutor.placeholder}
                className="flex-grow bg-transparent border-none focus:ring-0 text-[#1C1C1E] placeholder-[#AEAEB2] text-base"
                disabled={isLoading}
            />
            <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="p-3 bg-[#007AFF] text-white rounded-full shadow-sm hover:bg-[#0062cc] disabled:bg-[#C7C7CC] disabled:shadow-none transition-all"
            >
                <SendIcon className="w-5 h-5" />
            </button>
        </div>
    </div>
  );
};

export default ClinicalTutor;
