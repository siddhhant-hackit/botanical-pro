
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, UserPersona, LocationData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Adding getGeminiClient export for centralized AI instance access
export const getGeminiClient = () => ai;

// Adding analyzeSpecimen export as an alias for performBotanicalAudit with legacy signature support
export const analyzeSpecimen = (base64: string, _language: string, persona: UserPersona, _mode: string): Promise<AnalysisResult> => {
  // Mapping the legacy signature to the unified performBotanicalAudit logic
  return performBotanicalAudit(base64, persona, { 
    city: 'Current Hub', 
    country: 'Local Network', 
    currency: 'INR', 
    symbol: '₹', 
    rate: 83.5 
  });
};

export const performBotanicalAudit = async (
  base64: string,
  persona: UserPersona,
  loc: LocationData
): Promise<AnalysisResult> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64, mimeType: 'image/jpeg' } },
        { text: `Identify plant. Context: ${persona} in ${loc.city}. Ground with Google Search. Output JSON.` }
      ]
    },
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          scientific: { type: Type.STRING },
          isWeed: { type: Type.BOOLEAN },
          confidence: { type: Type.NUMBER },
          localPrice: { type: Type.STRING },
          description: { type: Type.STRING },
          protocol: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["name", "scientific", "isWeed", "confidence", "localPrice", "description", "protocol"]
      }
    }
  });

  const data = JSON.parse(response.text || '{}');
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter((c: any) => c.web)
    ?.map((c: any) => ({ title: c.web.title, uri: c.web.uri })) || [];

  // Mapping result properties to satisfy naming variations used across components
  return {
    ...data,
    id: `scan_${Date.now()}`,
    timestamp: Date.now(),
    sources,
    plantName: data.name || "Unknown Specimen",
    scientificName: data.scientific || "Unknown Scientific Name",
    verificationAccuracy: Math.round((data.confidence || 0) * 100),
    estimatedSeedPrice: data.localPrice || "Calculating...",
    treatmentProtocol: data.protocol || []
  };
};

export const getLiveAdvisor = () => ai;
