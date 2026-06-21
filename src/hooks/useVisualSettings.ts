import { useState, useEffect } from 'react';

export interface VisualSettings {
  theme: 'auto' | 'light' | 'dark';
  density: 'cozy' | 'compact';
  background: 'clouds' | 'starfield' | 'clean';
}

const SETTINGS_KEY = 'spellbook-settings-v1';

const defaults: VisualSettings = {
  theme: 'auto',
  density: 'cozy',
  background: 'clouds',
};

export function useVisualSettings(): {
  settings: VisualSettings;
  setTheme: (theme: VisualSettings['theme']) => void;
  setDensity: (density: VisualSettings['density']) => void;
  setBackground: (background: VisualSettings['background']) => void;
} {
  const [settings, setSettings] = useState<VisualSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    } catch {
      return defaults;
    }
  });

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (settings.theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.remove('dark', 'light');
    }
  }, [settings.theme]);

  useEffect(() => {
    document.documentElement.classList.toggle('compact', settings.density === 'compact');
  }, [settings.density]);

  return {
    settings,
    setTheme: (theme) => setSettings((s) => ({ ...s, theme })),
    setDensity: (density) => setSettings((s) => ({ ...s, density })),
    setBackground: (background) => setSettings((s) => ({ ...s, background })),
  };
}
