import React from 'react';
import { AppContext } from './SpellbookApp';
import type { AppContextValue } from './SpellbookApp';
import { createCommands } from '../../data/spellCommands';

export const DEFAULT_CONTEXT: AppContextValue = {
  state: { profiles: [], activeProfileId: '' },
  commands: createCommands(vi.fn()),
  activeProfile: undefined,
  activeSpellbook: undefined,
  slots: { casterLevel: 0, regularSlots: {}, pactMagic: null, arcanumLevels: [] },
  allSpells: [],
  selectedSpellId: null,
  setSelectedSpellId: vi.fn(),
  settingsOpen: false,
  setSettingsOpen: vi.fn(),
  browseMode: 'mine',
  setBrowseMode: vi.fn(),
  profBonus: 3,
  saveDC: 13,
  spellAttack: 5,
  preparedSet: new Set<string>(),
  visualSettings: { theme: 'auto', density: 'cozy', background: 'clouds' },
  setTheme: vi.fn(),
  setDensity: vi.fn(),
  setBackground: vi.fn(),
  toast: null,
  showToast: vi.fn(),
};

export function makeContext(overrides: Partial<AppContextValue> = {}): AppContextValue {
  return { ...DEFAULT_CONTEXT, ...overrides };
}

export function ContextWrapper({ children, overrides = {} }: { children: React.ReactNode; overrides?: Partial<AppContextValue> }) {
  return (
    <AppContext.Provider value={makeContext(overrides)}>
      {children}
    </AppContext.Provider>
  );
}
