import { useState } from 'react';
import type { Spell } from '../../types/spellbook';
import { useApp } from './SpellbookApp';

interface SpellExpandedProps {
  spell: Spell;
  isInSpellbook: boolean;
}

export default function SpellExpanded({ spell, isInSpellbook }: SpellExpandedProps) {
  const { dispatch } = useApp();
  const [descExpanded, setDescExpanded] = useState(false);

  const stats = [
    { label: 'Casting Time', value: spell.castingTime },
    { label: 'Range', value: spell.range },
    { label: 'Components', value: spell.components },
    { label: 'Duration', value: spell.duration },
  ];

  return (
    <div
      style={{
        backgroundColor: 'var(--sp-card)',
        borderTop: '1px solid var(--sp-pink-soft)',
        borderBottom: '1px solid var(--sp-pink-soft)',
      }}
      className="px-4 py-3"
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
        {stats.map(({ label, value }) => (
          <div key={label}>
            <div style={{ fontSize: '10px', color: 'var(--sp-muted)', fontFamily: 'Cinzel, serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {label}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--sp-plum)' }}>{value}</div>
          </div>
        ))}
      </div>

      {(spell.concentration || spell.ritual) && (
        <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
          {spell.concentration && (
            <span style={{ backgroundColor: 'var(--sp-badge-bg)', color: 'var(--sp-pink-hot)', fontSize: '11px', padding: '2px 8px', borderRadius: '9999px', fontWeight: 600 }}>
              Concentration
            </span>
          )}
          {spell.ritual && (
            <span style={{ backgroundColor: 'var(--sp-badge-bg)', color: 'var(--sp-pink-hot)', fontSize: '11px', padding: '2px 8px', borderRadius: '9999px', fontWeight: 600 }}>
              Ritual
            </span>
          )}
        </div>
      )}

      <div style={{ marginBottom: '10px' }}>
        {descExpanded ? (
          <p style={{ fontSize: '13px', color: 'var(--sp-plum)', lineHeight: '1.6', margin: 0 }}>
            {spell.description}
          </p>
        ) : (
          <p style={{ fontSize: '13px', color: 'var(--sp-plum)', lineHeight: '1.6', overflow: 'hidden',
            display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', margin: 0 } as React.CSSProperties}>
            {spell.description}
          </p>
        )}
        <button
          onClick={() => setDescExpanded(p => !p)}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--sp-pink-hot)', fontFamily: 'Cinzel, serif', fontSize: '11px', marginTop: '4px' }}
        >
          {descExpanded ? 'Show less' : 'Show more'}
        </button>
      </div>

      {spell.higherLevel && (
        <p style={{ fontSize: '13px', color: 'var(--sp-muted)', fontStyle: 'italic', marginBottom: '12px' }}>
          <span style={{ fontWeight: 600, fontStyle: 'normal' }}>At Higher Levels: </span>
          {spell.higherLevel}
        </p>
      )}

      <button
        onClick={() => dispatch(isInSpellbook ? { type: 'REMOVE_SPELL', spellId: spell.id } : { type: 'ADD_SPELL', spellId: spell.id })}
        style={{
          width: '100%',
          padding: '10px',
          borderRadius: '8px',
          fontFamily: 'Cinzel, serif',
          fontWeight: 700,
          fontSize: '13px',
          cursor: 'pointer',
          ...(isInSpellbook
            ? { background: 'transparent', border: '2px solid #f72585', color: '#f72585' }
            : { background: 'linear-gradient(135deg, #f72585, #ff85c2)', border: 'none', color: '#fff' }),
        }}
      >
        {isInSpellbook ? 'Remove from Spellbook' : 'Add to Spellbook'}
      </button>
    </div>
  );
}
