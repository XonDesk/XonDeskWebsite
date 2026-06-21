import { useState } from 'react';
import { useApp } from './SpellbookApp';
import type { Spell } from '../../types/spellbook';

interface CastPillProps {
  spell: Spell;
}

type SlotOption =
  | { kind: 'regular'; level: number }
  | { kind: 'pact'; level: number };

export default function CastPill({ spell }: CastPillProps) {
  const { activeProfile, slots, commands } = useApp();
  const [open, setOpen] = useState(false);

  const slotUsage = activeProfile?.slotUsage?.regular ?? {};
  const pactUsed = activeProfile?.slotUsage?.pact ?? 0;
  const isCantrip = spell.level === 0;

  const available: SlotOption[] = [];
  if (!isCantrip) {
    for (let lvl = spell.level; lvl <= 9; lvl++) {
      const total = slots.regularSlots[lvl] ?? 0;
      const used = slotUsage[lvl] ?? 0;
      if (total - used > 0) available.push({ kind: 'regular', level: lvl });
    }
    if (
      slots.pactMagic !== null &&
      slots.pactMagic.slotLevel >= spell.level &&
      slots.pactMagic.slots > pactUsed
    ) {
      available.push({ kind: 'pact', level: slots.pactMagic.slotLevel });
    }
  }

  const hasSlots = isCantrip || available.length > 0;
  const canChoose = !isCantrip && available.length > 1;

  function cast(opt: SlotOption, e: React.MouseEvent) {
    e.stopPropagation();
    if (opt.kind === 'pact') {
      commands.castPactSpell(spell.id, opt.level, spell.concentration);
    } else {
      commands.castSpell(spell.id, opt.level, spell.concentration);
    }
    setOpen(false);
  }

  function handlePillClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (!hasSlots) return;
    if (isCantrip) { commands.castSpell(spell.id, 0, spell.concentration); return; }
    if (available.length === 1) { cast(available[0], e); return; }
    setOpen(o => !o);
  }

  function labelFor(opt: SlotOption) {
    if (opt.kind === 'pact') return `Pact Lvl ${opt.level}`;
    const upcast = opt.level - spell.level;
    return `Lvl ${opt.level}${upcast > 0 ? ` +${upcast}` : ''}`;
  }

  function remainingFor(opt: SlotOption) {
    if (opt.kind === 'pact') return (slots.pactMagic?.slots ?? 0) - pactUsed;
    return (slots.regularSlots[opt.level] ?? 0) - (slotUsage[opt.level] ?? 0);
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
        ✦ Cast{canChoose && <span aria-hidden="true" style={{ fontSize: 9, opacity: 0.85 }}>▾</span>}
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
            {available.map(opt => {
              const key = `${opt.kind}-${opt.level}`;
              const isPact = opt.kind === 'pact';
              return (
                <button
                  key={key}
                  type="button"
                  onClick={e => cast(opt, e)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    padding: '7px 10px',
                    borderRadius: 9,
                    cursor: 'pointer',
                    background: isPact ? 'oklch(42% 0.18 280 / 0.10)' : (opt.level === spell.level ? 'var(--sp-accent-muted)' : 'transparent'),
                    border: `1px solid ${isPact ? 'oklch(55% 0.22 280 / 0.35)' : 'var(--sp-border-strong)'}`,
                    width: '100%',
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: 13,
                    fontWeight: 600,
                    color: isPact ? 'oklch(55% 0.22 280)' : 'var(--sp-text)',
                  }}
                >
                  <span>{labelFor(opt)}</span>
                  <span style={{ fontSize: 11, color: 'var(--sp-text-2)' }}>{remainingFor(opt)} left</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </span>
  );
}
