
import React, { useState, useEffect } from 'react';
import { AppView, UserPersona, AnalysisResult, UserProfile } from './types';
import { getEnvironmentMode, fetchMarketContext } from './services/envService';
import HomeView from './components/HomeView';
import Scanner from './components/Scanner';
import NetworkDashboard from './components/NetworkDashboard';
import ExpertConsultant from './components/ExpertConsultant';
import History from './components/History';
import Sidebar from './components/Sidebar';
import AdminDashboard from './components/AdminDashboard';
import ThemeMarketplace from './components/ThemeMarketplace';
import VideoScanner from './components/VideoScanner';
import Report from './components/Report';

export default function App() {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [signal, setSignal] = useState(4);

  useEffect(() => {
    const saved = localStorage.getItem('botanica_pro_v16');
    if (saved) {
      const parsed = JSON.parse(saved);
      setProfile(parsed.profile);
      setHistory(parsed.history || []);
    }
    
    const signalInterval = setInterval(() => {
        setSignal(Math.floor(Math.random() * 2) + 3); // Simulate field fluctuation
    }, 5000);
    return () => clearInterval(signalInterval);
  }, []);

  const saveState = (p: UserProfile, h: AnalysisResult[]) => {
    localStorage.setItem('botanica_pro_v16', JSON.stringify({ profile: p, history: h }));
  };

  const onLogin = async (name: string, persona: UserPersona) => {
    const env = getEnvironmentMode();
    const loc = await fetchMarketContext();
    const newProfile = { name, persona, env, location: loc };
    setProfile(newProfile);
    saveState(newProfile, history);
  };

  if (!profile) return <LoginView onLogin={onLogin} />;

  return (
    <div className="h-screen bg-slate-950 text-slate-200 flex flex-col font-sans max-w-md mx-auto overflow-hidden border-x border-slate-900 relative">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        profile={profile}
      />

      <header className="p-4 bg-slate-900/95 backdrop-blur-xl border-b border-emerald-500/10 flex justify-between items-center z-40">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 flex items-center justify-center text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-colors"
          >
            <i className="fas fa-bars text-lg"></i>
          </button>
          <div className="flex flex-col">
            <h1 className="text-xs font-black uppercase tracking-[0.2em] italic text-emerald-400">Botanica Pro</h1>
            <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest leading-none">Intelligence Hub</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex gap-0.5 items-end h-3">
            {[1,2,3,4,5].map(b => (
                <div key={b} className={`w-0.5 rounded-full ${b <= signal ? 'bg-emerald-500' : 'bg-slate-800'}`} style={{ height: `${b * 20}%` }}></div>
            ))}
          </div>
          <div className="text-[7px] font-black px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/20 uppercase">
            {profile.env}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-950">
        {view === AppView.HOME && <HomeView profile={profile} history={history} onNavigate={(v) => setView(v)} />}
        {view === AppView.AUDIT && (
          <Scanner 
            language="en" 
            persona={profile.persona} 
            onConsult={(r) => {
              const newHist = [r, ...history];
              setHistory(newHist);
              saveState(profile, newHist);
              setView(AppView.EXPERT);
            }} 
          />
        )}
        {view === AppView.VALUE && <NetworkDashboard />}
        {view === AppView.EXPERT && <ExpertConsultant language="en" persona={profile.persona} referencedSpecimen={history[0]} />}
        {view === AppView.ARCHIVE && <History language="en" onConsult={() => setView(AppView.EXPERT)} />}
        {view === AppView.ADMIN && <AdminDashboard />}
        {view === AppView.MARKETPLACE && <ThemeMarketplace current="emerald" onInstall={() => {}} />}
        {view === AppView.VIDEO && <VideoScanner language="en" persona={profile.persona} />}
      </main>

      <nav className="h-20 bg-slate-900/98 border-t border-emerald-500/10 grid grid-cols-5 items-center px-1 z-40 backdrop-blur-md">
        {[
          { id: AppView.HOME, label: 'Home', icon: 'fa-home' },
          { id: AppView.AUDIT, label: 'Audit', icon: 'fa-camera' },
          { id: AppView.VALUE, label: 'Value', icon: 'fa-chart-line' },
          { id: AppView.EXPERT, label: 'Expert', icon: 'fa-user-md' },
          { id: AppView.ADMIN, label: 'Lab', icon: 'fa-flask' }
        ].map((btn) => (
          <button 
            key={btn.id} 
            onClick={() => setView(btn.id)}
            className={`flex flex-col items-center gap-1 transition-all ${view === btn.id ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <i className={`fas ${btn.icon} text-sm`}></i>
            <span className="text-[8px] font-black uppercase tracking-widest">{btn.label}</span>
          </button>
        ))}
      </nav>
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 0; }`}</style>
    </div>
  );
}

function LoginView({ onLogin }: { onLogin: (n: string, p: UserPersona) => void }) {
  const [name, setName] = useState('');
  const [persona, setPersona] = useState<UserPersona>('farmer');
  return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-center p-12 text-center overflow-y-auto">
      <div className="w-20 h-20 bg-emerald-500 rounded-3xl mb-8 flex items-center justify-center text-slate-950 font-black text-3xl shadow-2xl shadow-emerald-500/20">B</div>
      <h1 className="text-2xl font-black uppercase tracking-tighter mb-2 italic text-white">Botanica Pro</h1>
      <p className="text-slate-500 text-[9px] uppercase tracking-[0.3em] mb-10">Agricultural Intelligence System</p>
      
      <div className="w-full space-y-4">
        <div className="text-left space-y-2">
          <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">Identity Name</label>
          <input 
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-emerald-500 transition-all placeholder:text-slate-700" 
            placeholder="Operator Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
        </div>
        
        <div className="text-left space-y-2">
          <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">Select Persona</label>
          <div className="grid grid-cols-3 gap-2">
            {(['farmer', 'student', 'researcher'] as UserPersona[]).map((p) => (
              <button 
                key={p} 
                onClick={() => setPersona(p)}
                className={`py-3 rounded-xl text-[8px] font-black uppercase border transition-all ${persona === p ? 'bg-emerald-500 border-emerald-500 text-slate-950 shadow-lg' : 'border-slate-800 text-slate-500 hover:border-slate-600'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={() => onLogin(name, persona)} 
          className="w-full mt-6 bg-emerald-500 text-slate-950 py-5 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all shadow-emerald-500/10"
        >
          Initialize Mission
        </button>
      </div>
    </div>
  );
}
