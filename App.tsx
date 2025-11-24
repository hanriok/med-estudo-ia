
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { User, ProgressData, View, Language, StudyMaterial } from './types';
import { translations } from './lib/translations';
import Auth from './components/Auth';
import QuestionBank from './components/QuestionBank';
import FlashcardGenerator from './components/FlashcardGenerator';
import ClinicalTutor from './components/ClinicalTutor';
import PatientSimulator from './components/PatientSimulator';
import ProgressTracker from './components/ProgressTracker';
import Settings from './components/Settings';
import StudyMaterials from './components/StudyMaterials';
import { BrainCircuitIcon, StethoscopeIcon, LayoutDashboardIcon, LineChartIcon, BotMessageSquareIcon, FileTextIcon, LayersIcon, LogOutIcon, Volume2Icon, SettingsIcon, GraduationCapIcon, ChevronDownIcon, PaperclipIcon } from './components/icons';
import { isApiKeySet } from './services/geminiService';
import ApiKeyMissingScreen from './components/ApiKeyMissingScreen';

const KEY_IS_CONFIGURED = isApiKeySet();

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [progressData, setProgressData] = useState<ProgressData>({});
  const [language, setLanguage] = useState<Language>('en');
  const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState(false);
  const [usageData, setUsageData] = useState<Record<string, number>>({});
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
  const startTimeRef = useRef<number>(Date.now());

  // Track time spent on each view
  useEffect(() => {
    startTimeRef.current = Date.now();
    
    return () => {
        if (!user) return;
        const endTime = Date.now();
        const duration = (endTime - startTimeRef.current) / 1000; // Duration in seconds
        setUsageData(prev => ({
            ...prev,
            [currentView]: (prev[currentView] || 0) + duration
        }));
    };
  }, [currentView, user]);

  if (!KEY_IS_CONFIGURED) {
    return <ApiKeyMissingScreen language={language} setLanguage={setLanguage} />;
  }

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setProgressData({});
    setUsageData({});
    setStudyMaterials([]);
    setCurrentView('dashboard');
  };

  const handleUpdateUser = (updates: Partial<User>) => {
      if (user) {
          setUser({ ...user, ...updates });
      }
  };

  const updateProgress = useCallback((topic: string, isCorrect: boolean) => {
    setProgressData(prevData => {
      const topicData = prevData[topic] || { correct: 0, total: 0 };
      return {
        ...prevData,
        [topic]: {
          correct: topicData.correct + (isCorrect ? 1 : 0),
          total: topicData.total + 1,
        },
      };
    });
  }, []);

  const T = translations[language];

  const renderView = (currentUser: User) => {
    switch (currentView) {
      case 'question_bank':
        return <QuestionBank user={currentUser} updateProgress={updateProgress} language={language} onNavigate={setCurrentView} materials={studyMaterials} />;
      case 'flashcards':
        return <FlashcardGenerator user={currentUser} language={language} onNavigate={setCurrentView} materials={studyMaterials} />;
      case 'tutor':
        return <ClinicalTutor user={currentUser} language={language} onNavigate={setCurrentView} isVoiceOutputEnabled={isVoiceOutputEnabled} materials={studyMaterials} />;
      case 'patient_sim':
        return <PatientSimulator user={currentUser} language={language} onNavigate={setCurrentView} isVoiceOutputEnabled={isVoiceOutputEnabled} materials={studyMaterials} />;
      case 'progress':
        return <ProgressTracker progressData={progressData} usageData={usageData} language={language} onNavigate={setCurrentView} />;
      case 'materials':
        return <StudyMaterials materials={studyMaterials} setMaterials={setStudyMaterials} language={language} onNavigate={setCurrentView} />;
      case 'settings':
        return <Settings user={currentUser} onUpdateUser={handleUpdateUser} language={language} setLanguage={setLanguage} onNavigate={setCurrentView} />;
      default:
        return <Dashboard onNavigate={setCurrentView} language={language} />;
    }
  };

  if (!user) {
      return (
          <main className="min-h-screen bg-[#F2F2F7] flex items-center justify-center p-6">
              <Auth onLogin={handleLogin} language={language} setLanguage={setLanguage} />
          </main>
      );
  }

  return (
    <div className="min-h-screen flex bg-[#F2F2F7] text-[#1C1C1E] font-sans">
      {/* Sidebar - macOS style */}
      <aside className="w-20 md:w-72 bg-[#F2F2F7]/80 backdrop-blur-xl border-r border-[#E5E5EA] flex flex-col sticky top-0 h-screen z-50">
        <div className="flex items-center px-6 py-6 mb-2">
          <div className="bg-blue-500 p-2 rounded-xl shadow-sm">
            <StethoscopeIcon className="h-6 w-6 text-white" />
          </div>
          <h1 className="hidden md:block ml-3 text-xl font-bold tracking-tight text-[#1C1C1E]">MedIQ AI</h1>
        </div>
        
        <nav className="flex-1 px-3 space-y-1">
            <div className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider px-4 py-2 hidden md:block mb-1">
                Main Menu
            </div>
            <NavItem icon={<LayoutDashboardIcon />} text={T.sidebar.dashboard} active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
            <NavItem icon={<FileTextIcon />} text={T.sidebar.questionBank} active={currentView === 'question_bank'} onClick={() => setCurrentView('question_bank')} />
            <NavItem icon={<LayersIcon />} text={T.sidebar.flashcards} active={currentView === 'flashcards'} onClick={() => setCurrentView('flashcards')} />
            <NavItem icon={<BotMessageSquareIcon />} text={T.sidebar.aiTutor} active={currentView === 'tutor'} onClick={() => setCurrentView('tutor')} />
            <NavItem icon={<BrainCircuitIcon />} text={T.sidebar.patientSimulator} active={currentView === 'patient_sim'} onClick={() => setCurrentView('patient_sim')} />
            <NavItem icon={<LineChartIcon />} text={T.sidebar.progress} active={currentView === 'progress'} onClick={() => setCurrentView('progress')} />
            
            <div className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider px-4 py-2 mt-4 hidden md:block mb-1">
                Library
            </div>
            <NavItem icon={<PaperclipIcon />} text={T.sidebar.materials} active={currentView === 'materials'} onClick={() => setCurrentView('materials')} />
            
            <div className="mt-4 border-t border-[#E5E5EA] pt-4">
                 <NavItem icon={<SettingsIcon />} text={T.sidebar.settings} active={currentView === 'settings'} onClick={() => setCurrentView('settings')} />
            </div>
        </nav>

        <div className="p-4 border-t border-[#E5E5EA] bg-[#F2F2F7]/50 backdrop-blur-sm">
            <NavItem icon={<LogOutIcon />} text={T.sidebar.logout} active={false} onClick={handleLogout} />
            
            <div className="mt-4 flex items-center justify-between px-2">
                <div className="flex items-center">
                    <Volume2Icon className="w-4 h-4 text-[#8E8E93]" />
                    <span className="hidden md:inline ml-3 text-sm font-medium text-[#1C1C1E]">{T.sidebar.voiceOutput}</span>
                </div>
                <label htmlFor="voice-toggle" className="flex items-center cursor-pointer">
                    <div className="relative">
                        <input type="checkbox" id="voice-toggle" className="sr-only" checked={isVoiceOutputEnabled} onChange={() => setIsVoiceOutputEnabled(!isVoiceOutputEnabled)} />
                        <div className={`block w-10 h-6 rounded-full transition-colors duration-300 ease-in-out ${isVoiceOutputEnabled ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-300 ease-in-out ${isVoiceOutputEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                </label>
            </div>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto bg-white md:rounded-tl-3xl md:mt-0 shadow-[inset_0px_0px_20px_rgba(0,0,0,0.02)] relative">
        <div className="max-w-7xl mx-auto">
            {/* Top Bar for Period Selection */}
            <div className="flex justify-end mb-4 px-2 md:px-0">
                <div className="relative group">
                    <div className="flex items-center gap-2 bg-[#F2F2F7] hover:bg-[#E5E5EA] transition-colors px-4 py-2 rounded-full cursor-pointer">
                        <GraduationCapIcon className="w-4 h-4 text-[#8E8E93] group-hover:text-[#007AFF] transition-colors" />
                        <span className="text-sm font-medium text-[#1C1C1E] min-w-[80px]">{user.period}</span>
                        <ChevronDownIcon className="w-3 h-3 text-[#8E8E93]" />
                    </div>
                    <select
                        value={user.period}
                        onChange={(e) => handleUpdateUser({ period: e.target.value })}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        aria-label="Select Period"
                    >
                        {translations[language].auth.periods.map((p) => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </div>
            </div>

            {renderView(user)}
        </div>
      </main>
    </div>
  );
};

interface NavItemProps {
    icon: React.ReactNode;
    text: string;
    active: boolean;
    onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, text, active, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full px-4 py-2.5 my-1 rounded-xl transition-all duration-200 group ${
        active
            ? 'bg-[#007AFF] text-white shadow-md shadow-blue-200'
            : 'text-[#1C1C1E] hover:bg-[#E5E5EA]'
        }`}
    >
        <div className={`w-5 h-5 ${active ? 'text-white' : 'text-[#8E8E93] group-hover:text-[#1C1C1E]'}`}>{icon}</div>
        <span className="hidden md:inline ml-3 font-medium text-sm tracking-tight">{text}</span>
    </button>
);

interface DashboardProps {
    onNavigate: (view: View) => void;
    language: Language;
}
  
const Dashboard: React.FC<DashboardProps> = ({ onNavigate, language }) => {
    const T = translations[language].dashboard;
    return (
        <div className="animate-fade-in space-y-8">
            <div>
                <h1 className="text-4xl font-bold tracking-tight text-[#1C1C1E]">{T.title}</h1>
                <p className="mt-2 text-lg text-[#8E8E93] font-light">{T.subtitle}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardCard
                    icon={<FileTextIcon />}
                    title={T.questionBank.title}
                    description={T.questionBank.description}
                    onClick={() => onNavigate('question_bank')}
                    cta={T.cta}
                    color="bg-orange-500"
                />
                <DashboardCard
                    icon={<LayersIcon />}
                    title={T.flashcards.title}
                    description={T.flashcards.description}
                    onClick={() => onNavigate('flashcards')}
                    cta={T.cta}
                    color="bg-purple-500"
                />
                <DashboardCard
                    icon={<BotMessageSquareIcon />}
                    title={T.aiTutor.title}
                    description={T.aiTutor.description}
                    onClick={() => onNavigate('tutor')}
                    cta={T.cta}
                    color="bg-blue-500"
                />
                <DashboardCard
                    icon={<BrainCircuitIcon />}
                    title={T.patientSimulator.title}
                    description={T.patientSimulator.description}
                    onClick={() => onNavigate('patient_sim')}
                    cta={T.cta}
                    color="bg-green-500"
                />
                <DashboardCard
                    icon={<LineChartIcon />}
                    title={T.progress.title}
                    description={T.progress.description}
                    onClick={() => onNavigate('progress')}
                    cta={T.cta}
                    color="bg-pink-500"
                />
            </div>
        </div>
    );
};
  
interface DashboardCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
    cta: string;
    color: string;
}
  
const DashboardCard: React.FC<DashboardCardProps> = ({ icon, title, description, onClick, cta, color }) => (
    <button 
        onClick={onClick} 
        className="bg-[#F2F2F7] p-6 rounded-3xl hover:bg-[#E5E5EA] transition-all duration-300 text-left flex flex-col h-full group active:scale-[0.98]"
    >
        <div className={`w-12 h-12 ${color} text-white rounded-2xl flex items-center justify-center shadow-sm mb-4`}>
            {React.cloneElement(icon as React.ReactElement<any>, { strokeWidth: 2 })}
        </div>
        <h3 className="text-xl font-bold text-[#1C1C1E] tracking-tight">{title}</h3>
        <p className="mt-2 text-[#8E8E93] text-sm leading-relaxed flex-grow">{description}</p>
        <div className="mt-6 flex items-center text-[#007AFF] font-semibold text-sm group-hover:translate-x-1 transition-transform">
            {cta} <span className="ml-1">&rarr;</span>
        </div>
    </button>
);

export default App;
