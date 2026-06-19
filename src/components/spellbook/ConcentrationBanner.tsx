import { useApp } from './SpellbookApp';

export default function ConcentrationBanner() {
  const { activeProfile, dispatch, allSpells } = useApp();
  const conc = activeProfile?.concentration ?? null;
  if (!conc) return null;

  const spell = allSpells.find(s => s.id === conc.spellId);
  const spellName = spell?.name ?? conc.spellId;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        background: 'var(--sp-conc-bg)',
        borderBottom: '1px solid var(--sp-conc-border)',
        color: 'var(--sp-conc-text)',
        fontSize: '0.875rem',
      }}
    >
      <span style={{ fontSize: '1rem' }}>⊙</span>
      <span style={{ flex: 1, fontWeight: 500 }}>
        Concentrating: <strong>{spellName}</strong>
        {conc.level > 0 && ` (level ${conc.level})`}
      </span>
      <button
        type="button"
        onClick={() => dispatch({ type: 'DROP_CONCENTRATION' })}
        style={{
          background: 'none',
          border: '1px solid var(--sp-conc-border)',
          borderRadius: '0.375rem',
          color: 'var(--sp-conc-text)',
          padding: '0.25rem 0.625rem',
          fontSize: '0.75rem',
          cursor: 'pointer',
          fontWeight: 500,
        }}
      >
        Drop
      </button>
    </div>
  );
}
