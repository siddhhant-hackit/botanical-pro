
import React, { useState, useEffect } from 'react';
import { getEnvironmentContext, EXCHANGE_RATES } from '../services/envService';
import Icon from './Icon';

const NetworkDashboard: React.FC = () => {
  const [env, setEnv] = useState<any>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'INR' | 'SAR' | 'EUR'>('USD');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getEnvironmentContext().then(data => {
      setEnv(data);
      if (data.currencyCode) setSelectedCurrency(data.currencyCode as any);
    });
  }, []);

  const handleLocationSearch = async () => {
    if (!search.trim()) return;
    const data = await getEnvironmentContext(); // Mock logic for simplicity
    setEnv(data);
  };

  if (!env) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Syncing Market Nodes...</p>
    </div>
  );

  const baseValueUSD = 1500 + (env.hardwareNodes * 120);
  const getVal = (curr: string) => (baseValueUSD * EXCHANGE_RATES[curr]).toLocaleString(undefined, { maximumFractionDigits: 0 });
  const currentSymbol = selectedCurrency === 'INR' ? '₹' : (selectedCurrency === 'SAR' ? 'SR' : (selectedCurrency === 'EUR' ? '€' : '$'));

  return (
    <div className="p-6 space-y-6 pb-24 animate-in fade-in">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black uppercase text-emerald-400 tracking-tighter italic leading-none">Market Value</h2>
        <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
          Venture Node: {env.location.city}, {env.location.country}
        </div>
      </div>

      <div className="bg-slate-900 p-2 rounded-2xl border border-slate-800 flex gap-2">
        <input 
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleLocationSearch(); }}
          placeholder="Switch Region Hub..."
          className="flex-1 bg-transparent px-4 py-2 text-[10px] text-white font-bold outline-none placeholder:text-slate-700 uppercase"
        />
        <button onClick={handleLocationSearch} className="bg-emerald-500 text-slate-950 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95">
          Sync
        </button>
      </div>

      <div className="bg-emerald-600 p-8 rounded-[3rem] text-slate-950 shadow-2xl relative overflow-hidden group">
        <Icon name="network" className="absolute -bottom-8 -right-8 w-40 h-40 opacity-10" />
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Asset Valuation</p>
        <h3 className="text-4xl font-black tracking-tighter flex items-baseline gap-2">
          {currentSymbol}{getVal(selectedCurrency)} 
          <span className="text-xs opacity-50 font-black">{selectedCurrency}</span>
        </h3>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] shadow-xl">
        <h4 className="text-[9px] font-black uppercase text-emerald-500 mb-6 tracking-widest flex items-center gap-2">
          <Icon name="network" className="w-3 h-3" /> Competitive Index
        </h4>
        <div className="space-y-4">
          {[
            { name: 'PictureThis', status: 'Saturated' },
            { name: 'PlantSnap', status: 'Monetized' }
          ].map((c) => (
            <div key={c.name} className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <p className="text-[11px] font-black text-white uppercase">{c.name}</p>
                <p className="text-[7px] text-slate-600 font-bold uppercase tracking-widest">{c.status}</p>
              </div>
            </div>
          ))}
          
          <div className="pt-2">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-3xl flex items-center justify-between shadow-inner">
              <div className="flex-1">
                <p className="text-[11px] font-black text-emerald-400 uppercase">Botanica Pro</p>
                <p className="text-[8px] text-emerald-500/70 font-black uppercase tracking-[0.2em] mt-1.5">Leader in Field Intelligence</p>
              </div>
              <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg">
                <i className="fas fa-crown text-sm"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkDashboard;
