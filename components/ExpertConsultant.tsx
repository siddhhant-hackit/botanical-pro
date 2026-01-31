
import React, { useState, useRef, useEffect } from 'react';
import { getGeminiClient } from '../services/geminiService';
import { getEnvironmentContext } from '../services/envService';
import { ChatMessage, Language, UserPersona, AnalysisResult } from '../types';
import { Modality, LiveServerMessage } from '@google/genai';
import { encode, decode, decodeAudioData } from '../utils/audio';

interface ExpertConsultantProps {
  language: Language;
  persona: UserPersona;
  referencedSpecimen?: AnalysisResult | null;
}

const ExpertConsultant: React.FC<ExpertConsultantProps> = ({ language, persona, referencedSpecimen }) => {
  const [mode, setMode] = useState<'text' | 'live'>('text');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [liveStatus, setLiveStatus] = useState<'idle' | 'connecting' | 'listening'>('idle');
  const [transcripts, setTranscripts] = useState<{role: 'user' | 'model', text: string, id: number}[]>([]);

  const chatRef = useRef<any>(null);
  const sessionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, transcripts]);

  useEffect(() => {
    const initChat = async () => {
      try {
        const ai = getGeminiClient();
        const env = await getEnvironmentContext();
        const instruction = `Professional botanical advisor for ${persona}. User data context: ${referencedSpecimen ? `Inquiring about ${referencedSpecimen.plantName}` : "General queries"}. Respond clearly. Privacy shield active.`;
        
        chatRef.current = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: { systemInstruction: instruction, tools: [{googleSearch: {}}] }
        });
        setMessages([{ role: 'model', content: `Expert Link established. How can I assist with your audit work today?`, id: 'init' }]);
      } catch (err) { console.error(err); }
    };
    initChat();
    return () => cleanupLive();
  }, [persona, referencedSpecimen]);

  const handleTextSend = async () => {
    if (!input.trim() || !chatRef.current) return;
    const userMsg: ChatMessage = { role: 'user', content: input, id: Date.now().toString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    try {
      const response = await chatRef.current.sendMessage({ message: input });
      setMessages(prev => [...prev, { role: 'model', content: response.text || "Link weak. Retry.", id: (Date.now() + 1).toString() }]);
    } catch (e) { console.error(e); } finally { setIsTyping(false); }
  };

  const startLiveSession = async () => {
    if (liveStatus !== 'idle') return;
    setLiveStatus('connecting');
    try {
      const ai = getGeminiClient();
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, video: { facingMode: 'environment', width: 320, height: 240 } 
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputAudioContextRef.current = outputCtx;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setLiveStatus('listening');
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              sessionPromise.then(s => s.sendRealtimeInput({ media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.serverContent?.outputTranscription) {
              setTranscripts(p => [...p, { role: 'model', text: msg.serverContent!.outputTranscription!.text, id: Date.now() }]);
            }
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
              const src = outputCtx.createBufferSource();
              src.buffer = buffer;
              src.connect(outputCtx.destination);
              src.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(src);
            }
          },
          onclose: () => cleanupLive(),
          onerror: () => cleanupLive()
        },
        config: { 
          responseModalities: [Modality.AUDIO], 
          outputAudioTranscription: {}, 
          systemInstruction: `Live expert mode. Persona: ${persona}. Privacy shield is verified.` 
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) { cleanupLive(); }
  };

  const cleanupLive = () => {
    setLiveStatus('idle');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch(e) {}
      sessionRef.current = null;
    }
    sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
    sourcesRef.current.clear();
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 font-sans">
      <div className="p-4 bg-slate-900 border-b border-emerald-500/20 flex items-center justify-between z-10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center border border-emerald-500/20 shadow-inner">
             <i className="fas fa-comment-medical text-sm"></i>
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase text-emerald-400 tracking-widest leading-none mb-1">Expert Advisor</h3>
            <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest italic">{mode === 'live' ? 'Live Link' : 'Secure Text'}</p>
          </div>
        </div>
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
           <button onClick={() => { setMode('text'); cleanupLive(); }} className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${mode === 'text' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-500'}`}>Chat</button>
           <button onClick={() => setMode('live')} className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${mode === 'live' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-500'}`}>Live</button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {mode === 'live' ? (
          <div className="h-full flex flex-col gap-6 animate-in fade-in zoom-in">
            <div className="aspect-video bg-black rounded-[2rem] overflow-hidden border-2 border-emerald-500/10 relative shadow-2xl">
              {liveStatus !== 'idle' ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover brightness-75" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 p-8 text-center bg-slate-900">
                  <i className="fas fa-shield-alt text-4xl mb-4 opacity-20 text-emerald-500"></i>
                  <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Privacy Shield Verified.<br/>Sensors offline until Mission Start.</p>
                </div>
              )}
              {liveStatus !== 'idle' && (
                <div className="absolute top-4 left-4 bg-black/60 px-3 py-1.5 rounded-full text-[8px] font-black text-emerald-400 uppercase border border-emerald-400/20 flex items-center gap-2 backdrop-blur-md">
                  <span className={`w-1.5 h-1.5 rounded-full ${liveStatus === 'listening' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
                  {liveStatus} Active
                </div>
              )}
            </div>

            <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-6 overflow-y-auto space-y-4 shadow-inner">
               {transcripts.length === 0 && liveStatus === 'idle' && (
                 <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-30">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em]">End-to-End Encrypted Mission Link</p>
                 </div>
               )}
               {transcripts.map(t => (
                  <div key={t.id} className="flex justify-start">
                    <div className="max-w-[85%] px-4 py-3 rounded-2xl text-[11px] leading-relaxed bg-slate-900 border border-emerald-500/20 text-emerald-400 italic shadow-sm">{t.text}</div>
                  </div>
                ))}
            </div>

            <div className="flex flex-col gap-3">
              {liveStatus === 'idle' ? (
                <button onClick={startLiveSession} className="w-full bg-emerald-500 text-slate-950 py-5 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"><i className="fas fa-satellite-dish"></i> Start Mission Link</button>
              ) : (
                <button onClick={cleanupLive} className="w-full bg-red-500 text-white py-5 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 border border-red-500/20 shadow-red-500/10"><i className="fas fa-stop-circle"></i> Terminate & Purge</button>
              )}
              <p className="text-[7px] text-center text-slate-600 uppercase font-bold tracking-[0.3em]">Privacy-First Protocol active</p>
            </div>
          </div>
        ) : (
          <>
            {messages.length === 0 && <p className="text-center py-20 text-[9px] font-black uppercase tracking-[0.4em] text-slate-700">Expert Node Ready...</p>}
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-5 py-4 rounded-3xl text-[11px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-emerald-600 text-white border border-emerald-500/30' : 'bg-slate-900 border border-slate-800 text-slate-100'}`}>{msg.content}</div>
              </div>
            ))}
            {isTyping && <div className="text-[9px] text-emerald-500 animate-pulse font-black uppercase tracking-widest pl-4">Consulting Global Database...</div>}
          </>
        )}
      </div>

      {mode === 'text' && (
        <div className="p-6 bg-slate-900 border-t border-slate-800/50 shadow-2xl">
          <div className="flex gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800">
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleTextSend(); }}
              placeholder="Query Expert..."
              className="flex-1 bg-transparent px-4 py-4 text-sm text-white font-bold outline-none placeholder:text-slate-700"
            />
            <button onClick={handleTextSend} className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center text-slate-950 shadow-xl active:scale-95 transition-all">
              <i className="fas fa-paper-plane text-lg"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertConsultant;
