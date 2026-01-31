
import React, { useState, useRef } from 'react';
import { performBotanicalAudit } from '../services/geminiService';
import { AnalysisResult, UserPersona, LocationData } from '../types';
import { db } from '../services/dbService';
import Icon from './Icon';

interface ScannerProps {
  language: string;
  persona: UserPersona;
  onConsult: (s: AnalysisResult) => void;
}

const Scanner: React.FC<ScannerProps> = ({ language, persona, onConsult }) => {
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Initializing Sensors...');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setResult(null);
    setLoadingMsg("Acquiring Vision...");
    db.logEvent("SENSOR", `Input file detected: ${file.name} (${file.type})`);
    
    const startTime = Date.now();
    const reader = new FileReader();
    reader.onload = async () => {
      const b64 = (reader.result as string).split(',')[1];
      try {
        setLoadingMsg("Grounded Multi-Node Verification...");
        const genericLoc: LocationData = { city: 'Field Node', country: 'Local Network', currency: 'INR', symbol: '₹', rate: 83.5 };
        const res = await performBotanicalAudit(b64, persona, genericLoc);
        
        const duration = Date.now() - startTime;
        db.logEvent("NEURAL", `Audit complete in ${duration}ms. Confidence: ${res.verificationAccuracy}%`);
        db.addHistory(res);
        
        setLoadingMsg("Synthesizing Report...");
        setResult(res);
      } catch (err: any) { 
        db.logEvent("NEURAL", `Audit failed: ${err.message}`, "error");
        alert("Verification Uplink Failed. Check network."); 
      } finally { 
        setLoading(false); 
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-6 space-y-6 pb-24 animate-in fade-in">
      <div 
        onClick={() => fileRef.current?.click()} 
        className="aspect-square bg-slate-900 border-2 border-dashed border-emerald-500/10 rounded-[3rem] flex flex-col items-center justify-center gap-4 cursor-pointer relative overflow-hidden group shadow-2xl transition-all hover:border-emerald-500/40"
      >
        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-all border border-slate-800 shadow-xl">
          <Icon name="camera" className="w-10 h-10" />
        </div>
        <div className="text-center z-10 px-8">
          <p className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.3em]">Capture Bio-Signature</p>
          <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mt-1">Grounded Satellite Grounding</p>
        </div>
        
        {loading && (
          <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-6 z-50 text-center px-12 backdrop-blur-sm">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest animate-pulse">{loadingMsg}</p>
          </div>
        )}
      </div>
      <input type="file" ref={fileRef} className="hidden" accept="image/*" capture="environment" onChange={processFile} />

      {result && (
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1 pr-4">
              <h2 className="text-2xl font-black text-emerald-400 uppercase tracking-tighter leading-none">{result.plantName}</h2>
              <p className="text-[10px] font-bold italic text-slate-500 mt-2">{result.scientificName}</p>
            </div>
            <div className={`shrink-0 px-3 py-1.5 rounded-full text-[8px] font-black uppercase border ${result.isWeed ? 'text-red-500 border-red-500/20 bg-red-500/5' : 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5'}`}>
              {result.isWeed ? 'Hazard' : 'Asset'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-black/40 border border-slate-800 p-4 rounded-2xl">
               <p className="text-[7px] font-black uppercase text-slate-600 tracking-widest mb-1">Verify Rate</p>
               <h4 className="text-lg font-black text-emerald-400">{result.verificationAccuracy}%</h4>
            </div>
            <div className="bg-black/40 border border-slate-800 p-4 rounded-2xl">
               <p className="text-[7px] font-black uppercase text-slate-600 tracking-widest mb-1">Market Price</p>
               <h4 className="text-lg font-black text-white">{result.localPrice}</h4>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed mb-8">{result.description}</p>

          <div className="bg-emerald-600 text-slate-950 p-6 rounded-3xl shadow-xl mb-8 border-l-8 border-black/10">
            <h4 className="text-[9px] font-black uppercase mb-4 flex items-center gap-2 tracking-widest text-slate-900">
              <Icon name="shield" className="w-3 h-3" /> Management Protocol
            </h4>
            <div className="space-y-3">
              {result.treatmentProtocol.map((line, idx) => (
                <p key={idx} className="text-[10px] font-bold leading-relaxed text-slate-900">• {line}</p>
              ))}
            </div>
          </div>

          <button 
            onClick={() => onConsult(result)} 
            className="w-full bg-white text-slate-950 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 shadow-lg transition-all"
          >
            Neural Expert Consult
          </button>
        </div>
      )}
    </div>
  );
};

export default Scanner;
