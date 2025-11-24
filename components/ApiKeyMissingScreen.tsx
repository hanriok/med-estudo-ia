import React from 'react';
import { translations } from '../lib/translations';
import { Language } from '../types';
import { TriangleAlertIcon } from './icons';

interface ApiKeyMissingScreenProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const ApiKeyMissingScreen: React.FC<ApiKeyMissingScreenProps> = ({ language, setLanguage }) => {
  const T = translations[language].apiKeyMissing;
  return (
    <main className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-md border border-zinc-200 max-w-lg w-full text-center relative">
        <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={() => setLanguage('en')} className={`px-3 py-1 text-sm font-bold rounded-md transition-colors ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'}`}>EN</button>
            <button onClick={() => setLanguage('pt')} className={`px-3 py-1 text-sm font-bold rounded-md transition-colors ${language === 'pt' ? 'bg-blue-600 text-white' : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'}`}>PT</button>
        </div>
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <TriangleAlertIcon className="h-6 w-6 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-800 mt-4">{T.title}</h1>
        <p className="mt-2 text-zinc-600">{T.message}</p>
        <div className="mt-6 text-left bg-zinc-100 p-4 rounded-md">
            <code className="text-sm text-zinc-700">
                <p><strong>{T.variableName}</strong></p>
                <p className="mt-2">{T.variableInstructions}</p>
            </code>
        </div>
        <p className="mt-4 text-xs text-zinc-500">{T.footer}</p>
      </div>
    </main>
  );
};

export default ApiKeyMissingScreen;