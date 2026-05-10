import type { Spell } from '../../types/spellbook';
import SpellExpanded from './SpellExpanded';

interface SpellCardProps {
  spell: Spell;
  profileClasses: string[];
  isInSpellbook: boolean;
  isSelected: boolean;
  onClick: () => void;
}

const CLASS_BADGE: Record<string, string> = {
  wizard: 'WIZ', sorcerer: 'SORC', bard: 'BARD', cleric: 'CLER',
  druid: 'DRUD', paladin: 'PAL', ranger: 'RNGR', warlock: 'WLCK',
  'eldritch-knight': 'EK', 'arcane-trickster': 'AT',
};

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function SpellCard({ spell, profileClasses, isInSpellbook, isSelected, onClick }: SpellCardProps) {
  const badges = spell.classes.filter(c => profileClasses.includes(c));
  const levelLabel = spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`;
  const subtitle = `${capitalize(spell.school)} · ${levelLabel}`;

  return (
    <div>
      <button
        className="w-full text-left px-4 py-3 border-b flex items-center gap-3 transition-colors"
        style={{
          borderColor: 'var(--sp-pink-soft)',
          backgroundColor: isSelected ? 'var(--sp-bg)' : 'var(--sp-card)',
          borderLeft: isSelected ? '3px solid var(--sp-pink-hot)' : undefined,
        }}
        onClick={onClick}
        aria-pressed={isSelected}
        aria-label={spell.name}
      >
        <div className="flex-1 min-w-0">
          <div className="font-cinzel font-semibold text-sm truncate" style={{ color: 'var(--sp-plum)' }}>
            {spell.name}
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--sp-muted)' }}>
            {subtitle}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {badges.map(cls => (
            <span
              key={cls}
              className="text-xs px-1.5 py-0.5 rounded font-bold"
              style={{ backgroundColor: 'var(--sp-badge-bg)', color: 'var(--sp-pink-hot)' }}
            >
              {CLASS_BADGE[cls]}
            </span>
          ))}
          <span className="text-xs font-bold w-5 text-center" style={{ color: 'var(--sp-pink-hot)' }}>
            {spell.level === 0 ? 'C' : spell.level}
          </span>
          <span className="text-xs w-4 text-center" style={{ color: 'var(--sp-muted)' }}>
            {isSelected ? '▲' : '▼'}
          </span>
        </div>
      </button>
      {isSelected && <SpellExpanded spell={spell} isInSpellbook={isInSpellbook} />}
    </div>
  );
}
