import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useSpellbook } from '../../hooks/useSpellbook';
import { useSlots } from '../../hooks/useSlots';
import spellsData from '../../data/spells-5e2024.json';
import type { AppState, Profile, Spellbook, Spell, ClassEntry } from '../../types/spellbook';
import type { Action } from '../../hooks/useSpellbook';
import type { SlotSummary } from '../../hooks/useSlots';
import ProfileBar from './ProfileBar';
import SlotTracker from './SlotTracker';
import BrowseToggle from './BrowseToggle';
import SpellList from './SpellList';

const EMPTY_CLASS_ENTRIES: ClassEntry[] = [];

export interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  activeProfile: Profile | undefined;
  activeSpellbook: Spellbook | undefined;
  slots: SlotSummary;
  allSpells: Spell[];
  selectedSpellId: string | null;
  setSelectedSpellId: (id: string | null) => void;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  browseMode: 'mine' | 'all';
  setBrowseMode: (mode: 'mine' | 'all') => void;
}

export const AppContext = React.createContext<AppContextValue>(null!);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within SpellbookApp');
  return ctx;
}

export default function SpellbookApp() {
  const { state, dispatch } = useSpellbook();
  const activeProfile = state.profiles.find(p => p.id === state.activeProfileId);
  const activeSpellbook = activeProfile?.spellbooks.find(sb => sb.id === activeProfile.activeSpellbookId);
  const slots = useSlots(activeProfile?.classEntries ?? EMPTY_CLASS_ENTRIES);
  const allSpells = spellsData as Spell[];

  const [selectedSpellId, setSelectedSpellId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [browseMode, setBrowseMode] = useState<'mine' | 'all'>('mine');

  useEffect(() => {
    if (state.profiles.length === 0) setSettingsOpen(true);
  }, [state.profiles.length]);

  const contextValue: AppContextValue = useMemo(() => ({
    state, dispatch, activeProfile, activeSpellbook, slots, allSpells,
    selectedSpellId, setSelectedSpellId,
    settingsOpen, setSettingsOpen,
    browseMode, setBrowseMode,
  }), [state, dispatch, activeProfile, activeSpellbook, slots, selectedSpellId, settingsOpen, browseMode]);

  return (
    <AppContext.Provider value={contextValue}>
      <div className="flex flex-col min-h-screen font-lora" style={{ backgroundColor: 'var(--sp-pink-pale)' }}>
        <ProfileBar />

        <SlotTracker />

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--sp-pink-soft)', backgroundColor: 'var(--sp-cream)' }}>
            <BrowseToggle />
          </div>
          <SpellList />
        </main>

        {/* SettingsPanel placeholder (overlay) */}
        {settingsOpen && (
          <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSettingsOpen(false)}>
            <div className="w-80 h-full p-4 shadow-lg" style={{ backgroundColor: 'var(--sp-cream)' }} onClick={e => e.stopPropagation()}>
              <div style={{ color: 'var(--sp-plum)' }}>SettingsPanel placeholder</div>
              <button onClick={() => setSettingsOpen(false)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </AppContext.Provider>
  );
}
