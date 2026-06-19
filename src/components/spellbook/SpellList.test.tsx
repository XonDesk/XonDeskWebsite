import { render, screen, fireEvent } from '@testing-library/react';
import { AppContext } from './SpellbookApp';
import type { AppContextValue } from './SpellbookApp';
import SpellList from './SpellList';
import type { Spell, Profile, Spellbook } from '../../types/spellbook';

// --- Test data ---

const fireball: Spell = {
  id: 'fireball', name: 'Fireball', level: 3, school: 'evocation',
  castingTime: '1 action', range: '150 feet', components: 'V, S, M',
  duration: 'Instantaneous', concentration: false, ritual: false,
  description: '', classes: ['wizard', 'sorcerer'],
};

const hex: Spell = {
  id: 'hex', name: 'Hex', level: 1, school: 'enchantment',
  castingTime: '1 bonus action', range: '90 feet', components: 'V, S, M',
  duration: 'Concentration, up to 1 hour', concentration: true, ritual: false,
  description: '', classes: ['warlock'],
};

const prestidigitation: Spell = {
  id: 'prestidigitation', name: 'Prestidigitation', level: 0, school: 'transmutation',
  castingTime: '1 action', range: '10 feet', components: 'V, S',
  duration: '1 hour', concentration: false, ritual: false,
  description: '', classes: ['wizard', 'sorcerer', 'bard'],
};

const allSpells = [fireball, hex, prestidigitation];

const wizardWarlockProfile: Profile = {
  id: 'p1',
  name: 'Ari',
  classEntries: [
    { class: 'wizard', level: 10 },
    { class: 'warlock', level: 5 },
  ],
  spellbooks: [],
  activeSpellbookId: 'sb1',
  slotUsage: { regular: {}, pact: 0, arcanum: {} },
  avatarHue: 12,
  spellAbility: 'INT',
  abilityMod: 3,
  prepared: [],
  favorites: [],
  concentration: null,
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
    ...overrides,
  };
  return render(
    <AppContext.Provider value={defaultContext}>
      <SpellList />
    </AppContext.Provider>
  );
}

// --- Tests ---

it("in 'mine' mode, shows only spells in activeSpellbook.spellIds", () => {
  renderWithContext({
    browseMode: 'mine',
    allSpells,
    activeProfile: wizardWarlockProfile,
    activeSpellbook: spellbook, // only 'fireball'
  });
  expect(screen.getByText('Fireball')).toBeInTheDocument();
  expect(screen.queryByText('Hex')).not.toBeInTheDocument();
  expect(screen.queryByText('Prestidigitation')).not.toBeInTheDocument();
});

it("in 'mine' mode, empty spellbook shows the styled empty state", () => {
  renderWithContext({
    browseMode: 'mine',
    allSpells,
    activeProfile: wizardWarlockProfile,
    activeSpellbook: { ...spellbook, spellIds: [] },
  });
  expect(screen.getByText('The grimoire is silent')).toBeInTheDocument();
  expect(screen.getByText('Try a different search or level filter')).toBeInTheDocument();
});

it("in 'all' mode, defaults to showing spells for profile's classes", () => {
  renderWithContext({
    browseMode: 'all',
    allSpells,
    activeProfile: wizardWarlockProfile,
    activeSpellbook: spellbook,
  });
  // wizard classes: fireball, prestidigitation; warlock: hex
  expect(screen.getByText('Fireball')).toBeInTheDocument();
  expect(screen.getByText('Hex')).toBeInTheDocument();
  expect(screen.getByText('Prestidigitation')).toBeInTheDocument();
});

it('search filters by name (case-insensitive)', () => {
  renderWithContext({
    browseMode: 'all',
    allSpells,
    activeProfile: wizardWarlockProfile,
    activeSpellbook: spellbook,
  });
  fireEvent.change(screen.getByRole('searchbox', { name: /search spells/i }), {
    target: { value: 'fire' },
  });
  expect(screen.getByText('Fireball')).toBeInTheDocument();
  expect(screen.queryByText('Hex')).not.toBeInTheDocument();
  expect(screen.queryByText('Prestidigitation')).not.toBeInTheDocument();
});

it('level filter shows only matching level', () => {
  renderWithContext({
    browseMode: 'all',
    allSpells,
    activeProfile: wizardWarlockProfile,
    activeSpellbook: spellbook,
  });
  fireEvent.click(screen.getByRole('button', { name: 'Lvl 1' }));
  expect(screen.getByText('Hex')).toBeInTheDocument();
  expect(screen.queryByText('Fireball')).not.toBeInTheDocument();
  expect(screen.queryByText('Prestidigitation')).not.toBeInTheDocument();
});

it("class filter in 'all' mode filters to specific class", () => {
  renderWithContext({
    browseMode: 'all',
    allSpells,
    activeProfile: wizardWarlockProfile,
    activeSpellbook: spellbook,
  });
  fireEvent.change(screen.getByRole('combobox', { name: /filter by class/i }), {
    target: { value: 'bard' },
  });
  // Only prestidigitation is on bard list
  expect(screen.getByText('Prestidigitation')).toBeInTheDocument();
  expect(screen.queryByText('Fireball')).not.toBeInTheDocument();
  expect(screen.queryByText('Hex')).not.toBeInTheDocument();
});
