import { useApp } from './SpellbookApp';

export default function ConcentrationBanner() {
  const { activeProfile, commands, allSpells } = useApp();
  const conc = activeProfile?.concentration ?? null;
  if (!conc) return null;

  const spell = allSpells.find(s => s.id === conc.spellId);
  const spellName = spell?.name ?? conc.spellId;

  return (
    <div
      className="lg:hidden"
      style={{
        margin: '0 14px 4px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.625rem 0.875rem',
        background: 'var(--sp-conc-bg)',
        border: '1px solid var(--sp-conc-border)',
        borderRadius: '0.875rem',
      }}
    >
      <div
        style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          border: '1px solid var(--sp-conc-border)',
          background: 'var(--sp-conc-bg)',
          display: 'grid', placeItems: 'center',
          color: 'var(--sp-conc-text)', fontSize: '1rem',
        }}
      >
        ⊙
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          className="font-cormorant"
          style={{
            fontSize: '0.625rem', letterSpacing: '0.16em', textTransform: 'uppercase',
            color: 'var(--sp-conc-text)', opacity: 0.7,
          }}
        >
          Concentrating
        </div>
        <div
          className="font-cormorant"
          style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--sp-conc-text)', lineHeight: 1.2 }}
        >
          {spellName}{conc.level > 0 ? ` · level ${conc.level}` : ''}
        </div>
      </div>
      <button
        type="button"
        onClick={() => commands.dropConcentration()}
        style={{
          background: 'none',
          border: '1px solid var(--sp-conc-border)',
          borderRadius: '0.375rem',
          color: 'var(--sp-conc-text)',
          padding: '0.25rem 0.625rem',
          fontSize: '0.75rem',
          cursor: 'pointer',
          opacity: 0.85,
        }}
      >
        Drop
      </button>
    </div>
  );
}
