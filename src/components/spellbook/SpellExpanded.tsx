import { useState } from 'react';
import type { Spell } from '../../types/spellbook';
import { useApp } from './SpellbookApp';
import CastSpellPanel from './CastSpellPanel';

interface SpellExpandedProps {
  spell: Spell;
  isInSpellbook: boolean;
  browseMode: 'mine' | 'all';
}

const SCHOOL_HUES: Record<string, number> = {
  evocation: 12, abjuration: 220, conjuration: 280, divination: 200,
  enchantment: 330, illusion: 260, necromancy: 130, transmutation: 50,
};

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function SpellExpanded({ spell, isInSpellbook, browseMode }: SpellExpandedProps) {
  const { dispatch, activeProfile, preparedSet } = useApp();
  const [descExpanded, setDescExpanded] = useState(false);
  const schoolHue = SCHOOL_HUES[spell.school.toLowerCase()] ?? 12;
  const isPrepared = preparedSet.has(spell.id);
  const isCantrip = spell.level === 0;

  const stats = [
    { label: 'Casting Time', value: spell.castingTime },
    { label: 'Range', value: spell.range },
    { label: 'Components', value: spell.components },
    { label: 'Duration', value: spell.duration },
  ];

  return (
    <div
      style={{
        backgroundColor: 'var(--sp-panel)',
        borderTop: '1px solid var(--sp-border)',
        borderBottom: '1px solid var(--sp-border)',
        padding: '0.875rem 1rem',
      }}
    >
      {/* School chip */}
      <div style={{ marginBottom: '0.625rem' }}>
        <span style={{
          display: 'inline-block', padding: '0.1875rem 0.625rem',
          borderRadius: '999px',
          background: `oklch(65% 0.12 ${schoolHue} / 0.18)`,
          color: `oklch(40% 0.2 ${schoolHue})`,
          fontSize: '0.75rem', fontWeight: 600,
        }}>
          {capitalize(spell.school)}
          {spell.level > 0 && ` · Level ${spell.level}`}
          {spell.concentration && ' · Concentration'}
          {spell.ritual && ' · Ritual'}
        </span>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.625rem' }}>
        {stats.map(({ label, value }) => (
          <div key={label}>
            <div style={{ fontSize: '0.625rem', color: 'var(--sp-label)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Inter, sans-serif' }}>
              {label}
            </div>
            <div className="font-cormorant" style={{ fontSize: '0.9375rem', color: 'var(--sp-text)' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Description */}
      <div style={{ marginBottom: '0.625rem' }}>
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--sp-text)',
            lineHeight: '1.6',
            overflow: descExpanded ? 'visible' : 'hidden',
            display: descExpanded ? 'block' : '-webkit-box',
            WebkitLineClamp: descExpanded ? undefined : 4,
            WebkitBoxOrient: descExpanded ? undefined : 'vertical',
            margin: 0,
            fontFamily: 'Inter, sans-serif',
          } as React.CSSProperties}
        >
          {spell.description}
        </p>
        <button
          type="button"
          onClick={() => setDescExpanded(p => !p)}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--sp-accent)', fontSize: '0.75rem', marginTop: '0.25rem' }}
        >
          {descExpanded ? 'Show less' : 'Show more'}
        </button>
      </div>

      {spell.higherLevel && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--sp-text-2)', fontStyle: 'italic', marginBottom: '0.75rem' }}>
          <span style={{ fontWeight: 600, fontStyle: 'normal' }}>At Higher Levels: </span>
          {spell.higherLevel}
        </p>
      )}

      {/* Cast panel (always available when in My Spells mode or when profile exists) */}
      {activeProfile && isInSpellbook && (
        <CastSpellPanel spell={spell} />
      )}

      {/* Prepare/Unprepare (My Spells mode, leveled spells only) */}
      {browseMode === 'mine' && isInSpellbook && !isCantrip && activeProfile && (
        <button
          type="button"
          onClick={() => dispatch({ type: 'TOGGLE_PREPARED', spellId: spell.id })}
          style={{
            width: '100%', marginTop: '0.5rem',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            fontSize: '0.8125rem', fontWeight: 500,
            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            ...(isPrepared
              ? { background: 'transparent', border: '1px solid var(--sp-border-strong)', color: 'var(--sp-text-2)' }
              : { background: 'var(--sp-accent-muted)', border: '1px solid var(--sp-accent)', color: 'var(--sp-accent)' }),
          }}
        >
          {isPrepared ? '✓ Prepared — Unprepare' : 'Prepare Spell'}
        </button>
      )}

      {/* Add/Remove from spellbook */}
      <button
        type="button"
        onClick={() => dispatch(isInSpellbook ? { type: 'REMOVE_SPELL', spellId: spell.id } : { type: 'ADD_SPELL', spellId: spell.id })}
        style={{
          width: '100%',
          padding: '0.5rem',
          marginTop: '0.5rem',
          borderRadius: '0.5rem',
          fontWeight: 600,
          fontSize: '0.8125rem',
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
          ...(isInSpellbook
            ? { background: 'transparent', border: '1px solid var(--sp-accent)', color: 'var(--sp-accent)' }
            : { background: 'linear-gradient(135deg, #f72585, #ff85c2)', border: 'none', color: '#fff' }),
        }}
      >
        {isInSpellbook ? 'Remove from Spellbook' : '+ Add to Spellbook'}
      </button>
    </div>
  );
}
