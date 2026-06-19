import { useState } from 'react';
import { useApp } from './SpellbookApp';
import type { Spell } from '../../types/spellbook';

interface CastSpellPanelProps {
  spell: Spell;
}

const DICE_FORMULAS: Record<string, string> = {
  evocation: '🎲 Roll damage',
  necromancy: '🎲 Roll effect',
};

export default function CastSpellPanel({ spell }: CastSpellPanelProps) {
  const { slots, activeProfile, dispatch } = useApp();
  const [selectedLevel, setSelectedLevel] = useState(spell.level);

  const conc = activeProfile?.concentration ?? null;
  const alreadyConcentrating = conc && conc.spellId !== spell.id;

  function handleCast() {
    if (spell.level === 0) {
      // Cantrip — no slot consumed
      if (spell.concentration) {
        dispatch({ type: 'CAST_SPELL', spellId: spell.id, level: 0, isConcentration: true });
      }
      return;
    }
    dispatch({
      type: 'CAST_SPELL',
      spellId: spell.id,
      level: selectedLevel,
      isConcentration: spell.concentration,
    });
  }

  // Available upcast levels (slots remaining at or above spell level)
  const availableLevels: number[] = [];
  if (spell.level > 0) {
    const regularSlots = slots.regularSlots;
    const slotUsage = activeProfile?.slotUsage?.regular ?? {};
    for (let lvl = spell.level; lvl <= 9; lvl++) {
      const total = regularSlots[lvl] ?? 0;
      const used = slotUsage[lvl] ?? 0;
      if (total > 0 && used < total) {
        availableLevels.push(lvl);
      }
    }
  }

  const btnStyle = {
    background: 'linear-gradient(135deg, var(--sp-accent), var(--sp-accent-mid))',
    color: '#fff',
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.875rem',
    fontFamily: 'Inter, sans-serif',
    width: '100%',
  };

  return (
    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      {spell.concentration && alreadyConcentrating && (
        <div style={{
          padding: '0.5rem 0.75rem',
          background: 'var(--sp-conc-bg)',
          border: '1px solid var(--sp-conc-border)',
          borderRadius: '0.5rem',
          color: 'var(--sp-conc-text)',
          fontSize: '0.8125rem',
        }}>
          ⚠ You're concentrating on a different spell. Casting this will replace it.
        </div>
      )}

      {/* Slot level pills for leveled spells */}
      {spell.level > 0 && availableLevels.length > 0 && (
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          {availableLevels.map(lvl => {
            const total = slots.regularSlots[lvl] ?? 0;
            const used = activeProfile?.slotUsage?.regular[lvl] ?? 0;
            const remaining = total - used;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => setSelectedLevel(lvl)}
                style={{
                  padding: '0.25rem 0.625rem',
                  borderRadius: '999px',
                  fontSize: '0.8125rem',
                  border: selectedLevel === lvl ? '2px solid var(--sp-accent)' : '1px solid var(--sp-border-strong)',
                  background: selectedLevel === lvl ? 'var(--sp-accent-muted)' : 'transparent',
                  color: selectedLevel === lvl ? 'var(--sp-accent)' : 'var(--sp-text-2)',
                  cursor: 'pointer',
                  fontWeight: selectedLevel === lvl ? 600 : 400,
                }}
              >
                {lvl} <span style={{ opacity: 0.7 }}>({remaining})</span>
              </button>
            );
          })}
        </div>
      )}

      {spell.level > 0 && availableLevels.length === 0 && (
        <div style={{ fontSize: '0.8125rem', color: 'var(--sp-label)', fontStyle: 'italic' }}>
          No slots remaining at this level or higher.
        </div>
      )}

      {DICE_FORMULAS[spell.school.toLowerCase()] && (
        <div style={{ fontSize: '0.8125rem', color: 'var(--sp-text-2)' }}>
          {DICE_FORMULAS[spell.school.toLowerCase()]}
        </div>
      )}

      <button
        type="button"
        onClick={handleCast}
        disabled={spell.level > 0 && availableLevels.length === 0}
        style={{
          ...btnStyle,
          opacity: spell.level > 0 && availableLevels.length === 0 ? 0.4 : 1,
          cursor: spell.level > 0 && availableLevels.length === 0 ? 'not-allowed' : 'pointer',
        }}
      >
        ✦ {spell.level === 0 ? 'Cast Cantrip' : 'Cast Spell'}
      </button>
    </div>
  );
}
