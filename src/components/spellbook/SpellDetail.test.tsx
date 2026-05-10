import { render, screen, fireEvent } from '@testing-library/react';
import { AppContext } from './SpellbookApp';
import type { AppContextValue } from './SpellbookApp';
import SpellDetail from './SpellDetail';
import type { Spell, Spellbook } from '../../types/spellbook';

// --- Test data ---

const fireball: Spell = {
  id: 'fireball', name: 'Fireball', level: 3, school: 'evocation',
  castingTime: '1 action', range: '150 feet', components: 'V, S, M',
  duration: 'Instantaneous', concentration: false, ritual: false,
  description: 'A bright streak of light...', classes: ['wizard'],
};

const spellbook: Spellbook = {
  id: 'sb1',
  name: 'Main',
  spellIds: ['fireball'],
};

function renderWithContext(overrides: Partial<AppContextValue>) {
  const defaultContext: AppContextValue = {
    state: { profiles: [], activeProfileId: '' },
    dispatch: vi.fn(),
    activeProfile: undefined,
    activeSpellbook: undefined,
    slots: { casterLevel: 0, regularSlots: {}, pactMagic: null, arcanumLevels: [] },
    allSpells: [fireball],
    selectedSpellId: null,
    setSelectedSpellId: vi.fn(),
    settingsOpen: false,
    setSettingsOpen: vi.fn(),
    browseMode: 'mine',
    setBrowseMode: vi.fn(),
    ...overrides,
  };
  return render(
    <AppContext.Provider value={defaultContext}>
      <SpellDetail />
    </AppContext.Provider>
  );
}

// --- Tests ---

it('returns null when selectedSpellId is null', () => {
  const { container } = renderWithContext({ selectedSpellId: null });
  expect(container.firstChild).toBeNull();
});

it('shows spell name when a spell is selected', () => {
  renderWithContext({ selectedSpellId: 'fireball' });
  expect(screen.getAllByText('Fireball').length).toBeGreaterThan(0);
});

it('shows all spell fields (casting time, range, components, duration)', () => {
  renderWithContext({ selectedSpellId: 'fireball' });
  expect(screen.getAllByText('Casting Time').length).toBeGreaterThan(0);
  expect(screen.getAllByText('1 action').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Range').length).toBeGreaterThan(0);
  expect(screen.getAllByText('150 feet').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Components').length).toBeGreaterThan(0);
  expect(screen.getAllByText('V, S, M').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Duration').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Instantaneous').length).toBeGreaterThan(0);
});

it('shows Concentration badge when concentration=true', () => {
  const concentrationSpell: Spell = { ...fireball, id: 'hex', concentration: true };
  renderWithContext({
    selectedSpellId: 'hex',
    allSpells: [concentrationSpell],
  });
  expect(screen.getAllByText('Concentration').length).toBeGreaterThan(0);
});

it('shows "Add to Spellbook" when spell not in spellbook', () => {
  renderWithContext({
    selectedSpellId: 'fireball',
    activeSpellbook: { ...spellbook, spellIds: [] },
  });
  expect(screen.getAllByRole('button').some(b => b.textContent === 'Add to Spellbook')).toBe(true);
});

it('shows "Remove from Spellbook" when spell is in spellbook', () => {
  renderWithContext({
    selectedSpellId: 'fireball',
    activeSpellbook: spellbook,
  });
  expect(screen.getAllByRole('button').some(b => b.textContent === 'Remove from Spellbook')).toBe(true);
});

it('"Add to Spellbook" click dispatches ADD_SPELL', () => {
  const dispatch = vi.fn();
  renderWithContext({
    selectedSpellId: 'fireball',
    activeSpellbook: { ...spellbook, spellIds: [] },
    dispatch,
  });
  const addBtn = screen.getAllByRole('button').find(b => b.textContent === 'Add to Spellbook')!;
  fireEvent.click(addBtn);
  expect(dispatch).toHaveBeenCalledWith({ type: 'ADD_SPELL', spellId: 'fireball' });
});

it('"Remove from Spellbook" click dispatches REMOVE_SPELL', () => {
  const dispatch = vi.fn();
  renderWithContext({
    selectedSpellId: 'fireball',
    activeSpellbook: spellbook,
    dispatch,
  });
  const removeBtn = screen.getAllByRole('button').find(b => b.textContent === 'Remove from Spellbook')!;
  fireEvent.click(removeBtn);
  expect(dispatch).toHaveBeenCalledWith({ type: 'REMOVE_SPELL', spellId: 'fireball' });
});

it('close button (×) calls setSelectedSpellId(null)', () => {
  const setSelectedSpellId = vi.fn();
  renderWithContext({
    selectedSpellId: 'fireball',
    setSelectedSpellId,
  });
  const closeButtons = screen.getAllByRole('button', { name: 'Close' });
  expect(closeButtons.length).toBeGreaterThan(0);
  fireEvent.click(closeButtons[0]);
  expect(setSelectedSpellId).toHaveBeenCalledWith(null);
});
