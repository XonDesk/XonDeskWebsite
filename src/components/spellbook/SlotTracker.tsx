import { useApp } from './SpellbookApp';

interface BubbleRowProps {
  total: number;
  used: number;
  color: string;
  onSetUsed: (n: number) => void;
}

function BubbleRow({ total, used, color, onSetUsed }: BubbleRowProps) {
  return (
    <div className="flex gap-1 items-center">
      {Array.from({ length: total }, (_, i) => {
        const filled = i < used;
        return (
          <button
            key={i}
            aria-label={filled ? `Mark slot ${i + 1} unused` : `Use slot ${i + 1}`}
            aria-pressed={filled}
            className="w-6 h-6 rounded-full border-2 transition-colors focus:outline-none focus-visible:ring-2"
            style={{
              backgroundColor: filled ? color : 'transparent',
              borderColor: color,
            }}
            onClick={() => onSetUsed(filled ? i : i + 1)}
          />
        );
      })}
    </div>
  );
}

export default function SlotTracker() {
  const { slots, activeProfile, dispatch } = useApp();

  if (!activeProfile) return null;

  const { slotUsage } = activeProfile;

  const regularLevels = Object.entries(slots.regularSlots)
    .map(([level, total]) => ({ level: Number(level), total }))
    .sort((a, b) => a.level - b.level);

  return (
    <section
      className="overflow-x-auto border-b px-4 py-3"
      style={{ backgroundColor: 'var(--sp-card)', borderColor: 'var(--sp-pink-soft)' }}
      aria-label="Spell slots"
    >
      <div className="flex gap-6 min-w-max items-start">

        {/* Spell Slots */}
        {slots.casterLevel > 0 && (
          <div>
            <div className="text-xs font-cinzel font-semibold mb-2" style={{ color: 'var(--sp-plum)' }}>Spell Slots</div>
            <div className="flex flex-col gap-1">
              {regularLevels.map(({ level, total }) => (
                <div key={level} className="flex items-center gap-2">
                  <span className="text-xs w-4 text-right font-cinzel" style={{ color: 'var(--sp-plum)' }}>{level}</span>
                  <BubbleRow
                    total={total}
                    used={slotUsage.regular[level] ?? 0}
                    color="var(--sp-pink-hot)"
                    onSetUsed={(n) => dispatch({ type: 'USE_SLOT', slotType: 'regular', level, used: n })}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pact Magic */}
        {slots.pactMagic && (
          <div>
            <div className="text-xs font-cinzel font-semibold mb-2" style={{ color: 'var(--sp-pact)' }}>
              Pact Magic <span className="font-normal opacity-70">(short rest)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs w-4 text-right font-cinzel" style={{ color: 'var(--sp-pact)' }}>
                {slots.pactMagic.slotLevel}
              </span>
              <BubbleRow
                total={slots.pactMagic.slots}
                used={slotUsage.pact}
                color="var(--sp-pact)"
                onSetUsed={(n) => dispatch({ type: 'USE_SLOT', slotType: 'pact', used: n })}
              />
            </div>
          </div>
        )}

        {/* Mystic Arcanum */}
        {slots.arcanumLevels.length > 0 && (
          <div>
            <div className="text-xs font-cinzel font-semibold mb-2" style={{ color: 'var(--sp-plum)' }}>Mystic Arcanum</div>
            <div className="flex flex-col gap-1">
              {slots.arcanumLevels.map(level => {
                const used = slotUsage.arcanum[level] ?? 0;
                return (
                  <div key={level} className="flex items-center gap-2">
                    <span className="text-xs w-4 text-right font-cinzel" style={{ color: 'var(--sp-plum)' }}>{level}</span>
                    <BubbleRow
                      total={1}
                      used={used}
                      color="var(--sp-plum)"
                      onSetUsed={(n) => dispatch({ type: 'USE_SLOT', slotType: 'arcanum', level, used: (n > 0 ? 1 : 0) as 0 | 1 })}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Rest buttons */}
        <div className="flex flex-col gap-2 justify-end self-end pb-0.5">
          <button
            className="px-3 py-1 rounded text-xs font-cinzel border"
            style={{ color: 'var(--sp-plum)', borderColor: 'var(--sp-pink-soft)' }}
            onClick={() => dispatch({ type: 'LONG_REST' })}
          >
            Long Rest
          </button>
          <button
            className="px-3 py-1 rounded text-xs font-cinzel border"
            style={{ color: 'var(--sp-pact)', borderColor: 'var(--sp-pact)' }}
            onClick={() => dispatch({ type: 'SHORT_REST' })}
          >
            Short Rest
          </button>
        </div>
      </div>
    </section>
  );
}
