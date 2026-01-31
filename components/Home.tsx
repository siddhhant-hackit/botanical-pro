
import React from 'react';
import { AppView, Language, UI_TRANSLATIONS, UserPersona } from '../types';

interface HomeProps {
  language: Language;
  setView: (view: AppView) => void;
  persona: UserPersona;
  setPersona: (persona: UserPersona) => void;
}

const Home: React.FC<HomeProps> = ({ language, setView, persona, setPersona }) => {
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;

  const personas: { id: UserPersona; icon: string; color: string; desc: string }[] = [
    { id: 'farmer', icon: 'fa-tractor', color: 'bg-orange-500', desc: 'Yield & Protection' },
    { id: 'student', icon: 'fa-user-graduate', color: 'bg-blue-500', desc: 'Learning & Biology' },
    { id: 'researcher', icon: 'fa-flask', color: 'bg-purple-500', desc: 'Scientific Analysis' },
    { id: 'teacher', icon: 'fa-chalkboard-teacher', color: 'bg-emerald-500', desc: 'Education Tools' },
  ];

  return (
    <div className="flex flex-col animate-in fade-in duration-700 pb-24">
      {/* Hero Section */}
      <section className="px-8 pt-12 pb-8 bg-[var(--accent)] text-[var(--bg-primary)] rounded-b-[3.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
          <i className="fas fa-leaf text-[12rem]"></i>
        </div>
        
        <div className="relative z-10">
          <h1 className="text-4xl font-black tracking-tighter leading-[1] mb-2 uppercase italic">
            Botanica <span className="opacity-60">AI</span>
          </h1>
          <p className="text-[var(--bg-primary)] opacity-80 text-[10px] font-black uppercase tracking-widest leading-relaxed max-w-[280px] mb-8">
            Expert Intelligence Layer for {persona}s
          </p>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setView(AppView.SCANNER)}
              className="bg-[var(--bg-primary)] text-[var(--accent)] px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
            >
              <i className="fas fa-expand text-xs"></i>
              Launch Scanner
            </button>
          </div>
        </div>
      </section>

      {/* Role Selection Section */}
      <section className="px-8 mt-10">
        <h3 className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-[0.3em] mb-6 px-2">Operational Identity</h3>
        <div className="grid grid-cols-2 gap-4">
          {personas.map((p) => (
            <button
              key={p.id}
              onClick={() => setPersona(p.id)}
              className={`p-5 rounded-3xl border-2 transition-all flex flex-col items-start text-left gap-4 active:scale-95 ${
                persona === p.id 
                  ? 'border-[var(--accent)] bg-[var(--accent)] bg-opacity-5 shadow-inner' 
                  : 'border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--text-dim)] shadow-sm'
              }`}
            >
              <div className={`w-10 h-10 ${persona === p.id ? 'bg-[var(--accent)] text-[var(--bg-primary)]' : 'bg-[var(--bg-primary)] text-[var(--text-dim)]'} rounded-2xl flex items-center justify-center text-sm shadow-md transition-colors`}>
                <i className={`fas ${p.icon}`}></i>
              </div>
              <div>
                <p className={`font-black uppercase tracking-tighter text-xs ${persona === p.id ? 'text-[var(--accent)]' : 'text-[var(--text-main)]'}`}>
                  {p.id}
                </p>
                <p className="text-[8px] font-bold text-[var(--text-dim)] uppercase tracking-widest mt-1">{p.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Tools Section */}
      <section className="p-8 space-y-4">
        <h3 className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-[0.3em] mb-4 px-2">Protocols</h3>
        
        <div 
          onClick={() => setView(AppView.MARKETPLACE)}
          className="bg-[var(--bg-secondary)] p-6 rounded-[2rem] shadow-sm border border-[var(--border)] flex items-center gap-6 cursor-pointer hover:border-[var(--accent)] transition-all active:scale-[0.98] group"
        >
          <div className="w-14 h-14 bg-[var(--bg-primary)] text-[var(--accent)] border border-[var(--border)] rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            <i className="fas fa-shopping-bag"></i>
          </div>
          <div className="flex-1">
            <h4 className="font-black text-[var(--text-main)] uppercase tracking-tighter text-sm">Theme Nexus</h4>
            <p className="text-[9px] text-[var(--text-dim)] font-black uppercase tracking-widest mt-1">Download External Visuals</p>
          </div>
          <i className="fas fa-chevron-right text-[var(--border)]"></i>
        </div>

        <div 
          onClick={() => setView(AppView.VIDEO)}
          className="bg-[var(--bg-secondary)] p-6 rounded-[2rem] shadow-sm border border-[var(--border)] flex items-center gap-6 cursor-pointer hover:border-[var(--accent)] transition-all active:scale-[0.98] group"
        >
          <div className="w-14 h-14 bg-[var(--bg-primary)] text-orange-500 border border-[var(--border)] rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            <i className="fas fa-video"></i>
          </div>
          <div className="flex-1">
            <h4 className="font-black text-[var(--text-main)] uppercase tracking-tighter text-sm">Live Field Sweep</h4>
            <p className="text-[9px] text-[var(--text-dim)] font-black uppercase tracking-widest mt-1">Continuous Garden Monitoring</p>
          </div>
          <i className="fas fa-chevron-right text-[var(--border)]"></i>
        </div>

        <div 
          onClick={() => setView(AppView.ADMIN)}
          className="bg-[var(--bg-primary)] p-6 rounded-[2rem] shadow-2xl border border-[var(--accent)] border-opacity-20 flex items-center gap-6 cursor-pointer hover:bg-opacity-80 transition-all active:scale-[0.98] group"
        >
          <div className="w-14 h-14 bg-[var(--accent)] bg-opacity-10 text-[var(--accent)] rounded-2xl flex items-center justify-center text-xl">
            <i className="fas fa-microchip"></i>
          </div>
          <div className="flex-1">
            <h4 className="font-black uppercase tracking-tighter text-sm text-[var(--text-main)]">BOT-X Dashboard</h4>
            <p className="text-[9px] text-[var(--accent)] font-black uppercase tracking-widest mt-1">Autonomous Storage Management</p>
          </div>
          <i className="fas fa-chevron-right text-[var(--accent)]"></i>
        </div>
      </section>

      <footer className="p-12 text-center">
        <p className="text-[8px] font-black text-[var(--text-dim)] uppercase tracking-[0.4em]">Botanica Intel Core • Active Protocol v5.0</p>
      </footer>
    </div>
  );
};

export default Home;
