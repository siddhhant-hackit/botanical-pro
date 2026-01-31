
import React, { useState } from 'react';
import { Language, UserPersona, UI_TRANSLATIONS, UserProfile, ThemeType } from '../types';
import { getEnvironmentMode, fetchMarketContext } from '../services/envService';

interface LoginProps {
  onLogin: (profile: UserProfile) => void;
  language: Language;
}

const Login: React.FC<LoginProps> = ({ onLogin, language }) => {
  const t = UI_TRANSLATIONS[language];
  const [name, setName] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<UserPersona>('student');
  const [languageMix, setLanguageMix] = useState<'pure' | 'mixed'>('pure');

  // Fix: Made handleSubmit async to fetch environment context
  const handleSubmit = async (isAdmin = false) => {
    // Default theme based on persona
    let initialTheme: ThemeType = 'emerald';
    if (selectedPersona === 'farmer') initialTheme = 'harvest';
    if (selectedPersona === 'student') initialTheme = 'frost';
    if (selectedPersona === 'researcher') initialTheme = 'neon';

    // Fix: Fetch mandatory environment and location data
    const env = getEnvironmentMode();
    const location = await fetchMarketContext();

    const profile: UserProfile = {
      id: isAdmin ? 'founder_admin' : 'usr_' + Math.random().toString(36).substr(2, 9),
      name: isAdmin ? 'Project Founder' : (name.trim() || 'Anonymous Explorer'),
      persona: isAdmin ? 'researcher' : selectedPersona,
      env, // Added missing property
      location, // Added missing property
      lastActive: Date.now(),
      theme: initialTheme,
      languageMix: languageMix,
      tutorialComplete: false,
      joinDate: Date.now()
    };
    onLogin(profile);
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col items-center justify-center p-8 font-sans overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-[3.5rem] shadow-2xl p-10 border border-slate-100 animate-in fade-in zoom-in duration-700">
        <div className="w-20 h-20 bg-emerald-800 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-200 mb-8 mx-auto">
          <i className="fas fa-dna text-white text-3xl"></i>
        </div>
        
        <h1 className="text-3xl font-black text-slate-800 text-center tracking-tighter uppercase mb-2">
          Nexus Login
        </h1>
        <p className="text-slate-400 text-sm text-center mb-10 font-medium">
          Initialize your botanical identity
        </p>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Display Name</label>
            <input 
              type="text" 
              placeholder="e.g. Farmer Ramesh"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none focus:border-emerald-500 transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Field Persona</label>
            <div className="grid grid-cols-2 gap-3">
              {(['student', 'farmer', 'researcher', 'teacher'] as UserPersona[]).map(p => (
                <button
                  key={p}
                  onClick={() => setSelectedPersona(p)}
                  className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-2 ${
                    selectedPersona === p ? 'border-emerald-600 bg-emerald-50 shadow-inner' : 'border-slate-50 bg-slate-50'
                  }`}
                >
                  <span className={`text-[10px] font-black uppercase tracking-tighter ${selectedPersona === p ? 'text-emerald-800' : 'text-slate-400'}`}>
                    {t[p]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Language Preference</label>
            <div className="flex gap-2">
                <button 
                  onClick={() => setLanguageMix('pure')}
                  className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase border-2 transition-all ${languageMix === 'pure' ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-100 text-slate-400'}`}
                >
                    Standard English
                </button>
                <button 
                  onClick={() => setLanguageMix('mixed')}
                  className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase border-2 transition-all ${languageMix === 'mixed' ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-100 text-slate-400'}`}
                >
                    Mix (Hindi + English)
                </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <button 
              onClick={() => handleSubmit(false)}
              disabled={!name.trim()}
              className="w-full bg-emerald-800 text-white py-5 rounded-[2.5rem] font-black uppercase tracking-widest shadow-xl shadow-emerald-200 disabled:opacity-50 active:scale-95 transition-all"
            >
              Access Network
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
