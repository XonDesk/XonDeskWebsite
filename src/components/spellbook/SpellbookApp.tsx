import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useSpellbook } from '../../hooks/useSpellbook';
import { useSlots } from '../../hooks/useSlots';
import { useVisualSettings } from '../../hooks/useVisualSettings';
import type { VisualSettings } from '../../hooks/useVisualSettings';
import spellsData from '../../data/spells-5e2024.json';
import type { AppState, Profile, Spellbook, Spell, ClassEntry } from '../../types/spellbook';
import type { Action } from '../../hooks/useSpellbook';
import type { SlotSummary } from '../../hooks/useSlots';
import ProfileBar from './ProfileBar';
import SlotTracker from './SlotTracker';
import BrowseToggle from './BrowseToggle';
import SpellList from './SpellList';
import OnboardingWizard from './OnboardingWizard';
import SettingsPanel from './SettingsPanel';
import DesktopSidebar from './DesktopSidebar';
import ConcentrationBanner from './ConcentrationBanner';
import StatReadout from './StatReadout';
import SpellbookTabs from './SpellbookTabs';
import SpellbookBackground from './SpellbookBackground';

const EMPTY_CLASS_ENTRIES: ClassEntry[] = [];
const AVATAR_HUES = [12, 200, 280, 50, 330, 130, 220, 260];

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
  profBonus: number;
  saveDC: number;
  spellAttack: number;
  preparedSet: Set<string>;
  visualSettings: VisualSettings;
  setTheme: (theme: VisualSettings['theme']) => void;
  setDensity: (density: VisualSettings['density']) => void;
  setBackground: (background: VisualSettings['background']) => void;
  toast: string | null;
  showToast: (msg: string) => void;
}

export const AppContext = React.createContext<AppContextValue>(null!);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within SpellbookApp');
  return ctx;
}

export { AVATAR_HUES };

export default function SpellbookApp() {
  const { state, dispatch } = useSpellbook();
  const { settings: visualSettings, setTheme, setDensity, setBackground } = useVisualSettings();
  const activeProfile = state.profiles.find(p => p.id === state.activeProfileId);
  const activeSpellbook = activeProfile?.spellbooks.find(sb => sb.id === activeProfile.activeSpellbookId);
  const slots = useSlots(activeProfile?.classEntries ?? EMPTY_CLASS_ENTRIES);
  const allSpells = spellsData as Spell[];

  const [selectedSpellId, setSelectedSpellId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [browseMode, setBrowseMode] = useState<'mine' | 'all'>('mine');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (state.profiles.length === 0) setWizardOpen(true);
  }, [state.profiles.length]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const primaryLevel = activeProfile?.classEntries[0]?.level ?? 1;
  const profBonus = Math.ceil(primaryLevel / 4) + 1;
  const abilityMod = activeProfile?.abilityMod ?? 0;
  const saveDC = 8 + profBonus + abilityMod;
  const spellAttack = profBonus + abilityMod;

  const preparedSet = useMemo(() => {
    const cantrips = (activeSpellbook?.spellIds ?? []).filter(id =>
      allSpells.find(s => s.id === id && s.level === 0)
    );
    return new Set([...(activeProfile?.prepared ?? []), ...cantrips]);
  }, [activeProfile?.prepared, activeSpellbook?.spellIds, allSpells]);

  const showToast = (msg: string) => setToast(msg);

  const contextValue: AppContextValue = useMemo(() => ({
    state, dispatch, activeProfile, activeSpellbook, slots, allSpells,
    selectedSpellId, setSelectedSpellId,
    settingsOpen, setSettingsOpen,
    browseMode, setBrowseMode,
    profBonus, saveDC, spellAttack, preparedSet,
    visualSettings, setTheme, setDensity, setBackground,
    toast, showToast,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [state, dispatch, activeProfile, activeSpellbook, slots, selectedSpellId, settingsOpen, browseMode,
       profBonus, saveDC, spellAttack, preparedSet, visualSettings, toast]);

  return (
    <AppContext.Provider value={contextValue}>
      <div
        className="font-inter min-h-screen lg:grid lg:grid-cols-[300px_1fr]"
        style={{
          position: 'relative',
          backgroundColor: 'var(--sp-bg)',
          ...(visualSettings.background !== 'clean' && { backgroundImage: 'var(--sp-bg-gradient)' }),
          color: 'var(--sp-text)',
        }}
      >
        <SpellbookBackground background={visualSettings.background} />
        {/* Desktop sidebar — hidden on mobile */}
        <DesktopSidebar />

        {/* Mobile header — hidden at desktop */}
        <div className="lg:hidden">
          <ProfileBar />
        </div>

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {wizardOpen ? (
            <OnboardingWizard onComplete={() => setWizardOpen(false)} />
          ) : (
            <>
              {activeProfile && (
                <div
                  className="lg:hidden"
                  style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '4px 1rem 8px' }}
                >
                  <span className="font-italianno" style={{ fontSize: '1.875rem', color: 'var(--sp-text)', lineHeight: 1 }}>
                    {activeProfile.name}
                  </span>
                  <span className="font-cormorant" style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--sp-label)' }}>
                    {activeProfile.classEntries[0]
                      ? `${activeProfile.classEntries[0].class.charAt(0).toUpperCase()}${activeProfile.classEntries[0].class.slice(1)} · Lvl ${activeProfile.classEntries[0].level}`
                      : ''}
                  </span>
                </div>
              )}
              <ConcentrationBanner />
              <div className="lg:hidden">
                <StatReadout />
                <SlotTracker />
                <SpellbookTabs variant="mobile" />
              </div>
              <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--sp-border)', backgroundColor: 'var(--sp-bg)' }}>
                <BrowseToggle />
              </div>
              <SpellList />
            </>
          )}
        </main>

        <SettingsPanel />

        {toast && (
          <div
            style={{
              position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
              background: 'var(--sp-text)', color: 'var(--sp-bg)',
              padding: '0.5rem 1.25rem', borderRadius: '2rem',
              fontSize: '0.875rem', fontWeight: 500, zIndex: 1000,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          >
            {toast}
          </div>
        )}
      </div>
    </AppContext.Provider>
  );
}
