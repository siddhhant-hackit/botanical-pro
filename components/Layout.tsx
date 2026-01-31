
import React from 'react';
import { AppView, Language } from '../types';
import Icon from './Icon';

interface LayoutProps {
  children: React.ReactNode;
  activeView: AppView;
  setView: (v: AppView) => void;
  language: Language;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, setView }) => {
  const nav = [
    { view: AppView.HOME, icon: 'home', label: 'Nodes' },
    { view: AppView.SCANNER, icon: 'camera', label: 'Scanner' },
    { view: AppView.HISTORY, icon: 'book', label: 'Archive' },
    { view: AppView.NETWORK, icon: 'network', label: 'Market' },
    { view: AppView.ADMIN, icon: 'admin', label: 'System' }
  ];

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col max-w-md mx-auto relative overflow-hidden font-sans border-x border-slate-900 shadow-2xl">
      <header className="p-5 flex items-center justify-between border-b border-emerald-900/30 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-slate-950 shadow-lg">
            <Icon name="leaf" className="w-4 h-4" />
          </div>
          <h1 className="font-black tracking-tighter uppercase text-emerald-400">Venture Intelligence</h1>
        </div>
        <div className="text-[9px] font-black px-2 py-1 bg-emerald-900/20 text-emerald-500 border border-emerald-500/20 rounded">
          v9.0 GLOBAL
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 custom-scrollbar bg-slate-950">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-950/95 backdrop-blur-xl border-t border-emerald-900/30 grid grid-cols-5 h-20 items-center px-4 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {nav.map(item => (
          <button
            key={item.view}
            onClick={() => setView(item.view)}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              activeView === item.view ? 'text-emerald-400 scale-110' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Icon name={item.icon as any} className="w-5 h-5" />
            <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #065f46; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Layout;
