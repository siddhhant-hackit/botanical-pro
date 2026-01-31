
import React from 'react';
import { AppView, UserProfile, AnalysisResult } from '../types';

interface HomeViewProps {
  profile: UserProfile;
  history: AnalysisResult[];
  onNavigate: (v: AppView) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ profile, history, onNavigate }) => {
  const latestScan = history[0];
  const scanCount = history.length;
  
  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col gap-1 mt-2">
        <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-none">
          Namaste, <span className="text-emerald-500">{profile.name}</span>
        </h2>
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
          Node Status: Operational Hub
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] flex flex-col justify-between shadow-xl">
          <p className="text-[8px] font-black uppercase text-slate-600 tracking-widest">Audits</p>
          <h3 className="text-3xl font-black text-white mt-2">{scanCount}</h3>
        </div>
        <div className="bg-emerald-500 p-6 rounded-[2.5rem] flex flex-col justify-between shadow-lg shadow-emerald-500/10">
          <p className="text-[8px] font-black uppercase text-slate-900/60 tracking-widest">Local Rate</p>
          <h3 className="text-xl font-black text-slate-950 mt-2 truncate">
            {profile.location.symbol}{profile.location.rate}
          </h3>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Primary Controls</h3>
        </div>
        <button 
          onClick={() => onNavigate(AppView.AUDIT)}
          className="w-full bg-slate-900 border border-emerald-500/20 p-8 rounded-[3rem] flex items-center gap-6 group hover:border-emerald-500 transition-all shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner border border-emerald-500/20 group-hover:scale-110 transition-transform">
            <i className="fas fa-camera text-2xl"></i>
          </div>
          <div className="text-left relative z-10">
            <h4 className="text-lg font-black uppercase tracking-tighter text-white">Capture Bio-Signature</h4>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Satellite Grounded identification</p>
          </div>
          <i className="fas fa-arrow-right ml-auto text-emerald-500/40"></i>
        </button>

        <div className="grid grid-cols-2 gap-4">
           <button 
            onClick={() => onNavigate(AppView.VALUE)}
            className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex flex-col items-center gap-3 active:scale-95 transition-all shadow-lg hover:border-emerald-500/30"
          >
            <i className="fas fa-chart-line text-emerald-500"></i>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Market Value</span>
          </button>
          <button 
            onClick={() => onNavigate(AppView.EXPERT)}
            className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex flex-col items-center gap-3 active:scale-95 transition-all shadow-lg hover:border-emerald-500/30"
          >
            <i className="fas fa-user-md text-emerald-500"></i>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Expert Hub</span>
          </button>
        </div>
      </section>

      {latestScan && (
        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Recent Bio-Signature</h3>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center justify-between shadow-lg">
            <div>
              <h4 className="text-[11px] font-black uppercase text-emerald-400">{latestScan.plantName}</h4>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Audit Code: #{latestScan.id.split('_')[1].slice(-4)}</p>
            </div>
            <div className={`px-2 py-1 rounded text-[7px] font-black uppercase ${latestScan.isWeed ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
              {latestScan.isWeed ? 'Hazard' : 'Asset'}
            </div>
          </div>
        </section>
      )}

      <footer className="py-12 text-center">
        <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.4em]">Botanica Pro Core • Active Network v16</p>
      </footer>
    </div>
  );
};

export default HomeView;
