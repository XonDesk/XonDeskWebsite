import { useEffect } from 'react';
import { useApp } from './SpellbookApp';

export default function SpellDetail() {
  const { selectedSpellId, setSelectedSpellId, allSpells, activeSpellbook, dispatch } = useApp();

  const spell = allSpells.find(s => s.id === selectedSpellId) ?? null;
  const isInSpellbook = !!activeSpellbook?.spellIds.includes(spell?.id ?? '');

  // Close on Escape key
  useEffect(() => {
    if (!spell) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedSpellId(null); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [spell, setSelectedSpellId]);

  if (!spell) return null;

  function handleAddRemove() {
    if (!spell) return;
    if (isInSpellbook) {
      dispatch({ type: 'REMOVE_SPELL', spellId: spell.id });
    } else {
      dispatch({ type: 'ADD_SPELL', spellId: spell.id });
    }
  }

  const content = (
    <div className="p-4 overflow-y-auto" style={{ color: 'var(--sp-plum)' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="font-cinzel font-bold text-lg" style={{ color: 'var(--sp-plum)' }}>{spell.name}</h2>
          <p className="text-xs opacity-70 capitalize">{spell.school} • {spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`}</p>
        </div>
        <button
          onClick={() => setSelectedSpellId(null)}
          aria-label="Close"
          className="text-xl leading-none ml-2"
          style={{ color: 'var(--sp-plum)' }}
        >
          ×
        </button>
      </div>

      {/* Fields */}
      <dl className="text-sm space-y-1 mb-3">
        {[
          ['Casting Time', spell.castingTime],
          ['Range', spell.range],
          ['Components', spell.components],
          ['Duration', spell.duration],
        ].map(([label, value]) => (
          <div key={label} className="flex gap-2">
            <dt className="font-semibold font-cinzel w-28 flex-shrink-0">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
        {spell.concentration && (
          <div className="flex gap-1">
            <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: 'var(--sp-pink-hot)', color: '#fff' }}>Concentration</span>
          </div>
        )}
        {spell.ritual && (
          <div className="flex gap-1">
            <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: 'var(--sp-plum)', color: '#fff' }}>Ritual</span>
          </div>
        )}
      </dl>

      {/* Description */}
      <p className="text-sm mb-2 leading-relaxed">{spell.description}</p>
      {spell.higherLevel && (
        <p className="text-sm opacity-80 italic"><strong>At Higher Levels:</strong> {spell.higherLevel}</p>
      )}

      {/* Add/Remove button */}
      <button
        className="mt-4 w-full py-2 rounded font-cinzel font-bold text-sm"
        style={{
          backgroundColor: isInSpellbook ? 'transparent' : 'var(--sp-pink-hot)',
          color: isInSpellbook ? 'var(--sp-pink-hot)' : '#fff',
          border: `2px solid var(--sp-pink-hot)`,
        }}
        onClick={handleAddRemove}
      >
        {isInSpellbook ? 'Remove from Spellbook' : 'Add to Spellbook'}
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile: bottom sheet */}
      <div className="md:hidden fixed inset-0 z-40" onClick={() => setSelectedSpellId(null)} aria-hidden="true" />
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl shadow-2xl"
        style={{ height: '75vh', backgroundColor: 'var(--sp-cream)', borderTop: '2px solid var(--sp-pink-soft)' }}
        role="dialog"
        aria-modal="true"
        aria-label={spell.name}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--sp-pink-soft)' }} />
        </div>
        {content}
      </div>

      {/* Desktop: right-side panel */}
      <div
        className="hidden md:block fixed right-0 top-0 bottom-0 w-80 shadow-2xl overflow-hidden z-30"
        style={{ backgroundColor: 'var(--sp-cream)', borderLeft: '2px solid var(--sp-pink-soft)' }}
        role="complementary"
        aria-label={`${spell.name} details`}
      >
        {content}
      </div>
    </>
  );
}
