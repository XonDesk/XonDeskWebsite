import type { Spell } from '../../types/spellbook';
import { useApp } from './SpellbookApp';
import SpellExpanded from './SpellExpanded';
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

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function SpellCard({ spell, profileClasses: _profileClasses, isInSpellbook, isSelected, onClick }: SpellCardProps) {
  const { activeProfile, dispatch, browseMode } = useApp();
  const schoolHue = SCHOOL_HUES[spell.school.toLowerCase()] ?? 12;
  const isFavorite = activeProfile?.favorites.includes(spell.id) ?? false;

  function handleFavoriteToggle(e: React.MouseEvent) {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_FAVORITE', spellId: spell.id });
  }

  return (
    <div>
      <button
        className="w-full text-left px-4 py-3 border-b flex items-center gap-3 transition-colors"
        style={{
          borderColor: 'var(--sp-border)',
          backgroundColor: isSelected ? 'var(--sp-panel)' : 'var(--sp-card)',
          borderLeft: isSelected ? '3px solid var(--sp-accent)' : '3px solid transparent',
        }}
        onClick={onClick}
        aria-pressed={isSelected}
        aria-label={spell.name}
      >
        {/* Action dot */}
        <div style={{
          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
          background: `oklch(65% 0.22 ${schoolHue})`,
        }} />

        <div className="flex-1 min-w-0">
          <div className="font-cormorant" style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--sp-text)', lineHeight: 1.3 }}>
            {spell.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--sp-text-2)', marginTop: '0.0625rem' }}>
            <span style={{
              display: 'inline-block', padding: '0 0.375rem',
              borderRadius: '999px',
              background: `oklch(65% 0.12 ${schoolHue} / 0.15)`,
              color: `oklch(45% 0.18 ${schoolHue})`,
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
            color: isFavorite ? 'var(--sp-accent)' : 'var(--sp-border-strong)',
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
      {isSelected && <SpellExpanded spell={spell} isInSpellbook={isInSpellbook} browseMode={browseMode} />}
    </div>
  );
}
