
import React, { useState, useEffect } from 'react';
import { AnalysisResult } from '../types';

interface HistoryProps {
  language: string;
  onConsult: (s: AnalysisResult) => void;
}

const History: React.FC<HistoryProps> = ({ language, onConsult }) => {
  const [items, setItems] = useState<AnalysisResult[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('botanica_pro_v15_state');
    if (saved) setItems(JSON.parse(saved).history || []);
  }, []);

  return (
    <div className="p-6 space-y-6 pb-24">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <h2 className="text-xl font-black uppercase tracking-tighter text-emerald-500 italic">Specimen Index</h2>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Archive</span>
      </div>

      {items.length === 0 ? (
        <div className="py-24 text-center opacity-10">
          <i className="fas fa-archive text-5xl mb-4"></i>
          <p className="text-[10px] font-black uppercase tracking-widest">Index Node Empty</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <button 
              key={item.id} 
              onClick={() => onConsult(item)}
              className="w-full text-left bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-sm hover:border-emerald-500/30 transition-all active:scale-95 group"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-sm font-black uppercase text-white tracking-tight leading-none mb-1 group-hover:text-emerald-400 transition-colors">{item.plantName}</h4>
                  <p className="text-[9px] font-bold text-slate-500 uppercase italic tracking-widest">{item.scientificName}</p>
                </div>
                <div className={`px-2 py-1 rounded text-[7px] font-black uppercase ${item.isWeed ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                  {item.isWeed ? 'Hazard' : 'Asset'}
                </div>
              </div>
              <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-4">
                Captured: {new Date(item.timestamp).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
