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
});

it('renders Spell Slots section for wizard 5 with levels 1, 2, 3', () => {
  renderWithContext({
    activeProfile: baseProfile,
    slots: wizardSlots,
  });
  expect(screen.getByText('Spell Slots')).toBeInTheDocument();
  // level labels
  expect(screen.getByText('1')).toBeInTheDocument();
  expect(screen.getByText('2')).toBeInTheDocument();
  expect(screen.getByText('3')).toBeInTheDocument();
  // total bubbles: 4 + 3 + 2 = 9
  const buttons = screen.getAllByRole('button', { name: /Use slot|Mark slot/i });
  expect(buttons).toHaveLength(9);
});

it('clicking empty bubble at index 2 (used=0) dispatches USE_SLOT regular with used=3', () => {
  const dispatch = vi.fn();
  renderWithContext({
    activeProfile: baseProfile,
    slots: wizardSlots,
    dispatch,
  });
  // Level 1 row has 4 bubbles (unique: "Use slot 4" only exists in level 1).
  // Click "Use slot 4" (index 3): dispatches used=4, but we want index=2 → used=3.
  // Use within to scope to the row containing level label "1" by finding all level rows.
  // Simpler: level 1 has slot 4 which is unique — but we want index 2 (used=3).
  // Get all buttons named "Use slot 3" and take the first (level 1 row).
  const allSlot3Buttons = screen.getAllByRole('button', { name: 'Use slot 3' });
  fireEvent.click(allSlot3Buttons[0]);
  expect(dispatch).toHaveBeenCalledWith({ type: 'USE_SLOT', slotType: 'regular', level: 1, used: 3 });
});

it('clicking filled bubble at index 0 (used=2) dispatches USE_SLOT regular with used=0', () => {
  const dispatch = vi.fn();
  renderWithContext({
    activeProfile: {
      ...baseProfile,
      slotUsage: { regular: { 1: 2 }, pact: 0, arcanum: {} },
    },
    slots: wizardSlots,
    dispatch,
  });
  // Level 1, used=2: first two bubbles are filled ("Mark slot 1 unused", "Mark slot 2 unused")
  // Clicking index 0 → onSetUsed(0) → used=0
  const bubble = screen.getByRole('button', { name: 'Mark slot 1 unused' });
  fireEvent.click(bubble);
  expect(dispatch).toHaveBeenCalledWith({ type: 'USE_SLOT', slotType: 'regular', level: 1, used: 0 });
});

it('shows Pact Magic section for a warlock profile', () => {
  renderWithContext({
    activeProfile: baseProfile,
    slots: warlockSlots,
  });
  expect(screen.getByText(/Pact Magic/)).toBeInTheDocument();
  // 2 pact bubbles
  const bubbles = screen.getAllByRole('button', { name: /Use slot|Mark slot/i });
  expect(bubbles).toHaveLength(2);
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
