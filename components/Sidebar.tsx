
import React from 'react';
import { UserProfile } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, profile }) => {
  return (
    <>
      <div className={`fixed inset-0 bg-black/90 backdrop-blur-md z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>
      <aside className={`fixed top-0 left-0 bottom-0 w-80 bg-slate-950 border-r border-emerald-500/10 z-[70] transform transition-transform duration-500 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-10 border-b border-emerald-500/10 bg-slate-900/50">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-slate-950 font-black text-2xl mb-8 shadow-2xl shadow-emerald-500/20">B</div>
          <h2 className="text-xl font-black uppercase tracking-tighter text-white">Botanica Pro</h2>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Intelligence Layer v16.0</p>
        </div>

        <nav className="flex-1 p-8 space-y-8 overflow-y-auto">
          <section className="space-y-4">
            <h3 className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-600 px-2">Operator Profile</h3>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-500/20"><i className="fas fa-fingerprint"></i></div>
              <div className="overflow-hidden">
                <p className="text-[11px] font-black uppercase text-white truncate">{profile.name}</p>
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest italic">{profile.persona} Class</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-600 px-2">Mission Parameters</h3>
            <div className="p-5 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-4">
              <p className="text-[10px] font-bold text-slate-400 leading-relaxed italic">Botanica Pro provides precision agricultural bio-signature analysis. We utilize grounded satellite logic to identify weed hazards and calculate market asset value across global hubs.</p>
              <div className="flex gap-2">
                <div className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[7px] font-black uppercase rounded border border-emerald-500/20">{profile.location.city}</div>
                <div className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[7px] font-black uppercase rounded border border-emerald-500/20">{profile.location.currency}</div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
             <h3 className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-600 px-2">Security Hub</h3>
             <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[8px] font-black uppercase text-emerald-500 tracking-widest">Privacy Shield</span>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                </div>
                <p className="text-[7px] font-bold text-slate-500 uppercase leading-relaxed tracking-wider">Mission sessions are strictly local. Cloud uplink is disabled for privacy.</p>
             </div>
          </section>
        </nav>

        <div className="p-8 border-t border-slate-900">
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full bg-slate-950 border border-red-500/20 text-red-500 py-4 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all shadow-xl active:scale-95">Purge Mission Memory</button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
