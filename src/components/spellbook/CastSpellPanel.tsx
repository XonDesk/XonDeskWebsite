import { useState, useMemo } from 'react';
import { useApp } from './SpellbookApp';
import type { Spell } from '../../types/spellbook';

interface CastSpellPanelProps {
  spell: Spell;
}

type SlotOption =
  | { kind: 'regular'; level: number }
  | { kind: 'pact'; level: number };

function isSame(a: SlotOption, b: SlotOption) {
  return a.kind === b.kind && a.level === b.level;
}

function stripUpcastPrefix(text: string): string {
  return text
    .replace(/^Using a Higher-Level Spell Slot\.\s*/i, '')
    .replace(/^At Higher Levels\.\s*/i, '');
}

export default function CastSpellPanel({ spell }: CastSpellPanelProps) {
  const { slots, activeProfile, commands, showToast } = useApp();
  const slotUsage = activeProfile?.slotUsage?.regular ?? {};
  const pactUsed = activeProfile?.slotUsage?.pact ?? 0;
  const conc = activeProfile?.concentration ?? null;
  const alreadyConcentrating = conc && conc.spellId !== spell.id;

  // Build list of available slot options, lowest first
  const options = useMemo<SlotOption[]>(() => {
    if (spell.level === 0) return [];
    const out: SlotOption[] = [];
    for (let lvl = spell.level; lvl <= 9; lvl++) {
      const total = slots.regularSlots[lvl] ?? 0;
      const used = slotUsage[lvl] ?? 0;
      if (total > 0 && used < total) out.push({ kind: 'regular', level: lvl });
    }
    if (
      slots.pactMagic !== null &&
      slots.pactMagic.slotLevel >= spell.level &&
      slots.pactMagic.slots > pactUsed
    ) {
      out.push({ kind: 'pact', level: slots.pactMagic.slotLevel });
    }
    return out;
  }, [spell.level, slots, slotUsage, pactUsed]);

  // Track preferred option; if it's no longer available, fall back to first valid
  const [preferred, setPreferred] = useState<SlotOption>({ kind: 'regular', level: spell.level });
  const selectedOption: SlotOption =
    options.find(o => isSame(o, preferred)) ?? options[0] ?? preferred;

  const isUpcasting =
    selectedOption.kind === 'regular' && selectedOption.level > spell.level;
  const isPactCast = selectedOption.kind === 'pact';

  function handleCast() {
    if (spell.level === 0) {
      // Cantrips are unlimited — just show feedback
      showToast(`Cast ${spell.name}`);
      if (spell.concentration) commands.castSpell(spell.id, 0, true);
      return;
    }
    if (options.length === 0) return;
    if (isPactCast) {
      commands.castPactSpell(spell.id, selectedOption.level, spell.concentration);
    } else {
      commands.castSpell(spell.id, selectedOption.level, spell.concentration);
    }
  }

  function remainingFor(opt: SlotOption): number {
    if (opt.kind === 'pact') return (slots.pactMagic?.slots ?? 0) - pactUsed;
    return (slots.regularSlots[opt.level] ?? 0) - (slotUsage[opt.level] ?? 0);
  }

  function labelFor(opt: SlotOption): string {
    if (opt.kind === 'pact') return `Pact · Lvl ${opt.level}`;
    const diff = opt.level - spell.level;
    return diff === 0 ? `Lvl ${opt.level}` : `Lvl ${opt.level} ↑${diff}`;
  }

  const castLabel = spell.level === 0
    ? `Cast ${spell.name}`
    : isUpcasting
    ? `Cast at Level ${selectedOption.level}`
    : isPactCast
    ? `Cast (Pact Lvl ${selectedOption.level})`
    : `Cast at Level ${selectedOption.level}`;

  const canCast = spell.level === 0 || options.length > 0;

  return (
    <div style={{ marginTop: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>

      {spell.concentration && alreadyConcentrating && (
        <div style={{
          padding: '0.5rem 0.75rem',
          background: 'var(--sp-conc-bg)',
          border: '1px solid var(--sp-conc-border)',
          borderRadius: '0.5rem',
          color: 'var(--sp-conc-text)',
          fontSize: '0.8125rem',
        }}>
          ⚠ Casting this will drop your current concentration.
        </div>
      )}

      {/* Slot level picker */}
      {spell.level > 0 && options.length > 1 && (
        <div>
          <div style={{ fontSize: '0.625rem', color: 'var(--sp-label)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Inter, sans-serif', marginBottom: '0.375rem' }}>
            Spell Slot Level
          </div>
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
            {options.map(opt => {
              const active = isSame(selectedOption, opt);
              const pact = opt.kind === 'pact';
              return (
                <button
                  key={`${opt.kind}-${opt.level}`}
                  type="button"
                  onClick={() => setPreferred(opt)}
                  style={{
                    padding: '0.25rem 0.625rem',
                    borderRadius: '999px',
                    fontSize: '0.8125rem',
                    fontFamily: 'Inter, sans-serif',
                    border: active
                      ? `2px solid ${pact ? 'var(--sp-pact)' : 'var(--sp-accent)'}`
                      : '1px solid var(--sp-border-strong)',
                    background: active
                      ? pact ? 'oklch(42% 0.18 280 / 0.15)' : 'var(--sp-accent-muted)'
                      : 'transparent',
                    color: active
                      ? pact ? 'var(--sp-pact)' : 'var(--sp-accent)'
                      : 'var(--sp-text-2)',
                    cursor: 'pointer',
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {labelFor(opt)}
                  <span style={{ opacity: 0.6, marginLeft: '0.25rem', fontSize: '0.75rem' }}>
                    ×{remainingFor(opt)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcast effect */}
      {(isUpcasting || isPactCast) && spell.higherLevel && (
        <div style={{
          padding: '0.5rem 0.75rem',
          background: isPactCast ? 'oklch(42% 0.18 280 / 0.10)' : 'var(--sp-accent-muted)',
          border: `1px solid ${isPactCast ? 'oklch(55% 0.22 280 / 0.35)' : 'var(--sp-border-strong)'}`,
          borderRadius: '0.5rem',
          fontSize: '0.8125rem',
          color: 'var(--sp-text)',
          fontFamily: 'Inter, sans-serif',
          lineHeight: 1.5,
        }}>
          <span style={{ fontWeight: 600, color: isPactCast ? 'var(--sp-pact)' : 'var(--sp-accent)', marginRight: '0.25rem' }}>
            ↑ Upcast effect:
          </span>
          {stripUpcastPrefix(spell.higherLevel)}
        </div>
      )}

      {spell.level > 0 && options.length === 0 && (
        <div style={{ fontSize: '0.8125rem', color: 'var(--sp-label)', fontStyle: 'italic', fontFamily: 'Inter, sans-serif' }}>
          No slots remaining.
        </div>
      )}

      <button
        type="button"
        onClick={handleCast}
        disabled={!canCast}
        style={{
          background: 'linear-gradient(135deg, var(--sp-accent), var(--sp-accent-mid))',
          color: '#fff',
          border: 'none',
          borderRadius: '0.5rem',
          padding: '0.5rem 1rem',
          cursor: canCast ? 'pointer' : 'not-allowed',
          fontWeight: 600,
          fontSize: '0.875rem',
          fontFamily: 'Inter, sans-serif',
          width: '100%',
          opacity: canCast ? 1 : 0.4,
        }}
      >
        ✦ {castLabel}
      </button>
    </div>
  );
}
