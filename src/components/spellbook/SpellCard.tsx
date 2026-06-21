import type { Spell } from '../../types/spellbook';
import { useApp } from './SpellbookApp';
import CastPill from './CastPill';

interface SpellCardProps {
  spell: Spell;
  profileClasses: string[];
  isInSpellbook: boolean;
  isSelected: boolean;
  onClick: () => void;
}

const SCHOOL_HUES: Record<string, number> = {
  evocation: 12, abjuration: 220, conjuration: 280, divination: 200,
  enchantment: 330, illusion: 260, necromancy: 130, transmutation: 50,
};

function getActionDotColor(castingTime: string): string {
  const ct = castingTime.toLowerCase();
  if (ct.includes('bonus')) return '#a855f7';
  if (ct.includes('reaction')) return '#3bb6d6';
  if (ct.includes('minute') || ct.includes('hour')) return '#e0a93b';
  return '#f72585';
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function SpellCard({ spell, profileClasses: _profileClasses, isInSpellbook: _isInSpellbook, isSelected, onClick }: SpellCardProps) {
  const { activeProfile, commands, browseMode } = useApp();
  const schoolHue = SCHOOL_HUES[spell.school.toLowerCase()] ?? 12;
  const isFavorite = activeProfile?.favorites.includes(spell.id) ?? false;

  function handleFavoriteToggle(e: React.MouseEvent) {
    e.stopPropagation();
    commands.toggleFavorite(spell.id);
  }

  return (
    <div
      role="listitem"
      style={{
        border: isSelected ? '1.5px solid var(--sp-accent)' : '1px solid var(--sp-border)',
        borderRadius: 14,
        overflow: 'hidden',
        background: 'var(--sp-card)',
        backdropFilter: 'blur(8px)',
        boxShadow: isSelected
          ? '0 0 0 3px var(--sp-accent-muted), 0 8px 24px -8px rgba(247,37,133,0.25)'
          : '0 2px 8px -4px rgba(0,0,0,0.18)',
        transition: 'box-shadow 0.15s, border-color 0.15s',
      }}
    >
      <button
        className="w-full text-left flex items-center gap-3 transition-colors"
        style={{
          padding: 'var(--sp-card-py) var(--sp-card-px)',
          backgroundColor: isSelected ? 'var(--sp-panel)' : 'transparent',
        }}
        onClick={onClick}
        aria-pressed={isSelected}
        aria-label={spell.name}
      >
        {/* Action dot */}
        <div
          data-testid="action-dot"
          data-color={getActionDotColor(spell.castingTime)}
          style={{
            width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
            background: getActionDotColor(spell.castingTime),
          }}
        />

        <div className="flex-1 min-w-0">
          <div className="font-cormorant" style={{ fontWeight: 600, fontSize: 'var(--sp-name-size)', color: 'var(--sp-text)', lineHeight: 1.3 }}>
            {spell.name}
          </div>
          <div style={{ fontSize: 'var(--sp-meta-size)', color: 'var(--sp-text-2)', marginTop: '0.0625rem' }}>
            <span style={{
              display: 'inline-block', padding: '0 0.375rem',
              borderRadius: '999px',
              background: `oklch(var(--sp-school-l, 42%) 0.10 ${schoolHue} / var(--sp-school-bg-a, 0.14))`,
              color: `oklch(var(--sp-school-l, 42%) 0.20 ${schoolHue})`,
              fontWeight: 500,
              fontSize: '0.6875rem',
              marginRight: '0.25rem',
            }}>
              {capitalize(spell.school)}
            </span>
            {spell.level === 0 ? 'Cantrip' : `Lvl ${spell.level}`}
            {spell.concentration && ' · C'}
            {spell.ritual && ' · R'}
          </div>
        </div>

        {/* Star (favorites) */}
        <button
          type="button"
          onClick={handleFavoriteToggle}
          aria-label={isFavorite ? 'Unfavorite' : 'Favorite'}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem',
            color: isFavorite ? 'var(--sp-accent)' : 'var(--sp-label)',
            fontSize: '1rem', lineHeight: 1, flexShrink: 0,
          }}
        >
          {isFavorite ? '★' : '☆'}
        </button>

        {/* Level badge */}
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--sp-accent)', minWidth: '1.25rem', textAlign: 'center', flexShrink: 0 }}>
          {spell.level === 0 ? 'C' : spell.level}
        </span>

        {browseMode === 'mine' && <CastPill spell={spell} />}

        <span style={{ fontSize: '0.75rem', color: 'var(--sp-label)', flexShrink: 0 }}>
          {isSelected ? '▲' : '▼'}
        </span>
      </button>
    </div>
  );
}
