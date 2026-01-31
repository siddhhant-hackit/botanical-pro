
import { ThemeType } from '../types';

export const themes: Record<ThemeType, Record<string, string>> = {
  emerald: {
    '--bg-primary': '#020617',
    '--bg-secondary': '#0f172a',
    '--accent': '#10b981',
    '--text-main': '#f1f5f9',
    '--text-dim': '#94a3b8',
    '--border': '#064e3b',
    '--active-glow': '0 0 15px rgba(16, 185, 129, 0.4)'
  },
  harvest: {
    '--bg-primary': '#1c1917',
    '--bg-secondary': '#292524',
    '--accent': '#f59e0b',
    '--text-main': '#fafaf9',
    '--text-dim': '#a8a29e',
    '--border': '#78350f',
    '--active-glow': '0 0 15px rgba(245, 158, 11, 0.4)'
  },
  frost: {
    '--bg-primary': '#f8fafc',
    '--bg-secondary': '#ffffff',
    '--accent': '#3b82f6',
    '--text-main': '#0f172a',
    '--text-dim': '#64748b',
    '--border': '#e2e8f0',
    '--active-glow': '0 0 15px rgba(59, 130, 246, 0.3)'
  },
  neon: {
    '--bg-primary': '#000000',
    '--bg-secondary': '#0a0a0a',
    '--accent': '#d946ef',
    '--text-main': '#ffffff',
    '--text-dim': '#707070',
    '--border': '#4a044e',
    '--active-glow': '0 0 20px rgba(217, 70, 239, 0.6)'
  },
  classic: {
    '--bg-primary': '#fdfbf7',
    '--bg-secondary': '#f7f2e9',
    '--accent': '#166534',
    '--text-main': '#1a2e05',
    '--text-dim': '#71717a',
    '--border': '#dcfce7',
    '--active-glow': '0 0 12px rgba(22, 101, 52, 0.2)'
  },
  cyber: {
    '--bg-primary': '#000000',
    '--bg-secondary': '#0c0c0c',
    '--accent': '#00ff41',
    '--text-main': '#00ff41',
    '--text-dim': '#008f11',
    '--border': '#003b00',
    '--active-glow': '0 0 20px rgba(0, 255, 65, 0.5)'
  },
  zen: {
    '--bg-primary': '#ecfdf5',
    '--bg-secondary': '#ffffff',
    '--accent': '#10b981',
    '--text-main': '#064e3b',
    '--text-dim': '#64748b',
    '--border': '#d1fae5',
    '--active-glow': '0 0 10px rgba(16, 185, 129, 0.2)'
  }
};

export const applyTheme = (theme: ThemeType) => {
  const root = document.documentElement;
  const variables = themes[theme] || themes.emerald;
  
  const hour = new Date().getHours();
  const isNight = hour < 6 || hour > 18;
  
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  if (isNight) {
    root.style.setProperty('--night-tint', 'rgba(20, 20, 50, 0.15)');
    root.style.filter = 'sepia(0.1) contrast(0.95)';
  } else {
    root.style.setProperty('--night-tint', 'transparent');
    root.style.filter = 'none';
  }
};
