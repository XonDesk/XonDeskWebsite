import { useApp } from './SpellbookApp';
import CrystalGem from './CrystalGem';

export default function SlotTracker() {
  const { slots, activeProfile, dispatch } = useApp();

  if (!activeProfile) return null;

  const { slotUsage } = activeProfile;

  const regularLevels = Object.entries(slots.regularSlots)
    .map(([level, total]) => ({ level: Number(level), total }))
    .sort((a, b) => a.level - b.level);

  return (
    <section
      style={{
        background: 'var(--sp-panel)',
        borderBottom: '1px solid var(--sp-border)',
        padding: '0.875rem 1rem',
      }}
      aria-label="Spell slots"
    >
      {/* Heading row */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div>
          <span
            className="font-italianno"
            style={{ fontSize: '1.375rem', color: 'var(--sp-text)', lineHeight: 1 }}
          >
            Arcane Reserves
          </span>
          <span
            className="font-cormorant"
            style={{ fontSize: '0.8125rem', color: 'var(--sp-label)', marginLeft: '0.5rem' }}
          >
            spell slots
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => dispatch({ type: 'LONG_REST' })}
            style={{
              background: 'none',
              border: '1px solid var(--sp-border-strong)',
              borderRadius: '0.375rem',
              color: 'var(--sp-text-2)',
              padding: '0.2rem 0.625rem',
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Long Rest
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: 'SHORT_REST' })}
            style={{
              background: 'none',
              border: '1px solid var(--sp-pact)',
              borderRadius: '0.375rem',
              color: 'var(--sp-pact)',
              padding: '0.2rem 0.625rem',
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Short Rest
          </button>
        </div>
      </div>

      {/* Slot rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        {slots.casterLevel > 0 && regularLevels.map(({ level, total }) => {
          const used = slotUsage.regular[level] ?? 0;
          const remaining = total - used;
          return (
            <div key={level} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {/* Level badge */}
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: 'var(--sp-accent-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.6875rem', fontWeight: 700, color: 'var(--sp-accent)',
                flexShrink: 0,
              }}>
                {level}
              </div>
              {/* Gems */}
              <div style={{ display: 'flex', gap: '2px', flex: 1 }}>
                {Array.from({ length: total }, (_, i) => (
                  <CrystalGem
                    key={i}
                    filled={i >= used}
                    onClick={() => {
                      const isFilled = i >= used;
                      if (isFilled) {
                        dispatch({ type: 'USE_SLOT', slotType: 'regular', level, used: i + 1 });
                      } else {
                        dispatch({ type: 'USE_SLOT', slotType: 'regular', level, used: i });
                      }
                    }}
                    size={18}
                  />
                ))}
              </div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--sp-label)', minWidth: '2.5rem', textAlign: 'right' }}>
                {remaining}/{total}
              </span>
            </div>
          );
        })}

        {/* Pact Magic */}
        {slots.pactMagic && (() => {
          const used = slotUsage.pact;
          const total = slots.pactMagic.slots;
          const remaining = total - used;
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: 'rgba(157,78,221,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.6875rem', fontWeight: 700, color: 'var(--sp-pact)',
                flexShrink: 0,
              }}>
                {slots.pactMagic.slotLevel}
              </div>
              <div style={{ display: 'flex', gap: '2px', flex: 1 }}>
                {Array.from({ length: total }, (_, i) => (
                  <CrystalGem
                    key={i}
                    filled={i >= used}
                    onClick={() => {
                      const isFilled = i >= used;
                      dispatch({ type: 'USE_SLOT', slotType: 'pact', used: isFilled ? i + 1 : i });
                    }}
                    size={18}
                  />
                ))}
              </div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--sp-pact)', minWidth: '2.5rem', textAlign: 'right' }}>
                {remaining}/{total} pact
              </span>
            </div>
          );
        })()}

        {/* Mystic Arcanum */}
        {slots.arcanumLevels.map(level => {
          const used = slotUsage.arcanum[level] ?? 0;
          return (
            <div key={level} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: 'var(--sp-accent-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.6875rem', fontWeight: 700, color: 'var(--sp-accent)',
                flexShrink: 0,
              }}>
                {level}
              </div>
              <div style={{ display: 'flex', gap: '2px', flex: 1 }}>
                <CrystalGem
                  filled={used === 0}
                  onClick={() => dispatch({ type: 'USE_SLOT', slotType: 'arcanum', level, used: used === 0 ? 1 : 0 })}
                  size={18}
                />
              </div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--sp-label)', minWidth: '2.5rem', textAlign: 'right' }}>
                {used === 0 ? '1/1' : '0/1'} arc
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
