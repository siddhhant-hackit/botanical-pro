
import React, { useState, useRef, useEffect } from 'react';
import { getGeminiClient } from '../services/geminiService';
import { ChatMessage, Language, LANGUAGES, UI_TRANSLATIONS, UserPersona, AnalysisResult } from '../types';

interface ChatBotProps {
  language: Language;
  persona: UserPersona;
  referencedSpecimen?: AnalysisResult | null;
  onClearContext?: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ language, persona, referencedSpecimen, onClearContext }) => {
  const t = UI_TRANSLATIONS[language];
  const langName = LANGUAGES[language].name;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const ai = getGeminiClient();
    
    let contextInstruction = `You are a professional botanical consultant for a ${persona}. Focus on agricultural science and removal safety. Respond in ${langName}.`;
    
    if (referencedSpecimen) {
      contextInstruction += `\n\nCONTEXTUAL DATA: The user is asking about a specific specimen they identified earlier:
      - Name: ${referencedSpecimen.plantName}
      - Scientific: ${referencedSpecimen.scientificName}
      - Management Already Suggested: ${referencedSpecimen.treatmentProtocol}
      - Confidence in original detection: ${referencedSpecimen.confidence}
      - User Persona: ${persona}
      
      Please analyze this specific data and explain any parts the user might not understand about the treatment protocol. Be precise.`;
    }

    chatRef.current = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: { systemInstruction: contextInstruction }
    });

    const initialMsg = referencedSpecimen 
      ? `Consultancy Uplink Active. I have reviewed your data for **${referencedSpecimen.plantName}**. How can I clarify the management protocol for you?`
      : `Botanical uplink established. ${persona} mode active. How can I assist your field work?`;

    setMessages([
      { role: 'model', content: initialMsg, id: 'initial' }
    ]);
  }, [language, langName, persona, referencedSpecimen]);

  const handleSend = async () => {
    if (!input.trim() || !chatRef.current) return;

    const userMsg: ChatMessage = { role: 'user', content: input, id: Date.now().toString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await chatRef.current.sendMessage({ message: input });
      const modelMsg: ChatMessage = { role: 'model', content: response.text || "Connection weak. Repeat query.", id: (Date.now() + 1).toString() };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: "Uplink disrupted. Try again.", id: 'err' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 font-mono text-yellow-500">
      <div className="bg-slate-900 border-b border-yellow-500/20 p-6 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-yellow-500/10 text-yellow-500 rounded border border-yellow-500/20 flex items-center justify-center">
            <i className="fas fa-headset text-sm"></i>
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Consultancy Link</h3>
            <p className="text-[8px] font-bold text-yellow-500/40 uppercase tracking-widest">{persona} Tier Expert</p>
          </div>
        </div>
        {referencedSpecimen && (
          <button 
            onClick={onClearContext}
            className="text-[8px] bg-red-950/20 text-red-500 px-2 py-1 border border-red-500/20 uppercase font-black"
          >
            End Specimen Focus
          </button>
        )}
      </div>

      {referencedSpecimen && (
        <div className="bg-yellow-500/5 border-b border-yellow-500/10 p-4 flex items-center gap-4">
          <div className="w-12 h-12 border border-yellow-500/20 overflow-hidden bg-black shrink-0">
            <div className="w-full h-full flex items-center justify-center opacity-30">
              <i className="fas fa-leaf text-xl"></i>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-[7px] font-black text-yellow-500/40 uppercase tracking-widest mb-1">Referenced Record</p>
            <h4 className="text-[10px] font-black uppercase text-yellow-500 truncate">{referencedSpecimen.plantName}</h4>
            <p className="text-[8px] italic text-yellow-500/60">{referencedSpecimen.scientificName}</p>
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] px-5 py-4 border text-[11px] leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-slate-900 border-yellow-500/20 text-yellow-500 rounded-tr-none' 
                : 'bg-black border-yellow-500/40 text-yellow-400 rounded-tl-none'
            }`}>
              <span className="block text-[7px] font-black uppercase tracking-widest mb-2 opacity-30">{msg.role}</span>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-black px-4 py-3 border border-yellow-500/20 flex gap-1 items-center">
              <span className="w-1 h-1 bg-yellow-500 rounded-full animate-pulse"></span>
              <span className="w-1 h-1 bg-yellow-500 rounded-full animate-pulse delay-75"></span>
              <span className="w-1 h-1 bg-yellow-500 rounded-full animate-pulse delay-150"></span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-900 border-t border-yellow-500/10">
        <div className="flex gap-3 bg-black p-2 border border-yellow-500/30">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Query consultant..."
            className="flex-1 bg-transparent border-none px-4 py-2 text-[10px] font-black outline-none placeholder:text-yellow-500/20 uppercase tracking-widest"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-yellow-500 text-slate-950 w-10 h-10 flex items-center justify-center active:scale-95 disabled:opacity-50 transition-all shadow-lg"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
