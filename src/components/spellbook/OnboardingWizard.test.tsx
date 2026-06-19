import { render, screen } from '@testing-library/react';
import { AppContext } from './SpellbookApp';
import type { AppContextValue } from './SpellbookApp';
import OnboardingWizard from './OnboardingWizard';

const ctx: AppContextValue = {
  state: { profiles: [], activeProfileId: '' },
  dispatch: vi.fn(),
  activeProfile: undefined,
  activeSpellbook: undefined,
  slots: { casterLevel: 0, regularSlots: {}, pactMagic: null, arcanumLevels: [] },
  allSpells: [],
  selectedSpellId: null, setSelectedSpellId: vi.fn(),
  settingsOpen: false, setSettingsOpen: vi.fn(),
  browseMode: 'mine', setBrowseMode: vi.fn(),
  profBonus: 0, saveDC: 8, spellAttack: 0,
  preparedSet: new Set(),
  visualSettings: { theme: 'auto', density: 'cozy', background: 'clouds' },
  setTheme: vi.fn(), setDensity: vi.fn(), setBackground: vi.fn(),
  toast: null, showToast: vi.fn(),
};

it('shows the 3-step feature list on the Step 0 welcome screen', () => {
  render(
    <AppContext.Provider value={ctx}>
      <OnboardingWizard onComplete={vi.fn()} />
    </AppContext.Provider>
  );
  expect(screen.getByText('Name your character')).toBeInTheDocument();
  expect(screen.getByText('Choose class & level')).toBeInTheDocument();
  expect(screen.getByText('Enter the grimoire')).toBeInTheDocument();
});
