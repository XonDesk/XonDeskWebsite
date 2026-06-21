import { useApp } from './SpellbookApp';

export default function BrowseToggle() {
  const { browseMode, setBrowseMode } = useApp();
  return (
    <div style={{ display: 'flex', gap: 8, padding: '10px 14px 0' }} role="group" aria-label="View mode">
      {([['mine', 'My Spells'], ['all', 'Browse All']] as const).map(([mode, label]) => {
        const active = browseMode === mode;
        return (
          <button
            key={mode}
            aria-pressed={active}
            onClick={() => setBrowseMode(mode)}
            style={{
              flex: 1, padding: '9px 12px', borderRadius: 12, cursor: 'pointer',
              fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: 13, letterSpacing: '0.04em',
              border: active ? 'none' : '1px solid var(--sp-border-strong)',
              background: active
                ? 'linear-gradient(135deg, var(--sp-accent), var(--sp-accent-mid))'
                : 'var(--sp-card)',
              color: active ? '#fff' : 'var(--sp-text-2)',
              boxShadow: active ? '0 8px 18px -8px rgba(247,37,133,0.5)' : 'none',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
