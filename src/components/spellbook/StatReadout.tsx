import { useApp } from './SpellbookApp';

export default function StatReadout() {
  const { activeProfile, preparedSet, saveDC, spellAttack, activeSpellbook, allSpells } = useApp();

  if (!activeProfile) return null;

  const totalPrepared = (activeSpellbook?.spellIds ?? []).filter(id => {
    const spell = allSpells.find(s => s.id === id);
    return spell && spell.level > 0;
  }).length;

  const preparedCount = [...preparedSet].filter(id => {
    const spell = allSpells.find(s => s.id === id);
    return spell && spell.level > 0;
  }).length;

  const tiles = [
    { label: 'Save DC', value: saveDC },
    { label: 'Spell Attack', value: `+${spellAttack}` },
    { label: 'Prepared', value: `${preparedCount}/${totalPrepared}` },
  ];

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.5rem',
        padding: '0.75rem 1rem',
        background: 'var(--sp-panel)',
        borderBottom: '1px solid var(--sp-border)',
      }}
    >
      {tiles.map(({ label, value }) => (
        <div
          key={label}
          style={{
            flex: 1,
            textAlign: 'center',
            padding: '0.5rem',
            background: 'var(--sp-card)',
            borderRadius: '0.5rem',
            border: '1px solid var(--sp-border)',
          }}
        >
          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--sp-text)', fontFamily: 'Cormorant Garamond, serif' }}>
            {value}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--sp-label)', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
