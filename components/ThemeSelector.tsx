
import React from 'react';
// Corrected import: ThemeType should be imported from types.ts
import { ThemeType } from '../types';
import { themes } from '../services/themeService';

interface ThemeSelectorProps {
  current: ThemeType;
  onSelect: (t: ThemeType) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ current, onSelect }) => {
  const themeList: { id: ThemeType; label: string; icon: string }[] = [
    { id: 'emerald', label: 'Emerald Field', icon: 'fa-leaf' },
    { id: 'harvest', label: 'Autumn Harvest', icon: 'fa-tractor' },
    { id: 'frost', label: 'Academic Frost', icon: 'fa-snowflake' },
    { id: 'neon', label: 'Midnight Neon', icon: 'fa-bolt' },
    { id: 'classic', label: 'Classic Botany', icon: 'fa-book-open' }
  ];

  return (
    <div className="grid grid-cols-1 gap-3 p-6">
      <h3 className="text-[10px] font-black uppercase text-[var(--text-dim)] tracking-[0.2em] mb-2 px-2">Visual Interface</h3>
      {themeList.map(t => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          className={`flex items-center justify-between p-5 rounded-3xl border-2 transition-all ${
            current === t.id 
              ? 'border-[var(--accent)] bg-[var(--accent)] bg-opacity-5' 
              : 'border-[var(--border)] bg-[var(--bg-secondary)] opacity-60'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{backgroundColor: themes[t.id]['--accent'], color: themes[t.id]['--bg-primary']}}>
              <i className={`fas ${t.icon}`}></i>
            </div>
            <span className="text-[11px] font-black uppercase tracking-tight text-[var(--text-main)]">{t.label}</span>
          </div>
          {current === t.id && <i className="fas fa-check-circle text-[var(--accent)]"></i>}
        </button>
      ))}
    </div>
  );
};

export default ThemeSelector;
