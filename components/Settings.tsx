
import React, { useState } from 'react';
import { User, Language, LearningStyle, View } from '../types';
import { translations } from '../lib/translations';
import { ArrowLeftIcon, UserCircleIcon, GraduationCapIcon, EyeIcon, EarIcon, HandIcon } from './icons';

interface SettingsProps {
  user: User;
  onUpdateUser: (user: Partial<User>) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onNavigate: (view: View) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser, language, setLanguage, onNavigate }) => {
  const T = translations[language];
  const [selectedPeriod, setSelectedPeriod] = useState(user.period);
  const [selectedStyle, setSelectedStyle] = useState(user.learningStyle);
  const [message, setMessage] = useState('');

  const handleSave = () => {
    onUpdateUser({
        period: selectedPeriod,
        learningStyle: selectedStyle
    });
    setMessage(T.settings.updateSuccess);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in pb-12">
        <div className="flex items-center gap-4 mb-6">
            <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-1 text-[#007AFF] hover:opacity-80 font-medium transition-opacity">
                <ArrowLeftIcon className="w-5 h-5" />
                {T.common.backButton}
            </button>
        </div>
        
        <h1 className="text-3xl font-bold text-[#1C1C1E] tracking-tight mb-2">{T.settings.title}</h1>
        <p className="text-[#8E8E93] mb-8">{T.settings.subtitle}</p>

        {message && (
            <div className="bg-[#34C759]/10 text-[#34C759] px-4 py-3 rounded-xl mb-6 border border-[#34C759]/20 text-sm font-medium">
                {message}
            </div>
        )}

        <div className="space-y-8">
            {/* Profile Section */}
            <div>
                <h2 className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-2 px-4">{T.settings.profile}</h2>
                <div className="bg-white rounded-xl border border-[#E5E5EA] divide-y divide-[#E5E5EA] overflow-hidden">
                    <div className="p-4 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#E5E5EA] rounded-full flex items-center justify-center text-[#8E8E93]">
                                <UserCircleIcon className="w-5 h-5" />
                            </div>
                            <span className="text-[#1C1C1E] font-medium">{user.name}</span>
                         </div>
                         <span className="text-[#8E8E93] text-sm">{user.email}</span>
                    </div>
                    
                    <div className="p-4 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#007AFF]/10 rounded-full flex items-center justify-center text-[#007AFF]">
                                <GraduationCapIcon className="w-5 h-5" />
                            </div>
                            <span className="text-[#1C1C1E] font-medium">{T.settings.period}</span>
                         </div>
                         <select 
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="bg-transparent text-[#007AFF] font-medium focus:outline-none text-right rtl:text-left cursor-pointer"
                         >
                             {translations[language].auth.periods.map((p) => (
                                 <option key={p} value={p}>{p}</option>
                             ))}
                         </select>
                    </div>

                     <div className="p-4 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#AF52DE]/10 rounded-full flex items-center justify-center text-[#AF52DE]">
                                {selectedStyle === 'visual' && <EyeIcon className="w-5 h-5" />}
                                {selectedStyle === 'auditory' && <EarIcon className="w-5 h-5" />}
                                {selectedStyle === 'practical' && <HandIcon className="w-5 h-5" />}
                            </div>
                            <span className="text-[#1C1C1E] font-medium">{T.settings.learningStyle}</span>
                         </div>
                         <select 
                            value={selectedStyle}
                            onChange={(e) => setSelectedStyle(e.target.value as LearningStyle)}
                            className="bg-transparent text-[#007AFF] font-medium focus:outline-none text-right rtl:text-left cursor-pointer"
                         >
                             <option value="visual">{translations[language].auth.visual.title}</option>
                             <option value="auditory">{translations[language].auth.auditory.title}</option>
                             <option value="practical">{translations[language].auth.practical.title}</option>
                         </select>
                    </div>
                </div>
            </div>

            {/* App Settings */}
            <div>
                <h2 className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-2 px-4">{T.settings.appSettings}</h2>
                <div className="bg-white rounded-xl border border-[#E5E5EA] divide-y divide-[#E5E5EA] overflow-hidden">
                     <div className="p-4 flex items-center justify-between">
                         <span className="text-[#1C1C1E] font-medium px-1">{T.settings.language}</span>
                         <div className="flex items-center gap-2 bg-[#E5E5EA] p-0.5 rounded-lg">
                            <button 
                                onClick={() => setLanguage('en')}
                                className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${language === 'en' ? 'bg-white shadow-sm text-[#1C1C1E]' : 'text-[#8E8E93]'}`}
                            >
                                English
                            </button>
                            <button 
                                onClick={() => setLanguage('pt')}
                                className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${language === 'pt' ? 'bg-white shadow-sm text-[#1C1C1E]' : 'text-[#8E8E93]'}`}
                            >
                                Português
                            </button>
                         </div>
                    </div>
                </div>
            </div>

            <button 
                onClick={handleSave}
                className="w-full py-3.5 bg-[#007AFF] text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-[#0062cc] transition-all active:scale-[0.98]"
            >
                Save Changes
            </button>
        </div>
    </div>
  );
};

export default Settings;
