
export type UserPersona = 'farmer' | 'student' | 'researcher' | 'teacher';
export type ConnectivityMode = 'STANDALONE' | 'LOCAL' | 'ONLINE' | 'APP' | 'STABLE';
export type Language = 'en' | 'hi';
export type ThemeType = 'emerald' | 'harvest' | 'frost' | 'neon' | 'classic' | 'cyber' | 'zen';

export enum AppView {
  HOME = 'home',
  AUDIT = 'audit',
  VALUE = 'value',
  EXPERT = 'expert',
  ARCHIVE = 'archive',
  SCANNER = 'scanner',
  HISTORY = 'history',
  NETWORK = 'network',
  ADMIN = 'admin',
  MARKETPLACE = 'marketplace',
  VIDEO = 'video'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export interface LocationData {
  city: string;
  country: string;
  currency: string;
  symbol: string;
  rate: number;
}

export interface AnalysisResult {
  id: string;
  plantName: string;
  scientificName: string;
  isWeed: boolean;
  confidence: number;
  verificationAccuracy: number;
  localPrice: string;
  description: string;
  treatmentProtocol: string[];
  timestamp: number;
  sources?: { title: string; uri: string }[];
}

export interface UserProfile {
  id?: string;
  name: string;
  persona: UserPersona;
  env: ConnectivityMode;
  location: LocationData;
  lastActive?: number;
  theme?: ThemeType;
  languageMix?: 'pure' | 'mixed';
  tutorialComplete?: boolean;
  joinDate?: number;
}

export const LANGUAGES: Record<Language, { name: string }> = {
  en: { name: 'English' },
  hi: { name: 'Hindi' }
};

export const UI_TRANSLATIONS: Record<Language, any> = {
  en: {
    student: 'Student',
    farmer: 'Farmer',
    researcher: 'Researcher',
    teacher: 'Teacher',
    video_title: 'Field Audit',
    analyzing: 'Analyzing Video...',
    deep_report: 'Final Analysis'
  },
  hi: {
    student: 'छात्र',
    farmer: 'किसान',
    researcher: 'शोधकर्ता',
    teacher: 'शिक्षक',
    video_title: 'क्षेत्र लेखा परीक्षा',
    analyzing: 'वीडियो विश्लेषण...',
    deep_report: 'अंतिम विश्लेषण'
  }
};
