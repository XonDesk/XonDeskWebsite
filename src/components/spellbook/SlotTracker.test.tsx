import { render, screen, fireEvent, within } from '@testing-library/react';
import { AppContext } from './SpellbookApp';
import type { AppContextValue } from './SpellbookApp';
import SlotTracker from './SlotTracker';

const wizardSlots = { casterLevel: 5, regularSlots: { 1: 4, 2: 3, 3: 2 }, pactMagic: null, arcanumLevels: [] };
const warlockSlots = { casterLevel: 0, regularSlots: {}, pactMagic: { slots: 2, slotLevel: 3 }, arcanumLevels: [] };
const emptySlots = { casterLevel: 0, regularSlots: {}, pactMagic: null, arcanumLevels: [] };

const baseProfile = {
  id: 'p1',
  name: 'Test',
  classEntries: [],
  spellbooks: [],
  activeSpellbookId: '',
  slotUsage: { regular: {}, pact: 0, arcanum: {} },
  avatarHue: 12,
  spellAbility: 'INT' as const,
  abilityMod: 0,
  prepared: [],
  favorites: [],
  concentration: null,
};

function renderWithContext(contextOverrides: Partial<AppContextValue>) {
  const defaultContext: AppContextValue = {
    state: { profiles: [], activeProfileId: '' },
    dispatch: vi.fn(),
    activeProfile: undefined,
    activeSpellbook: undefined,
    slots: emptySlots,
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
    ...contextOverrides,
  };
  return render(
    <AppContext.Provider value={defaultContext}>
      <SlotTracker />
    </AppContext.Provider>
  );
}

it('returns null when no activeProfile', () => {
  const { container } = renderWithContext({ activeProfile: undefined });
  expect(container.firstChild).toBeNull();
});

it('shows nothing (no section headings) when casterLevel=0, no pact, no arcanum', () => {
  renderWithContext({
    activeProfile: baseProfile,
    slots: emptySlots,
  });
  expect(screen.queryByText('Spell Slots')).toBeNull();
  expect(screen.queryByText('Pact Magic')).toBeNull();
  expect(screen.queryByText('Mystic Arcanum')).toBeNull();
  // New UI: header is always shown when activeProfile exists
  expect(screen.queryByText('Arcane Reserves')).toBeTruthy();
});

it('renders gem slots for wizard 5 with levels 1, 2, 3', () => {
  renderWithContext({
    activeProfile: baseProfile,
    slots: wizardSlots,
  });
  expect(screen.getByText('Arcane Reserves')).toBeInTheDocument();
  // total gems: 4 + 3 + 2 = 9
  const buttons = screen.getAllByRole('button', { name: /spell slot/i });
  expect(buttons).toHaveLength(9);
});

it('clicking an empty gem at level 1 (used=0) dispatches USE_SLOT regular', () => {
  const dispatch = vi.fn();
  renderWithContext({
    activeProfile: baseProfile,
    slots: wizardSlots,
    dispatch,
  });
  // All gems for level 1 are filled (used=0, so i >= 0 for all). Click first gem.
  const spellSlotBtns = screen.getAllByRole('button', { name: /spell slot/i });
  fireEvent.click(spellSlotBtns[0]);
  expect(dispatch).toHaveBeenCalledWith(
    expect.objectContaining({ type: 'USE_SLOT', slotType: 'regular', level: 1 })
  );
});

it('clicking a restore gem (used=2, level 1) dispatches USE_SLOT regular', () => {
  const dispatch = vi.fn();
  renderWithContext({
    activeProfile: {
      ...baseProfile,
      slotUsage: { regular: { 1: 2 }, pact: 0, arcanum: {} },
    },
    slots: wizardSlots,
    dispatch,
  });
  // Level 1, used=2: gems 0 and 1 are empty (i < used), gems 2 and 3 filled.
  // Click gem 0 (a "restore" action) → dispatches used=0
  const spellSlotBtns = screen.getAllByRole('button', { name: /spell slot/i });
  fireEvent.click(spellSlotBtns[0]);
  expect(dispatch).toHaveBeenCalledWith(
    expect.objectContaining({ type: 'USE_SLOT', slotType: 'regular', level: 1 })
  );
});

it('shows pact gems for a warlock profile', () => {
  renderWithContext({
    activeProfile: baseProfile,
    slots: warlockSlots,
  });
  // 2 pact gems
  const gems = screen.getAllByRole('button', { name: /spell slot/i });
  expect(gems).toHaveLength(2);
  expect(screen.getByText(/pact/i)).toBeInTheDocument();
});

it('Long Rest button dispatches LONG_REST', () => {
  const dispatch = vi.fn();
  renderWithContext({
    activeProfile: baseProfile,
    slots: wizardSlots,
    dispatch,
  });
  fireEvent.click(screen.getByRole('button', { name: 'Long Rest' }));
  expect(dispatch).toHaveBeenCalledWith({ type: 'LONG_REST' });
});

it('Short Rest button dispatches SHORT_REST', () => {
  const dispatch = vi.fn();
  renderWithContext({
    activeProfile: baseProfile,
    slots: wizardSlots,
    dispatch,
  });
  fireEvent.click(screen.getByRole('button', { name: 'Short Rest' }));
  expect(dispatch).toHaveBeenCalledWith({ type: 'SHORT_REST' });
});
