
import React, { useState } from 'react';
import { LearningStyle, Language, User } from '../types';
import { translations } from '../lib/translations';
import { EyeIcon, EarIcon, HandIcon, GoogleIcon, UserCircleIcon, MailIcon, LockIcon, BuildingIcon, GraduationCapIcon, PhoneIcon } from './icons';

interface AuthProps {
  onLogin: (user: User) => void;
  language: Language;
  setLanguage: (language: Language) => void;
}

type AuthView = 'login' | 'register' | 'profile';

const Auth: React.FC<AuthProps> = ({ onLogin, language, setLanguage }) => {
  const T = translations[language].auth;
  const [authView, setAuthView] = useState<AuthView>('login');
  
  // State for registration form
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    university: '',
    period: '',
  });
  const [registerError, setRegisterError] = useState('');

  // State for login form
  const [loginEmail, setLoginEmail] = useState('');

  // Combined user data for final step
  const [userData, setUserData] = useState<Partial<User>>({});
  const [learningStyle, setLearningStyle] = useState<LearningStyle | null>(null);

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError(T.errors.passwordsDoNotMatch);
      return;
    }
    setRegisterError('');
    // In a real app, you'd save the user. Here we just move to the next step.
    const { name, email, phone, university, period } = registerData;
    setUserData({ name, email, phone, university, period });
    setAuthView('profile');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login for an existing user. For this demo, we'll create a mock user.
    const mockUser: User = {
        name: 'Returning Student',
        email: loginEmail || 'student@med.edu',
        university: 'MedIQ University',
        period: '3rd Period',
        learningStyle: 'visual',
    };
    onLogin(mockUser);
  };
  
  const handleGoogleLogin = () => {
     const mockUser: User = {
        name: 'Google Student',
        email: 'student.google@med.edu',
        university: 'Google University',
        period: '4th Period',
        learningStyle: 'practical',
    };
    onLogin(mockUser);
  };

  const handleFinish = () => {
    if (learningStyle) {
        onLogin({ ...userData, learningStyle } as User);
    }
  };

  const renderRegisterForm = () => (
    <form onSubmit={handleRegister} className="space-y-4">
      <h2 className="text-2xl font-bold text-[#1C1C1E] tracking-tight text-center mb-6">{T.createAccountTitle}</h2>
      <div className="space-y-3">
        <InputWithIcon icon={<UserCircleIcon />} type="text" placeholder={T.form.namePlaceholder} name="name" value={registerData.name} onChange={handleRegisterChange} required />
        <InputWithIcon icon={<MailIcon />} type="email" placeholder={T.form.emailPlaceholder} name="email" value={registerData.email} onChange={handleRegisterChange} required />
        <InputWithIcon icon={<PhoneIcon />} type="tel" placeholder={T.form.phonePlaceholder} name="phone" value={registerData.phone} onChange={handleRegisterChange} />
        <InputWithIcon icon={<LockIcon />} type="password" placeholder={T.form.passwordPlaceholder} name="password" value={registerData.password} onChange={handleRegisterChange} required />
        <InputWithIcon icon={<LockIcon />} type="password" placeholder={T.form.passwordConfirmPlaceholder} name="confirmPassword" value={registerData.confirmPassword} onChange={handleRegisterChange} required />
        <InputWithIcon icon={<BuildingIcon />} type="text" placeholder={T.form.universityPlaceholder} name="university" value={registerData.university} onChange={handleRegisterChange} required />
        <InputWithIcon icon={<GraduationCapIcon />} isSelect={true}>
            <select
                name="period"
                className="w-full bg-transparent focus:outline-none text-[#1C1C1E]"
                value={registerData.period}
                onChange={handleRegisterChange}
                required
            >
                <option value="">{T.form.selectPeriod}</option>
                {T.periods.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
        </InputWithIcon>
      </div>
      {registerError && <p className="text-sm text-red-500 text-center">{registerError}</p>}
      <button type="submit" className="w-full py-3.5 bg-[#007AFF] text-white font-semibold rounded-xl shadow-sm hover:bg-[#0062cc] transition-colors mt-6 text-sm">
        {T.createAccountButton}
      </button>
      <p className="text-center text-sm mt-4">
        <button type="button" onClick={() => setAuthView('login')} className="font-medium text-[#007AFF] hover:underline">
          {T.toggleToLogin}
        </button>
      </p>
    </form>
  );

  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="space-y-5">
        <h2 className="text-2xl font-bold text-[#1C1C1E] tracking-tight text-center mb-6">{T.loginTitle}</h2>
        <div className="space-y-4">
            <InputWithIcon icon={<MailIcon />} type="email" placeholder={T.form.emailPlaceholder} name="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
            <InputWithIcon icon={<LockIcon />} type="password" placeholder={T.form.passwordPlaceholder} name="password" required />
        </div>
        <button type="submit" className="w-full py-3.5 bg-[#007AFF] text-white font-semibold rounded-xl shadow-sm hover:bg-[#0062cc] transition-colors text-sm">
            {T.loginButton}
        </button>
        
        <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-[#E5E5EA]"></div>
            <span className="flex-shrink-0 mx-4 text-[#8E8E93] text-xs font-medium">OR CONTINUE WITH</span>
            <div className="flex-grow border-t border-[#E5E5EA]"></div>
        </div>

        <button type="button" onClick={handleGoogleLogin} className="w-full py-3.5 bg-white border border-[#E5E5EA] text-[#1C1C1E] font-medium rounded-xl hover:bg-[#F2F2F7] transition-colors flex items-center justify-center gap-2 text-sm">
            <GoogleIcon className="w-5 h-5" />
            {T.googleLoginButton}
        </button>
        <p className="text-center text-sm mt-4">
            <button type="button" onClick={() => setAuthView('register')} className="font-medium text-[#007AFF] hover:underline">
            {T.toggleToRegister}
            </button>
        </p>
    </form>
  );
  
  const renderProfileSelector = () => (
    <div>
        <h2 className="text-2xl font-bold text-[#1C1C1E] text-center">{T.learningStyleTitle}</h2>
        <p className="mt-2 text-[#8E8E93] text-center">{T.learningStyleSubtitle}</p>
        <div className="mt-8 grid grid-cols-1 gap-4">
            <ProfileCard icon={<EyeIcon />} title={T.visual.title} description={T.visual.description} onClick={() => setLearningStyle('visual')} isSelected={learningStyle === 'visual'} />
            <ProfileCard icon={<EarIcon />} title={T.auditory.title} description={T.auditory.description} onClick={() => setLearningStyle('auditory')} isSelected={learningStyle === 'auditory'} />
            <ProfileCard icon={<HandIcon />} title={T.practical.title} description={T.practical.description} onClick={() => setLearningStyle('practical')} isSelected={learningStyle === 'practical'} />
        </div>
        <div className="mt-8">
            <button onClick={handleFinish} disabled={!learningStyle} className="w-full py-3.5 bg-[#007AFF] text-white font-semibold rounded-xl shadow-sm hover:bg-[#0062cc] disabled:bg-[#C7C7CC] disabled:cursor-not-allowed transition-all duration-300">
                {T.finishButton}
            </button>
        </div>
    </div>
  );

  return (
    <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl shadow-black/5 max-w-md w-full relative animate-fade-in-up border border-[#E5E5EA]">
      <div className="absolute top-6 right-6 flex gap-1 bg-[#F2F2F7] p-1 rounded-lg">
            <button onClick={() => setLanguage('en')} className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${language === 'en' ? 'bg-white text-black shadow-sm' : 'text-[#8E8E93]'}`}>EN</button>
            <button onClick={() => setLanguage('pt')} className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${language === 'pt' ? 'bg-white text-black shadow-sm' : 'text-[#8E8E93]'}`}>PT</button>
      </div>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black tracking-tighter text-[#007AFF]">MedIQ AI</h1>
      </div>
      
      {authView === 'login' && renderLoginForm()}
      {authView === 'register' && renderRegisterForm()}
      {authView === 'profile' && renderProfileSelector()}
    </div>
  );
};


interface ProfileCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
    isSelected: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ icon, title, description, onClick, isSelected }) => (
    <button onClick={onClick} className={`p-4 rounded-2xl transition-all duration-200 flex items-center text-left gap-4 border ${isSelected ? 'bg-blue-50 border-[#007AFF] ring-1 ring-[#007AFF]' : 'bg-[#F2F2F7] border-transparent hover:bg-[#E5E5EA]'}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? 'bg-[#007AFF] text-white' : 'bg-white text-[#8E8E93]'}`}>
            {/* Fixed TypeScript error by casting icon to ReactElement<any> */}
            {React.cloneElement(icon as React.ReactElement<any>, { className: "w-5 h-5" })}
        </div>
        <div>
            <h3 className={`text-base font-semibold ${isSelected ? 'text-[#007AFF]' : 'text-[#1C1C1E]'}`}>{title}</h3>
            <p className="text-xs text-[#8E8E93] mt-0.5">{description}</p>
        </div>
    </button>
);

interface InputWithIconProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon: React.ReactNode;
    isSelect?: boolean;
    children?: React.ReactNode;
}

const InputWithIcon: React.FC<InputWithIconProps> = ({ icon, isSelect = false, children, ...props }) => (
    <div className="flex items-center bg-[#F2F2F7] rounded-xl transition-all group focus-within:ring-2 focus-within:ring-[#007AFF]/20 focus-within:bg-white border border-transparent focus-within:border-[#007AFF]">
        <div className="pl-4 text-[#8E8E93] group-focus-within:text-[#007AFF] transition-colors">{icon}</div>
        {isSelect ? (
            <div className="w-full p-3.5">{children}</div>
        ) : (
            <input
                {...props}
                className="w-full p-3.5 bg-transparent focus:outline-none text-[#1C1C1E] placeholder-[#AEAEB2] text-sm font-medium"
            />
        )}
    </div>
);


export default Auth;
