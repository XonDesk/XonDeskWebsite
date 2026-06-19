import { render, screen } from '@testing-library/react';
import SpellbookApp from './SpellbookApp';

const mockProfile = {
  id: 'p1',
  name: 'Lyra',
  avatarHue: 330,
  classEntries: [{ class: 'wizard' as const, level: 5 }],
  spellbooks: [{ id: 'sb1', name: "Lyra's Book", spellIds: [] }],
  activeSpellbookId: 'sb1',
  slotUsage: { regular: {}, pact: 0, arcanum: {} },
  spellAbility: 'INT' as const,
  abilityMod: 4,
  prepared: [],
  favorites: [],
  concentration: null,
};

vi.mock('../../hooks/useSpellbook', () => ({
  useSpellbook: () => ({
    state: { profiles: [mockProfile], activeProfileId: 'p1' },
    dispatch: vi.fn(),
  }),
}));

vi.mock('../../hooks/useSlots', () => ({
  useSlots: () => ({
    casterLevel: 5,
    regularSlots: { 1: 4, 2: 3, 3: 2 },
    pactMagic: null,
    arcanumLevels: [],
  }),
}));

vi.mock('../../hooks/useVisualSettings', () => ({
  useVisualSettings: () => ({
    settings: { theme: 'auto', density: 'cozy', background: 'clouds' },
    setTheme: vi.fn(),
    setDensity: vi.fn(),
    setBackground: vi.fn(),
  }),
}));

it('renders at least two spell slot tracker instances (mobile + desktop sidebar) when an active profile exists', () => {
  render(<SpellbookApp />);
  // One in the mobile lg:hidden block, one in DesktopSidebar — jsdom renders both
  expect(screen.getAllByLabelText('Spell slots').length).toBeGreaterThanOrEqual(2);
});

it('renders at least two new spellbook buttons (mobile + desktop sidebar) when an active profile exists', () => {
  render(<SpellbookApp />);
  expect(screen.getAllByLabelText('New spellbook').length).toBeGreaterThanOrEqual(2);
});
