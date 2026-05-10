import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useSpellbook } from '../../hooks/useSpellbook';
import { useSlots } from '../../hooks/useSlots';
import spellsData from '../../data/spells-5e2024.json';
import type { AppState, Profile, Spellbook, Spell } from '../../types/spellbook';
import type { Action } from '../../hooks/useSpellbook';
import type { SlotSummary } from '../../hooks/useSlots';

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
  return useContext(AppContext);
}

export default function SpellbookApp() {
  const { state, dispatch } = useSpellbook();
  const activeProfile = state.profiles.find(p => p.id === state.activeProfileId);
  const activeSpellbook = activeProfile?.spellbooks.find(sb => sb.id === activeProfile.activeSpellbookId);
  const slots = useSlots(activeProfile?.classEntries ?? []);
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
        {/* ProfileBar placeholder */}
        <header className="sticky top-0 z-10 p-4 border-b" style={{ backgroundColor: 'var(--sp-cream)', borderColor: 'var(--sp-pink-soft)' }}>
          <div style={{ color: 'var(--sp-plum)' }} className="font-cinzel font-bold">🌙 Spellbook — ProfileBar</div>
        </header>

        {/* SlotTracker placeholder */}
        <section className="p-4 overflow-x-auto" style={{ backgroundColor: 'var(--sp-cream)' }}>
          <div style={{ color: 'var(--sp-plum)' }}>SlotTracker placeholder</div>
        </section>

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* BrowseToggle + SpellList placeholder */}
          <div className="p-4" style={{ color: 'var(--sp-plum)' }}>SpellList placeholder</div>
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
