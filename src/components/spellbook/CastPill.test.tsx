import { render, screen, fireEvent } from '@testing-library/react';
import { AppContext } from './SpellbookApp';
import type { AppContextValue } from './SpellbookApp';
import CastPill from './CastPill';
import type { Spell } from '../../types/spellbook';

const mockDispatch = vi.fn();

const mockSpell: Spell = {
  id: 'fireball',
  name: 'Fireball',
  level: 3,
  school: 'evocation',
  castingTime: '1 action',
  range: '150 feet',
  components: 'V, S, M',
  duration: 'Instantaneous',
  concentration: false,
  ritual: false,
  description: 'A bright streak...',
  classes: ['wizard'],
};

const mockCantrip: Spell = {
  ...mockSpell,
  id: 'firebolt',
  name: 'Fire Bolt',
  level: 0,
};

function makeContext(overrides: Partial<AppContextValue> = {}): AppContextValue {
  return {
    state: { profiles: [], activeProfileId: '' },
    dispatch: mockDispatch,
    activeProfile: {
      id: 'p1', name: 'Lyra', avatarHue: 330,
      classEntries: [{ class: 'wizard' as const, level: 5 }],
      spellbooks: [], activeSpellbookId: '',
      slotUsage: { regular: { 3: 0 }, pact: 0, arcanum: {} },
      spellAbility: 'INT' as const, abilityMod: 4,
      prepared: [], favorites: [], concentration: null,
    },
    activeSpellbook: undefined,
    slots: { casterLevel: 5, regularSlots: { 3: 3, 4: 2 }, pactMagic: null, arcanumLevels: [] },
    allSpells: [],
    selectedSpellId: null, setSelectedSpellId: vi.fn(),
    settingsOpen: false, setSettingsOpen: vi.fn(),
    browseMode: 'mine', setBrowseMode: vi.fn(),
    profBonus: 3, saveDC: 15, spellAttack: 7,
    preparedSet: new Set(),
    visualSettings: { theme: 'auto', density: 'cozy', background: 'clouds' },
    setTheme: vi.fn(), setDensity: vi.fn(), setBackground: vi.fn(),
    toast: null, showToast: vi.fn(),
    ...overrides,
  } as AppContextValue;
}

function wrap(ui: React.ReactElement, ctx = makeContext()) {
  return render(
    <AppContext.Provider value={ctx}>{ui}</AppContext.Provider>
  );
}

beforeEach(() => { mockDispatch.mockClear(); });

it('renders the Cast pill for a leveled spell with available slots', () => {
  wrap(<CastPill spell={mockSpell} />);
  expect(screen.getByRole('button', { name: 'Cast spell' })).toBeInTheDocument();
});

it('renders a dimmed pill when no slots are available', () => {
  const ctx = makeContext({
    slots: { casterLevel: 5, regularSlots: {}, pactMagic: null, arcanumLevels: [] },
  });
  wrap(<CastPill spell={mockSpell} />, ctx);
  const pill = screen.getByRole('button', { name: 'Cast spell' });
  expect(pill).toHaveStyle('opacity: 0.4');
});

it('dispatches CAST_SPELL with the spell level when only one slot level is available', () => {
  const ctx = makeContext({
    slots: { casterLevel: 5, regularSlots: { 3: 1 }, pactMagic: null, arcanumLevels: [] },
  });
  wrap(<CastPill spell={mockSpell} />, ctx);
  fireEvent.click(screen.getByRole('button', { name: 'Cast spell' }));
  expect(mockDispatch).toHaveBeenCalledWith({
    type: 'CAST_SPELL', spellId: 'fireball', level: 3, isConcentration: false,
  });
});

it('opens the upcast dropdown when multiple slot levels are available', () => {
  wrap(<CastPill spell={mockSpell} />);
  fireEvent.click(screen.getByRole('button', { name: 'Cast spell' }));
  expect(screen.getByText('Cast with slot')).toBeInTheDocument();
  expect(screen.getByText(/Lvl 3/)).toBeInTheDocument();
  expect(screen.getByText(/Lvl 4/)).toBeInTheDocument();
});

it('dispatches CAST_SPELL immediately for a cantrip without a slot picker', () => {
  wrap(<CastPill spell={mockCantrip} />);
  fireEvent.click(screen.getByRole('button', { name: 'Cast cantrip' }));
  expect(mockDispatch).toHaveBeenCalledWith({
    type: 'CAST_SPELL', spellId: 'firebolt', level: 0, isConcentration: false,
  });
});
