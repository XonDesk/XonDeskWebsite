import { render, screen, fireEvent } from '@testing-library/react';
import { AppContext } from './SpellbookApp';
import type { AppContextValue } from './SpellbookApp';
import ProfileBar from './ProfileBar';

function renderWithContext(contextOverrides: Partial<AppContextValue>) {
  const defaultContext: AppContextValue = {
    state: { profiles: [], activeProfileId: '' },
    dispatch: vi.fn(),
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
    ...contextOverrides,
  };
  return render(
    <AppContext.Provider value={defaultContext}>
      <ProfileBar />
    </AppContext.Provider>
  );
}

it('renders Spellbook title', () => {
  renderWithContext({});
  expect(screen.getByText('Spellbook')).toBeInTheDocument();
});

it('shows profile name when activeProfile exists', () => {
  renderWithContext({
    activeProfile: {
      id: 'p1',
      name: 'Ari',
      classEntries: [],
      spellbooks: [],
      activeSpellbookId: '',
      slotUsage: { regular: {}, pact: 0, arcanum: {} },
    },
  });
  expect(screen.getByText(/Ari/)).toBeInTheDocument();
});

it('shows "No profile" when no activeProfile', () => {
  renderWithContext({ activeProfile: undefined });
  expect(screen.getByText(/No profile/)).toBeInTheDocument();
});

it('clicking gear calls setSettingsOpen(true)', () => {
  const setSettingsOpen = vi.fn();
  renderWithContext({ setSettingsOpen });
  fireEvent.click(screen.getByRole('button', { name: /settings/i }));
  expect(setSettingsOpen).toHaveBeenCalledWith(true);
});

it('renders spellbook tabs for active profile', () => {
  renderWithContext({
    activeProfile: {
      id: 'p1',
      name: 'Ari',
      classEntries: [],
      spellbooks: [
        { id: 'sb1', name: 'Combat', spellIds: [] },
        { id: 'sb2', name: 'Utility', spellIds: [] },
      ],
      activeSpellbookId: 'sb1',
      slotUsage: { regular: {}, pact: 0, arcanum: {} },
    },
  });
  expect(screen.getByText('Combat')).toBeInTheDocument();
  expect(screen.getByText('Utility')).toBeInTheDocument();
});

it('clicking a spellbook tab dispatches SET_ACTIVE_SPELLBOOK', () => {
  const dispatch = vi.fn();
  renderWithContext({
    dispatch,
    activeProfile: {
      id: 'p1',
      name: 'Ari',
      classEntries: [],
      spellbooks: [
        { id: 'sb1', name: 'Combat', spellIds: [] },
        { id: 'sb2', name: 'Utility', spellIds: [] },
      ],
      activeSpellbookId: 'sb1',
      slotUsage: { regular: {}, pact: 0, arcanum: {} },
    },
  });
  fireEvent.click(screen.getByText('Utility'));
  expect(dispatch).toHaveBeenCalledWith({ type: 'SET_ACTIVE_SPELLBOOK', spellbookId: 'sb2' });
});
