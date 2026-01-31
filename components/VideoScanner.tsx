
import React, { useState, useRef } from 'react';
import { getGeminiClient } from '../services/geminiService';
import { Language, UI_TRANSLATIONS, UserPersona } from '../types';
import { Type } from '@google/genai';

interface WeedReport {
  name: string;
  scientificName: string;
  risk: string;
  details: string;
  removal: string;
}

interface VideoScannerProps {
  language: Language;
  persona: UserPersona;
}

const VideoScanner: React.FC<VideoScannerProps> = ({ language, persona }) => {
  const t = UI_TRANSLATIONS[language];
  const [video, setVideo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<WeedReport[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fix: Added proper file reading and passing to analysis
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideo(URL.createObjectURL(file));
      const reader = new FileReader();
      reader.onload = async () => {
        const b64 = (reader.result as string).split(',')[1];
        analyzeGardenVideo(b64, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fix: Updated analyzeGardenVideo to accept multimodal video data
  const analyzeGardenVideo = async (videoBase64: string, mimeType: string) => {
    setLoading(true);
    setReports([]);
    setSummary(null);
    
    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
          parts: [
            { inlineData: { data: videoBase64, mimeType: mimeType } },
            { text: `Perform a precision field audit of this video. Identify visible species and provide strategic advice for a ${persona}.` }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reports: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    scientificName: { type: Type.STRING },
                    risk: { type: Type.STRING, description: 'High/Medium/Low' },
                    details: { type: Type.STRING },
                    removal: { type: Type.STRING }
                  },
                  required: ["name", "scientificName", "risk", "details", "removal"]
                }
              },
              summary: { type: Type.STRING }
            },
            required: ["reports", "summary"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      setReports(data.reports || []);
      setSummary(data.summary || null);
    } catch (error) {
      console.error(error);
      setSummary("Audit encountered a vision processing error. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 flex flex-col gap-6 bg-slate-50 min-h-full">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">{t.video_title}</h2>
        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{persona} Mode Active</p>
      </div>

      <div className="bg-slate-900 rounded-[2rem] aspect-video flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
        {video ? (
          <video src={video} controls className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-4 text-slate-500 text-center">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center animate-pulse">
              <i className="fas fa-video text-3xl text-slate-600"></i>
            </div>
            <p className="font-bold text-[10px] uppercase tracking-widest opacity-60">Upload Field Footage</p>
          </div>
        )}
        <input type="file" accept="video/*" capture="environment" className="absolute inset-0 opacity-0 cursor-pointer z-10" ref={fileInputRef} onChange={handleVideoUpload} />
      </div>

      {loading && (
        <div className="bg-white p-8 rounded-3xl flex flex-col items-center gap-6 animate-pulse">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-800 font-black uppercase tracking-tighter text-lg">{t.analyzing}</p>
        </div>
      )}

      {(reports.length > 0 || summary) && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6">
          {reports.map((report, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                  report.risk === 'High' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                }`}>{report.risk} Priority</span>
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">{report.name}</h3>
              <p className="text-xs italic text-slate-400 font-medium mb-4">{report.scientificName}</p>
              <div className="space-y-3">
                <p className="text-sm text-slate-600 leading-relaxed">{report.details}</p>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs font-black text-slate-800 uppercase tracking-widest mb-2">Management Strategy</p>
                  <p className="text-sm text-slate-700 font-medium leading-relaxed">{report.removal}</p>
                </div>
              </div>
            </div>
          ))}

          {summary && (
            <div className="bg-emerald-900 text-emerald-50 p-8 rounded-[2.5rem] shadow-xl">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-4">{t.deep_report}</h3>
              <p className="text-lg leading-relaxed font-medium text-emerald-100/90">{summary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoScanner;
