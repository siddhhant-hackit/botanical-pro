
import React, { useState, useEffect } from 'react';
import { db } from '../services/dbService';

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState(db.getMetrics());
  const [logs, setLogs] = useState(db.getLogs());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(db.getMetrics());
      setLogs(db.getLogs());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6 animate-in fade-in pb-24 bg-slate-950 min-h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 text-2xl shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <i className="fas fa-microchip"></i>
          </div>
          <div>
            <h2 className="text-xl font-black uppercase text-white leading-none tracking-tighter italic">Chaos Lab</h2>
            <p className="text-[8px] font-black opacity-40 uppercase tracking-[0.3em] mt-1 text-emerald-500">Telemetry Node active</p>
          </div>
        </div>
        <button 
          onClick={() => db.exportMissionData()}
          className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-500 transition-colors shadow-lg active:scale-95"
          title="Download Mission Data"
        >
          <i className="fas fa-download"></i>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 p-5 rounded-[2rem] border border-slate-800 shadow-xl">
          <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">Storage Density</p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-2xl font-black text-white">{metrics.storageUsage.toFixed(1)}</h3>
            <span className="text-[9px] font-black text-emerald-500">KB</span>
          </div>
        </div>
        <div className="bg-slate-900 p-5 rounded-[2rem] border border-slate-800 shadow-xl">
          <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">Bio-Signatures</p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-2xl font-black text-white">{metrics.historySize}</h3>
            <span className="text-[9px] font-black text-emerald-500">UNITS</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="bg-slate-800/50 p-4 border-b border-slate-700 flex justify-between items-center">
          <h3 className="text-[10px] font-black uppercase text-emerald-500 tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            Mission Event Log
          </h3>
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">v9.0 Telemetry</span>
        </div>
        
        <div className="max-h-[300px] overflow-y-auto p-4 space-y-2 font-mono text-[9px] custom-scrollbar">
          {logs.length === 0 ? (
            <p className="text-slate-700 italic py-10 text-center">No telemetry data recorded yet.</p>
          ) : (
            logs.map((log: any) => (
              <div key={log.id} className={`p-2 rounded border-l-2 ${log.type === 'error' ? 'bg-red-500/5 border-red-500/40 text-red-400' : 'bg-black/20 border-emerald-500/20 text-slate-400'}`}>
                <div className="flex justify-between opacity-40 mb-1">
                  <span className="font-black">[{log.context}]</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="leading-tight font-bold">{log.message}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-emerald-600/5 p-8 rounded-[2.5rem] border border-emerald-500/10 text-center">
        <i className="fas fa-vial text-emerald-500/20 text-4xl mb-4"></i>
        <h4 className="text-[10px] font-black uppercase text-emerald-500 mb-2 tracking-widest">Chaos Engineering Protocol</h4>
        <p className="text-[10px] font-bold text-slate-500 leading-relaxed italic px-4">
          Capture "live examples" by identifying plants in varying conditions. Use the export tool to review how the Neural Link classifies confidence and manages the management protocol JSON.
        </p>
      </div>

      <button 
        onClick={() => { localStorage.clear(); window.location.reload(); }}
        className="w-full py-4 border border-red-500/20 text-red-500/50 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95"
      >
        Factory Reset Hub
      </button>
    </div>
  );
};

export default AdminDashboard;
