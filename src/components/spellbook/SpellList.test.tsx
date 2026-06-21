import { render, screen, fireEvent } from '@testing-library/react';
import { AppContext } from './SpellbookApp';
import type { AppContextValue } from './SpellbookApp';
import { createCommands } from '../../data/spellCommands';
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

const longstrider: Spell = {
  id: 'longstrider', name: 'Longstrider', level: 1, school: 'transmutation',
  castingTime: '1 minute', range: 'Touch', components: 'V, S, M',
  duration: '1 hour', concentration: false, ritual: false,
  description: '', classes: ['wizard', 'ranger', 'druid'],
};

const allSpells = [fireball, hex, prestidigitation, longstrider];

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
    commands: createCommands(vi.fn()),
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

it("cantrip pill filters to level-0 spells in browse all mode", () => {
  renderWithContext({
    browseMode: 'all',
    allSpells,
    activeProfile: wizardWarlockProfile,
    activeSpellbook: spellbook,
  });
  fireEvent.click(screen.getByRole('button', { name: 'Cantrip' }));
  expect(screen.getByText('Prestidigitation')).toBeInTheDocument();
  expect(screen.queryByText('Fireball')).not.toBeInTheDocument();
  expect(screen.queryByText('Hex')).not.toBeInTheDocument();
});

it("combat toggle filters in browse all mode (no slots → only cantrips visible)", () => {
  renderWithContext({
    browseMode: 'all',
    allSpells,
    activeProfile: wizardWarlockProfile,
    activeSpellbook: spellbook,
    slots: { casterLevel: 0, regularSlots: {}, pactMagic: null, arcanumLevels: [] },
  });
  fireEvent.click(screen.getByRole('button', { name: '✗ Combat' }));
  // No slots → only cantrips survive the combat filter
  expect(screen.getByText('Prestidigitation')).toBeInTheDocument();
  expect(screen.queryByText('Fireball')).not.toBeInTheDocument();
  expect(screen.queryByText('Hex')).not.toBeInTheDocument();
});

it("combat toggle with slots shows leveled spells in browse all mode", () => {
  renderWithContext({
    browseMode: 'all',
    allSpells,
    activeProfile: wizardWarlockProfile,
    activeSpellbook: spellbook,
    slots: { casterLevel: 5, regularSlots: { 1: 4, 2: 3, 3: 2 }, pactMagic: null, arcanumLevels: [] },
  });
  fireEvent.click(screen.getByRole('button', { name: '✗ Combat' }));
  // Slots available for levels 1-3, so Fireball (lvl 3) and Hex (lvl 1) should show
  expect(screen.getByText('Fireball')).toBeInTheDocument();
  expect(screen.getByText('Hex')).toBeInTheDocument();
  expect(screen.getByText('Prestidigitation')).toBeInTheDocument();
});

it("combat toggle hides spells with casting time longer than a combat turn (1 minute+)", () => {
  renderWithContext({
    browseMode: 'all',
    allSpells,
    activeProfile: wizardWarlockProfile,
    activeSpellbook: spellbook,
    slots: { casterLevel: 5, regularSlots: { 1: 4 }, pactMagic: null, arcanumLevels: [] },
  });
  fireEvent.click(screen.getByRole('button', { name: '✗ Combat' }));
  // Longstrider is level 1 with a slot available, but its casting time is "1 minute" → excluded
  expect(screen.queryByText('Longstrider')).not.toBeInTheDocument();
  // Fireball (1 action, level 3) and Prestidigitation (1 action, cantrip) should still show
  expect(screen.getByText('Prestidigitation')).toBeInTheDocument();
});

it("combat toggle with pact magic shows warlock spells (pact slots are not regularSlots)", () => {
  const pureWarlockProfile: Profile = {
    ...wizardWarlockProfile,
    classEntries: [{ class: 'warlock', level: 5 }],
  };
  renderWithContext({
    browseMode: 'all',
    allSpells,
    activeProfile: pureWarlockProfile,
    activeSpellbook: spellbook,
    // Pure warlock has no regularSlots — only pact magic (level 5 warlock = 2 slots at level 3)
    slots: { casterLevel: 0, regularSlots: {}, pactMagic: { slots: 2, slotLevel: 3 }, arcanumLevels: [] },
  });
  fireEvent.click(screen.getByRole('button', { name: '✗ Combat' }));
  // Hex (lvl 1) is a warlock spell — pact slot level 3 ≥ spell level 1, so it shows
  expect(screen.getByText('Hex')).toBeInTheDocument();
  // Prestidigitation is wizard/sorcerer/bard only, not warlock — class filter removes it before combat runs
  expect(screen.queryByText('Prestidigitation')).not.toBeInTheDocument();
  // Fireball is wizard/sorcerer only, also filtered out by class
  expect(screen.queryByText('Fireball')).not.toBeInTheDocument();
});

it("cantrip pill in browse all shows all cantrips even for classes without cantrips (Paladin)", () => {
  const paladinProfile: Profile = {
    ...wizardWarlockProfile,
    classEntries: [{ class: 'paladin', level: 5 }],
  };
  // Only a paladin in this test — and prestidigitation is NOT on the paladin list
  // but it should still show because Browse All + cantrip bypasses the class filter
  renderWithContext({
    browseMode: 'all',
    allSpells,
    activeProfile: paladinProfile,
    activeSpellbook: spellbook,
  });
  fireEvent.click(screen.getByRole('button', { name: 'Cantrip' }));
  // Prestidigitation IS a cantrip — should show even though paladin has no cantrips
  expect(screen.getByText('Prestidigitation')).toBeInTheDocument();
  expect(screen.queryByText('Fireball')).not.toBeInTheDocument();
  expect(screen.queryByText('Hex')).not.toBeInTheDocument();
});
