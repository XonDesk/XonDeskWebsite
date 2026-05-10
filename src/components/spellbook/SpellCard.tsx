import type { Spell } from '../../types/spellbook';

interface SpellCardProps {
  spell: Spell;
  profileClasses: string[];
  isInSpellbook: boolean;
  isSelected: boolean;
  onClick: () => void;
}

const SCHOOL_ABBR: Record<string, string> = {
  evocation: 'Evo', conjuration: 'Con', abjuration: 'Abj',
  enchantment: 'Enc', illusion: 'Ill', necromancy: 'Nec',
  transmutation: 'Tra', divination: 'Div',
};

const CLASS_BADGE: Record<string, string> = {
  wizard: 'WIZ', sorcerer: 'SORC', bard: 'BARD', cleric: 'CLER',
  druid: 'DRUD', paladin: 'PAL', ranger: 'RNGR', warlock: 'WLCK',
  'eldritch-knight': 'EK', 'arcane-trickster': 'AT',
};

export default function SpellCard({ spell, profileClasses, isInSpellbook: _isInSpellbook, isSelected, onClick }: SpellCardProps) {
  const badges = spell.classes.filter(c => profileClasses.includes(c));

  return (
    <button
      className="w-full text-left px-4 py-2 border-b flex items-center gap-2 transition-colors"
      style={{
        borderColor: 'var(--sp-pink-soft)',
        backgroundColor: isSelected ? 'var(--sp-pink-pale)' : 'var(--sp-cream)',
      }}
      onClick={onClick}
      aria-selected={isSelected}
      aria-label={spell.name}
    >
      <span className="flex-1 text-sm font-cinzel font-semibold truncate" style={{ color: 'var(--sp-plum)' }}>
        {spell.name}
      </span>
      <div className="flex items-center gap-1 flex-shrink-0">
        {badges.map(cls => (
          <span
            key={cls}
            className="text-xs px-1 rounded font-bold"
            style={{ backgroundColor: 'var(--sp-pink-soft)', color: 'var(--sp-plum)' }}
          >
            {CLASS_BADGE[cls]}
          </span>
        ))}
        <span className="text-xs w-8 text-center" style={{ color: 'var(--sp-plum)' }}>
          {SCHOOL_ABBR[spell.school] ?? spell.school.slice(0, 3)}
        </span>
        <span className="text-xs w-5 text-center font-bold" style={{ color: 'var(--sp-pink-hot)' }}>
          {spell.level === 0 ? 'C' : spell.level}
        </span>
      </div>
    </button>
  );
}
