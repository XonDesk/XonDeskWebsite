import { render, screen, fireEvent } from '@testing-library/react';
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

it('renders spell name and level', () => {
  const spell = makeSpell();
  render(
    <SpellCard
      spell={spell}
      profileClasses={[]}
      isInSpellbook={false}
      isSelected={false}
      onClick={vi.fn()}
    />
  );
  expect(screen.getByText('Fireball')).toBeInTheDocument();
  expect(screen.getByText('3')).toBeInTheDocument();
});

it('shows "C" for cantrip (level 0)', () => {
  const spell = makeSpell({ id: 'firebolt', name: 'Fire Bolt', level: 0 });
  render(
    <SpellCard
      spell={spell}
      profileClasses={[]}
      isInSpellbook={false}
      isSelected={false}
      onClick={vi.fn()}
    />
  );
  expect(screen.getByText('C')).toBeInTheDocument();
});

it('shows class badges only for profile classes that can cast the spell', () => {
  const spell = makeSpell({ classes: ['wizard', 'sorcerer', 'bard'] });
  render(
    <SpellCard
      spell={spell}
      profileClasses={['wizard', 'warlock']}  // warlock can't cast this spell
      isInSpellbook={false}
      isSelected={false}
      onClick={vi.fn()}
    />
  );
  expect(screen.getByText('WIZ')).toBeInTheDocument();
  expect(screen.queryByText('SORC')).not.toBeInTheDocument();
  expect(screen.queryByText('BARD')).not.toBeInTheDocument();
  expect(screen.queryByText('WLCK')).not.toBeInTheDocument();
});

it('calls onClick when clicked', () => {
  const onClick = vi.fn();
  const spell = makeSpell();
  render(
    <SpellCard
      spell={spell}
      profileClasses={[]}
      isInSpellbook={false}
      isSelected={false}
      onClick={onClick}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Fireball' }));
  expect(onClick).toHaveBeenCalledTimes(1);
});

it('has aria-pressed=true when isSelected', () => {
  const spell = makeSpell();
  render(
    <SpellCard
      spell={spell}
      profileClasses={[]}
      isInSpellbook={false}
      isSelected={true}
      onClick={vi.fn()}
    />
  );
  const btn = screen.getByRole('button', { name: 'Fireball', pressed: true });
  expect(btn).toBeInTheDocument();
});
