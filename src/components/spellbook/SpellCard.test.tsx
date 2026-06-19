import { render, screen, fireEvent } from '@testing-library/react';
import { AppContext } from './SpellbookApp';
import type { AppContextValue } from './SpellbookApp';
import SpellCard from './SpellCard';
import type { Spell } from '../../types/spellbook';

const makeSpell = (overrides: Partial<Spell> = {}): Spell => ({
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
  classes: ['wizard', 'sorcerer'],
  ...overrides,
});

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
};

function renderCard(spell: Spell, overrides: Partial<AppContextValue> = {}, isSelected = false, onClick = vi.fn()) {
  return render(
    <AppContext.Provider value={{ ...defaultContext, ...overrides }}>
      <SpellCard
        spell={spell}
        profileClasses={[]}
        isInSpellbook={false}
        isSelected={isSelected}
        onClick={onClick}
      />
    </AppContext.Provider>
  );
}

it('renders spell name and level', () => {
  const spell = makeSpell();
  renderCard(spell);
  expect(screen.getByText('Fireball')).toBeInTheDocument();
  expect(screen.getByText('3')).toBeInTheDocument();
});

it('shows "C" for cantrip (level 0)', () => {
  const spell = makeSpell({ id: 'firebolt', name: 'Fire Bolt', level: 0 });
  renderCard(spell);
  expect(screen.getByText('C')).toBeInTheDocument();
});

it('shows school chip with school name', () => {
  const spell = makeSpell({ classes: ['wizard', 'sorcerer', 'bard'] });
  renderCard(spell);
  expect(screen.getByText('Evocation')).toBeInTheDocument();
});

it('calls onClick when clicked', () => {
  const onClick = vi.fn();
  const spell = makeSpell();
  renderCard(spell, {}, false, onClick);
  fireEvent.click(screen.getByRole('button', { name: 'Fireball' }));
  expect(onClick).toHaveBeenCalledTimes(1);
});

it('has aria-pressed=true when isSelected', () => {
  const spell = makeSpell();
  renderCard(spell, {}, true);
  const btn = screen.getByRole('button', { name: 'Fireball', pressed: true });
  expect(btn).toBeInTheDocument();
});

it('shows star icon for favorites toggle', () => {
  const spell = makeSpell();
  renderCard(spell);
  expect(screen.getByRole('button', { name: 'Favorite' })).toBeInTheDocument();
});

it('dispatches TOGGLE_FAVORITE when star clicked', () => {
  const dispatch = vi.fn();
  const spell = makeSpell();
  renderCard(spell, { dispatch });
  fireEvent.click(screen.getByRole('button', { name: 'Favorite' }));
  expect(dispatch).toHaveBeenCalledWith({ type: 'TOGGLE_FAVORITE', spellId: 'fireball' });
});

it('uses pink dot for an action-cast spell', () => {
  const { container } = renderCard(makeSpell({ castingTime: '1 action' }));
  expect(container.querySelector('[data-testid="action-dot"]')).toHaveAttribute('data-color', '#f72585');
});

it('uses purple dot for a bonus action spell', () => {
  const { container } = renderCard(makeSpell({ castingTime: '1 Bonus Action' }));
  expect(container.querySelector('[data-testid="action-dot"]')).toHaveAttribute('data-color', '#a855f7');
});

it('uses teal dot for a reaction spell', () => {
  const { container } = renderCard(makeSpell({ castingTime: '1 Reaction' }));
  expect(container.querySelector('[data-testid="action-dot"]')).toHaveAttribute('data-color', '#3bb6d6');
});

it('uses gold dot for a long-cast spell', () => {
  const { container } = renderCard(makeSpell({ castingTime: '1 Minute' }));
  expect(container.querySelector('[data-testid="action-dot"]')).toHaveAttribute('data-color', '#e0a93b');
});
