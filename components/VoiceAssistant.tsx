
import React, { useState, useRef, useEffect } from 'react';
import { getGeminiClient } from '../services/geminiService';
import { Modality, LiveServerMessage } from '@google/genai';
import { encode, decode, decodeAudioData } from '../utils/audio';
import { db } from '../services/dbService';
import { Language, LANGUAGES, UI_TRANSLATIONS, UserPersona, AnalysisResult } from '../types';

interface VoiceAssistantProps {
  language: Language;
  persona: UserPersona;
  referencedSpecimen?: AnalysisResult | null;
}

const FRAME_RATE = 1; 
const JPEG_QUALITY = 0.6;

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ language, persona, referencedSpecimen }) => {
  const t = UI_TRANSLATIONS[language];
  const langName = LANGUAGES[language].name;
  const [isActive, setIsActive] = useState(false);
  const [transcripts, setTranscripts] = useState<{role: 'user' | 'model', text: string, id: number}[]>([]);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening'>('idle');

  const sessionRef = useRef<any>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameIntervalRef = useRef<number | null>(null);

  const startSession = async () => {
    if (status !== 'idle') return;
    setStatus('connecting');
    
    try {
      const ai = getGeminiClient();
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      await inputCtx.resume();
      await outputCtx.resume();

      inputAudioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: { facingMode: 'environment', width: 640, height: 480 } 
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      
      let systemInstruction = `You are a professional agricultural expert. The user is a ${persona}. Focus on removal protocols and soil safety. Respond in ${langName}.`;
      
      if (referencedSpecimen) {
        systemInstruction += `\n\nCONTEXTUAL SPECIMEN DATA:
        The user is asking about: ${referencedSpecimen.plantName} (${referencedSpecimen.scientificName}).
        Management protocol already suggested: ${referencedSpecimen.treatmentProtocol}.
        Original Confidence: ${Math.round(referencedSpecimen.confidence * 100)}%.
        Explain the removal steps in plain language to the farmer.`;
      }

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('listening');
            setIsActive(true);
            
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              
              sessionPromise.then(s => {
                s.sendRealtimeInput({ media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);

            frameIntervalRef.current = window.setInterval(() => {
              if (!videoRef.current || !canvasRef.current) return;
              const canvas = canvasRef.current;
              const ctx = canvas.getContext('2d');
              canvas.width = 320;
              canvas.height = 240;
              ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
              const base64Data = canvas.toDataURL('image/jpeg', JPEG_QUALITY).split(',')[1];
              
              sessionPromise.then(s => { 
                s.sendRealtimeInput({ media: { data: base64Data, mimeType: 'image/jpeg' } }); 
              });
            }, 1000 / FRAME_RATE);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.serverContent?.outputTranscription) setTranscripts(p => [...p, { role: 'model', text: msg.serverContent!.outputTranscription!.text, id: Date.now() }]);
            if (msg.serverContent?.inputTranscription) setTranscripts(p => [...p, { role: 'user', text: msg.serverContent!.inputTranscription!.text, id: Date.now() }]);
            
            const interrupted = msg.serverContent?.interrupted;
            if (interrupted) {
              for (const source of sourcesRef.current.values()) {
                try { source.stop(); } catch(e) {}
                sourcesRef.current.delete(source);
              }
              nextStartTimeRef.current = 0;
            }

            const audioBase64 = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioBase64 && outputCtx.state !== 'closed') {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const buffer = await decodeAudioData(decode(audioBase64), outputCtx, 24000, 1);
              const src = outputCtx.createBufferSource();
              src.buffer = buffer;
              src.connect(outputCtx.destination);
              
              src.addEventListener('ended', () => {
                sourcesRef.current.delete(src);
              });

              src.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              // Fix: Access .current on sourcesRef to call add on the Set
              sourcesRef.current.add(src);
            }
          },
          onerror: (err) => {
            console.error("Live session error:", err);
            // Fix: Using logEvent with 'error' type as logError does not exist in dbService
            db.logEvent("Live Session", "Real-time connection failed.", "error");
            cleanup();
          },
          onclose: () => cleanup()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          // Fix: Enabled transcriptions in the config
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          systemInstruction: systemInstruction
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) { 
      console.error(e);
      cleanup(); 
    }
  };

  const cleanup = async () => {
    setIsActive(false);
    setStatus('idle');
    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (sessionRef.current) try { sessionRef.current.close(); } catch(e) {}
    
    for (const source of sourcesRef.current.values()) {
      try { source.stop(); } catch(e) {}
      sourcesRef.current.delete(source);
    }
    nextStartTimeRef.current = 0;
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 font-mono text-yellow-500">
      <div className="relative w-full aspect-video bg-black overflow-hidden shadow-2xl border-b border-yellow-500/20">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover brightness-50" />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* HUD Overlay */}
        <div className="absolute inset-0 pointer-events-none p-4">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded border border-yellow-500/20 backdrop-blur-md">
                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`}></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">{status}</span>
                </div>
                {referencedSpecimen && (
                  <div className="bg-yellow-500 text-slate-950 px-3 py-1 rounded font-black text-[9px] uppercase tracking-widest animate-pulse">
                    Expert Focus: {referencedSpecimen.plantName}
                  </div>
                )}
            </div>
        </div>

        {!isActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm p-12 text-center">
            <i className="fas fa-satellite-dish text-yellow-500/40 text-4xl mb-4"></i>
            <h3 className="text-yellow-500 font-black uppercase tracking-tighter text-lg mb-2">Live Expert Consultation</h3>
            <p className="text-yellow-500/60 text-[10px] font-bold mb-8 leading-relaxed max-w-[260px]">
              {referencedSpecimen 
                ? `Discussing ${referencedSpecimen.plantName}. Experts are ready to walk you through the protocol.`
                : "Real-time field intelligence with voice and vision analysis."}
            </p>
            <button 
              onClick={startSession} 
              className="bg-yellow-500 text-slate-950 px-10 py-4 font-black uppercase tracking-widest text-[11px] shadow-2xl active:scale-95 transition-all"
            >
              Initialize Uplink
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
        {transcripts.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-yellow-500/20 gap-4 py-20">
            <i className="fas fa-wave-square text-3xl"></i>
            <p className="text-[9px] font-black uppercase tracking-widest text-center px-12 leading-relaxed">
              Uplink established. Speak to ask about management steps or identification results.
            </p>
          </div>
        )}
        {transcripts.map(t => (
          <div key={t.id} className={`flex flex-col ${t.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] px-5 py-3 border text-[11px] leading-relaxed ${t.role === 'user' ? 'bg-slate-900 border-yellow-500/20 text-yellow-500' : 'bg-black border-yellow-500/50 text-yellow-400'}`}>
              <span className="block text-[7px] font-black uppercase tracking-widest mb-1 opacity-40">{t.role}</span>
              {t.text}
            </div>
          </div>
        ))}
      </div>
      
      {isActive && (
        <div className="p-6 bg-slate-900 border-t border-yellow-500/10">
            <button onClick={cleanup} className="w-full bg-red-950/20 text-red-500 py-4 font-black uppercase tracking-widest text-[10px] border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">
                Terminate Link
            </button>
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;
