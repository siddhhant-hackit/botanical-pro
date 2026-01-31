
import React, { useState, useEffect } from 'react';
import { UserPersona, Language } from '../types';

interface TutorialProps {
  persona: UserPersona;
  language: Language;
  onComplete: (prefs: { languageComfort: 'english' | 'hindi' | 'hinglish' }) => void;
}

const NexusTutorial: React.FC<TutorialProps> = ({ persona, language, onComplete }) => {
  const [step, setStep] = useState(-1); // -1 is the initial language check
  const [text, setText] = useState('');
  const [selectedLang, setSelectedLang] = useState<'english' | 'hindi' | 'hinglish'>('english');
  
  const content = {
    farmer: [
      { t: "Namaste! Main aapka Botanical Assistant hoon.", sub: "Setting up tools for your farm." },
      { t: "Identify button se photo kheench kar khet ki samasya jaan sakte hain.", sub: "Just snap a photo of any suspicious weed." },
      { t: "Ye app 'Offline' mode mein bhi kaam karega jab signal kam ho.", sub: "Perfect for field work in remote areas." }
    ],
    student: [
      { t: "Nexus Intelligence Layer Initialized.", sub: "Connecting to global botanical datasets." },
      { t: "The vision scanner performs multi-modal analysis on plant morphology.", sub: "Ideal for lab or field taxonomy projects." },
      { t: "Data is auto-pruned every 30 days for efficiency.", sub: "Focus on your current semester data." }
    ],
    researcher: [
      { t: "Uplink Secure. High-precision mode active.", sub: "Preparing specimen analytics dashboard." },
      { t: "AI optimization is running in the background to save CPU cycles.", sub: "Clean datasets with satellite grounding." }
    ],
    teacher: [
      { t: "Classroom environment ready.", sub: "Educational summaries are prioritized." },
      { t: "Use the 'Consult' link for real-time Q&A with students.", sub: "Simplified explanations for complex botany." }
    ]
  };

  const currentSteps = content[persona] || content.student;

  useEffect(() => {
    if (step < 0) return;
    let i = 0;
    const fullText = currentSteps[step]?.t || '';
    setText('');
    const interval = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [step, persona]);

  if (step === -1) {
    return (
      <div className="fixed inset-0 z-[100] bg-[var(--bg-primary)] flex items-center justify-center p-8">
        <div className="max-w-sm w-full bg-[var(--bg-secondary)] border-2 border-[var(--accent)] rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-500">
          <div className="w-12 h-1 bg-[var(--accent)] mb-6 rounded-full opacity-40"></div>
          <h2 className="text-xl font-black uppercase tracking-tighter text-[var(--accent)] mb-4">Choose Your Language</h2>
          <p className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest mb-8 leading-relaxed">
            Choose what you understand best to customize your tutorial.
          </p>
          
          <div className="space-y-3">
            {[
              { id: 'english', l: 'Pure English' },
              { id: 'hindi', l: 'शुद्ध हिन्दी (Hindi)' },
              { id: 'hinglish', l: 'Mix (Hindi + English)' }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setSelectedLang(opt.id as any)}
                className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                  selectedLang === opt.id ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--bg-primary)]' : 'border-[var(--border)] text-[var(--text-dim)]'
                }`}
              >
                {opt.l}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setStep(0)}
            className="w-full mt-8 bg-[var(--text-main)] text-[var(--bg-primary)] py-5 rounded-3xl font-black uppercase tracking-widest text-[11px] shadow-xl active:scale-95 hover:brightness-110 transition-all"
          >
            Confirm & Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[var(--bg-primary)] flex items-center justify-center p-8">
      <div className="max-w-sm w-full bg-[var(--bg-secondary)] border-2 border-[var(--accent)] rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
        {/* Game-like progress indicators */}
        <div className="absolute top-4 right-8 flex gap-1">
          {currentSteps.map((_, i) => (
            <div key={i} className={`h-1 w-4 rounded-full ${i <= step ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}></div>
          ))}
        </div>

        <div className="w-16 h-1 bg-[var(--accent)] mb-8 rounded-full opacity-20"></div>
        
        <div className="min-h-[120px] mb-8">
          <h2 className="text-lg font-black uppercase tracking-tighter text-[var(--accent)] leading-tight mb-4">
            {text}<span className="animate-pulse inline-block w-2 h-5 bg-[var(--accent)] ml-1 align-middle"></span>
          </h2>
          <p className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest leading-relaxed">
            {currentSteps[step]?.sub}
          </p>
        </div>

        <button 
          onClick={() => step < currentSteps.length - 1 ? setStep(step + 1) : onComplete({ languageComfort: selectedLang })}
          className="w-full bg-[var(--accent)] text-[var(--bg-primary)] py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {step === currentSteps.length - 1 ? 'Start Mission' : 'Next Intelligence'}
          <i className="fas fa-chevron-right text-[8px]"></i>
        </button>
      </div>
    </div>
  );
};

export default NexusTutorial;
