
import React, { useState, useEffect } from 'react';

/**
 * STARTUP CHECK (v6.1)
 * A "One-to-Check" verification system that ensures the app's 
 * critical hardware and software links are functional.
 */
interface StartupCheckProps {
  onComplete: () => void;
}

const StartupCheck: React.FC<StartupCheckProps> = ({ onComplete }) => {
  const [checks, setChecks] = useState({
    storage: 'pending',
    vision: 'pending',
    link: 'pending',
    theme: 'pending'
  });

  const runVerification = async () => {
    // Reset states
    setChecks({ storage: 'checking', vision: 'checking', link: 'checking', theme: 'checking' });

    // 1. Storage Verification (One-to-check persistence)
    try {
      localStorage.setItem('health_test', 'ok');
      localStorage.removeItem('health_test');
      setTimeout(() => setChecks(c => ({ ...c, storage: 'active' })), 400);
    } catch (e) { setChecks(c => ({ ...c, storage: 'failed' })); }

    // 2. Optic Sensor Verification (One-to-check camera)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(t => t.stop());
      setTimeout(() => setChecks(c => ({ ...c, vision: 'active' })), 800);
    } catch (e) { setChecks(c => ({ ...c, vision: 'failed' })); }

    // 3. Database Density Verification
    const size = JSON.stringify(localStorage).length;
    setTimeout(() => setChecks(c => ({ ...c, link: size < 4000000 ? 'active' : 'warning' })), 1200);

    // 4. CSS Variable Engine Verification
    const hasStyles = !!getComputedStyle(document.documentElement).getPropertyValue('--bg-primary');
    setTimeout(() => setChecks(c => ({ ...c, theme: hasStyles ? 'active' : 'failed' })), 600);
  };

  useEffect(() => {
    runVerification();
  }, []);

  const allPassed = checks.storage === 'active' && checks.vision === 'active';

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center p-8">
      <div className="max-w-xs w-full bg-slate-900 border-2 border-emerald-500/20 rounded-[3rem] p-10 shadow-2xl text-center">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] mx-auto flex items-center justify-center text-emerald-500 mb-8 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
          <i className="fas fa-shield-virus text-2xl animate-pulse"></i>
        </div>
        
        <h2 className="text-2xl font-black uppercase text-white mb-2 tracking-tighter italic">One-Check</h2>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Verification Protocol</p>
        
        <div className="space-y-3 mb-10">
          {[
            { id: 'storage', label: 'Persistence Link', state: checks.storage },
            { id: 'vision', label: 'Visual Sensors', state: checks.vision },
            { id: 'theme', label: 'UI Style Engine', state: checks.theme },
            { id: 'link', label: 'Data Density', state: checks.link }
          ].map(item => (
            <div key={item.id} className="flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/5">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
              <span className={`text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 rounded shadow-sm transition-colors ${
                item.state === 'active' ? 'bg-emerald-500 text-white' : 
                item.state === 'failed' ? 'bg-red-500 text-white' : 
                item.state === 'warning' ? 'bg-orange-500 text-white' : 
                'bg-slate-800 text-slate-500 animate-pulse'
              }`}>
                {item.state}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={onComplete}
            disabled={!allPassed}
            className="w-full bg-emerald-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-[11px] disabled:opacity-30 active:scale-95 transition-all shadow-xl shadow-emerald-900/20"
          >
            Enter Mission Space
          </button>
          <button 
            onClick={runVerification}
            className="text-[9px] font-black text-slate-500 uppercase tracking-widest py-2 hover:text-emerald-500 transition-colors"
          >
            Re-run System Scan
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartupCheck;
