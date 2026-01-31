
import { AnalysisResult, UserProfile, ConnectivityMode } from '../types';

const KEYS = {
  HISTORY: 'vi_hist',
  SAVED: 'vi_lib',
  PROFILE: 'vi_prof',
  CONN: 'vi_conn',
  LOGS: 'vi_telemetry_logs'
};

const MAX_HISTORY = 30;
const MAX_LOGS = 50;

export const db = {
  init: () => {
    const now = Date.now();
    const hist = db.getHistory();
    const clean = hist.filter((i: any) => (now - i.createdAt) < (30 * 24 * 60 * 60 * 1000));
    if (clean.length !== hist.length) localStorage.setItem(KEYS.HISTORY, JSON.stringify(clean));
    db.logEvent("SYSTEM", "Mission Space Initialized");
  },

  logEvent: (context: string, message: string, type: 'info' | 'error' = 'info') => {
    const logs = JSON.parse(localStorage.getItem(KEYS.LOGS) || '[]');
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      context,
      message,
      type
    };
    const updated = [newLog, ...logs].slice(0, MAX_LOGS);
    localStorage.setItem(KEYS.LOGS, JSON.stringify(updated));
    if (type === 'error') console.error(`[${context}] ${message}`);
    else console.log(`[${context}] ${message}`);
  },

  getLogs: () => JSON.parse(localStorage.getItem(KEYS.LOGS) || '[]'),

  getConnMode: (): ConnectivityMode => (localStorage.getItem(KEYS.CONN) as any) || 'STABLE',
  setConnMode: (mode: ConnectivityMode) => {
    localStorage.setItem(KEYS.CONN, mode);
    db.logEvent("NETWORK", `Connectivity set to ${mode}`);
  },

  getProfile: (): UserProfile | null => {
    const p = localStorage.getItem(KEYS.PROFILE);
    return p ? JSON.parse(p) : null;
  },
  
  saveProfile: (p: UserProfile) => {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify({ ...p, lastActive: Date.now() }));
    db.logEvent("PROFILE", "Identity updated");
  },

  getHistory: (): AnalysisResult[] => JSON.parse(localStorage.getItem(KEYS.HISTORY) || '[]'),
  addHistory: (item: AnalysisResult) => {
    const h = [item, ...db.getHistory()].slice(0, MAX_HISTORY);
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(h));
    db.logEvent("AUDIT", `Specimen ${item.plantName} indexed`);
  },

  deleteHistory: (id: string) => {
    const filtered = db.getHistory().filter(item => item.id !== id);
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(filtered));
    db.logEvent("CLEANUP", `Record ${id} purged`);
  },

  getMetrics: () => {
    const rawString = JSON.stringify(localStorage);
    const size = rawString.length;
    const history = db.getHistory();
    return {
      storageUsage: size / 1024,
      totalUnits: history.length,
      historySize: history.length,
      health: size > 4000000 ? 'STRESS' : 'OPTIMAL' 
    };
  },

  exportMissionData: () => {
    const data = {
      profile: db.getProfile(),
      history: db.getHistory(),
      telemetry: db.getLogs(),
      exportedAt: new Date().toISOString(),
      appVersion: "9.0-CHAOS"
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `botanica_mission_data_${Date.now()}.json`;
    a.click();
    db.logEvent("SYSTEM", "Mission data exported for audit");
  }
};
