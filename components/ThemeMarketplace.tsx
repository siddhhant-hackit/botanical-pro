
import React from 'react';
// Corrected import: ThemeType should be imported from types.ts
import { ThemeType } from '../types';
import { themes } from '../services/themeService';

interface ThemeMarketplaceProps {
  onInstall: (t: ThemeType) => void;
  current: ThemeType;
}

const ThemeMarketplace: React.FC<ThemeMarketplaceProps> = ({ onInstall, current }) => {
  const storeThemes = [
    { id: 'cyber', label: 'Cyber Prairie', icon: 'fa-microchip', price: 'Free', creator: 'Nexus Labs', color: '#00ff41' },
    { id: 'zen', label: 'Zen Garden', icon: 'fa-spa', price: '$2.99', creator: 'Organic UI', color: '#ecfdf5' },
    { id: 'neon', label: 'Midnight Neon', icon: 'fa-bolt', price: 'Pre-installed', creator: 'System', color: '#d946ef' },
    { id: 'harvest', label: 'Autumn Harvest', icon: 'fa-tractor', price: 'Pre-installed', creator: 'System', color: '#f59e0b' }
  ];

  return (
    <div className="p-6 space-y-8 animate-in slide-in-from-right-8 pb-24">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-black uppercase text-[var(--text-main)] tracking-tighter italic">Nexus Store</h2>
        <p className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest">Download external vision filters</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {storeThemes.map(t => (
          <div key={t.id} className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[2rem] p-6 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-lg" style={{backgroundColor: t.color, color: '#000'}}>
                  <i className={`fas ${t.icon}`}></i>
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase text-[var(--text-main)] tracking-tight">{t.label}</h3>
                  <p className="text-[8px] font-bold text-[var(--text-dim)] uppercase tracking-widest">By {t.creator}</p>
                </div>
              </div>
              <span className="text-[9px] font-black uppercase px-2 py-1 bg-[var(--accent)] bg-opacity-10 text-[var(--accent)] rounded border border-[var(--accent)] border-opacity-20">
                {t.price}
              </span>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => onInstall(t.id as any)}
                className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  current === t.id 
                  ? 'bg-[var(--accent)] text-[var(--bg-primary)]' 
                  : 'bg-[var(--bg-primary)] text-[var(--text-main)] border border-[var(--border)]'
                }`}
              >
                {current === t.id ? 'Active Theme' : 'Deploy Protocol'}
              </button>
              <button className="w-12 h-12 flex items-center justify-center text-[var(--text-dim)] hover:text-[var(--text-main)]">
                <i className="fas fa-external-link-alt text-xs"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[var(--bg-primary)] p-6 rounded-3xl border-2 border-dashed border-[var(--border)] text-center flex flex-col items-center gap-3">
        <div className="w-10 h-10 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center text-[var(--text-dim)]">
          <i className="fas fa-plus"></i>
        </div>
        <p className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest">Submit Theme to Marketplace</p>
        <p className="text-[8px] text-[var(--text-dim)] opacity-40">Developer SDK v5.0 required</p>
      </div>
    </div>
  );
};

export default ThemeMarketplace;
