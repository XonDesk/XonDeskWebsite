import { useState } from 'react';
import { useApp } from './SpellbookApp';
import type { Spell } from '../../types/spellbook';

interface CastPillProps {
  spell: Spell;
}

export default function CastPill({ spell }: CastPillProps) {
  const { activeProfile, slots, dispatch } = useApp();
  const [open, setOpen] = useState(false);

  const slotUsage = activeProfile?.slotUsage?.regular ?? {};
  const isCantrip = spell.level === 0;

  const available: number[] = [];
  if (!isCantrip) {
    for (let lvl = spell.level; lvl <= 9; lvl++) {
      const total = slots.regularSlots[lvl] ?? 0;
      const used = slotUsage[lvl] ?? 0;
      if (total - used > 0) available.push(lvl);
    }
  }

  const hasSlots = isCantrip || available.length > 0;
  const canUpcast = !isCantrip && available.length > 1;

  function cast(level: number, e: React.MouseEvent) {
    e.stopPropagation();
    dispatch({ type: 'CAST_SPELL', spellId: spell.id, level, isConcentration: spell.concentration });
    setOpen(false);
  }

  function handlePillClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (!hasSlots) return;
    if (isCantrip) { cast(0, e); return; }
    if (available.length === 1) { cast(available[0], e); return; }
    setOpen(o => !o);
  }

  return (
    <span style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      <button
        type="button"
        aria-label={isCantrip ? 'Cast cantrip' : 'Cast spell'}
        onClick={handlePillClick}
        style={{
          padding: '4px 10px',
          borderRadius: 999,
          cursor: hasSlots ? 'pointer' : 'default',
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 12,
          fontWeight: 600,
          background: 'linear-gradient(135deg, var(--sp-accent), var(--sp-accent-mid))',
          color: '#fff',
          border: 'none',
          boxShadow: '0 3px 8px -3px rgba(247,37,133,0.5)',
          whiteSpace: 'nowrap',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 3,
          opacity: hasSlots ? 1 : 0.4,
          pointerEvents: hasSlots ? 'auto' : 'none',
          flexShrink: 0,
        }}
      >
        ✦ Cast{canUpcast && <span aria-hidden="true" style={{ fontSize: 9, opacity: 0.85 }}>▾</span>}
      </button>

      {open && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            zIndex: 30,
            background: 'var(--sp-panel)',
            borderRadius: 14,
            padding: '10px 12px',
            boxShadow: '0 14px 32px -10px rgba(155,37,102,0.35), 0 0 0 1px var(--sp-border)',
            minWidth: 160,
          }}
        >
          <div style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 10,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--sp-label)',
            marginBottom: 6,
          }}>
            Cast with slot
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {available.map(lvl => {
              const remaining = (slots.regularSlots[lvl] ?? 0) - (slotUsage[lvl] ?? 0);
              const upcast = lvl - spell.level;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={e => cast(lvl, e)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    padding: '7px 10px',
                    borderRadius: 9,
                    cursor: 'pointer',
                    background: lvl === spell.level ? 'var(--sp-accent-muted)' : 'transparent',
                    border: '1px solid var(--sp-border-strong)',
                    width: '100%',
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--sp-text)',
                  }}
                >
                  <span>
                    Lvl {lvl}
                    {upcast > 0 && (
                      <span style={{ fontWeight: 400, color: 'var(--sp-text-2)', fontSize: 11 }}> +{upcast}</span>
                    )}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--sp-text-2)' }}>{remaining} left</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </span>
  );
}
