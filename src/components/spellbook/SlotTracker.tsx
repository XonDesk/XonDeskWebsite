import { useApp } from './SpellbookApp';
import CrystalGem from './CrystalGem';

export default function SlotTracker() {
  const { slots, activeProfile, commands } = useApp();

  if (!activeProfile) return null;

  const { slotUsage } = activeProfile;

  const regularLevels = Object.entries(slots.regularSlots)
    .map(([level, total]) => ({ level: Number(level), total }))
    .sort((a, b) => a.level - b.level);

  return (
    <section
      style={{
        margin: '12px 14px 0',
        padding: '14px 14px 12px',
        borderRadius: 18,
        background: 'var(--sp-panel)',
        backdropFilter: 'blur(8px)',
        border: '1px solid var(--sp-border)',
        boxShadow: '0 10px 30px -12px rgba(247,37,133,0.18)',
      }}
      aria-label="Arcane Reserves"
    >
      {/* Heading row */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <span
            className="font-italianno"
            style={{ fontSize: '1.375rem', color: 'var(--sp-text-2)', lineHeight: 1 }}
          >
            Arcane Reserves
          </span>
          <span
            className="font-cormorant"
            style={{ fontSize: '0.6875rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--sp-label)', marginLeft: '0.5rem' }}
          >
            spell slots
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            onClick={() => commands.longRest()}
            style={{
              background: 'none',
              border: '1px solid var(--sp-border-strong)',
              borderRadius: 999,
              color: 'var(--sp-text-2)',
              padding: '3px 10px',
              fontSize: 11,
              cursor: 'pointer',
              fontFamily: 'Cormorant Garamond, serif',
            }}
          >
            ☾ Long Rest
          </button>
          <button
            type="button"
            onClick={() => commands.shortRest()}
            style={{
              background: 'none',
              border: '1px solid var(--sp-border)',
              borderRadius: 999,
              color: 'var(--sp-text-2)',
              padding: '3px 10px',
              fontSize: 11,
              cursor: 'pointer',
              fontFamily: 'Cormorant Garamond, serif',
            }}
          >
            ✦ Short
          </button>
        </div>
      </div>

      {/* Slot rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {slots.casterLevel > 0 && regularLevels.map(({ level, total }) => {
          const used = slotUsage.regular[level] ?? 0;
          const remaining = total - used;
          return (
            <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Level badge */}
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--sp-accent), var(--sp-accent-mid))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Cormorant Garamond, serif', fontSize: 13, fontWeight: 700, color: '#fff',
                flexShrink: 0,
              }}>
                {level}
              </div>
              {/* Gems */}
              <div style={{ display: 'flex', gap: 6, flex: 1 }}>
                {Array.from({ length: total }, (_, i) => (
                  <CrystalGem
                    key={i}
                    filled={i >= used}
                    onClick={() => {
                      const isFilled = i >= used;
                      commands.useRegularSlot(level, isFilled ? i + 1 : i);
                    }}
                    size={18}
                  />
                ))}
              </div>
              <span style={{ marginLeft: 'auto', fontFamily: 'Cormorant Garamond, serif', fontSize: 13, color: 'var(--sp-text-2)' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: 'rgba(157,78,221,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Cormorant Garamond, serif', fontSize: 13, fontWeight: 700, color: 'var(--sp-pact)',
                flexShrink: 0,
              }}>
                {slots.pactMagic.slotLevel}
              </div>
              <div style={{ display: 'flex', gap: 6, flex: 1 }}>
                {Array.from({ length: total }, (_, i) => (
                  <CrystalGem
                    key={i}
                    filled={i >= used}
                    onClick={() => {
                      const isFilled = i >= used;
                      commands.usePactSlot(isFilled ? i + 1 : i);
                    }}
                    size={18}
                  />
                ))}
              </div>
              <span style={{ marginLeft: 'auto', fontFamily: 'Cormorant Garamond, serif', fontSize: 13, color: 'var(--sp-pact)' }}>
                {remaining}/{total} pact
              </span>
            </div>
          );
        })()}

        {/* Mystic Arcanum */}
        {slots.arcanumLevels.map(level => {
          const used = slotUsage.arcanum[level] ?? 0;
          return (
            <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--sp-accent), var(--sp-accent-mid))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Cormorant Garamond, serif', fontSize: 13, fontWeight: 700, color: '#fff',
                flexShrink: 0,
              }}>
                {level}
              </div>
              <div style={{ display: 'flex', gap: 6, flex: 1 }}>
                <CrystalGem
                  filled={used === 0}
                  onClick={() => commands.useArcanumSlot(level, used === 0 ? 1 : 0)}
                  size={18}
                />
              </div>
              <span style={{ marginLeft: 'auto', fontFamily: 'Cormorant Garamond, serif', fontSize: 13, color: 'var(--sp-label)' }}>
                {used === 0 ? '1/1' : '0/1'} arc
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
