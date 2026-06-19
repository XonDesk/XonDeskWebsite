import { useApp } from './SpellbookApp';

interface SpellbookTabsProps {
  variant: 'mobile' | 'desktop';
}

export default function SpellbookTabs({ variant }: SpellbookTabsProps) {
  const { activeProfile, dispatch } = useApp();
  if (!activeProfile) return null;

  function handleCreateSpellbook() {
    const name = prompt('Spellbook name:');
    if (!name?.trim()) return;
    dispatch({ type: 'CREATE_SPELLBOOK', name: name.trim() });
  }

  if (variant === 'mobile') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          padding: '0.375rem 1rem 0.5rem',
          background: 'linear-gradient(135deg, #c41068 0%, #9b0050 100%)',
          overflowX: 'auto',
        }}
      >
        {activeProfile.spellbooks.map(sb => (
          <button
            key={sb.id}
            type="button"
            onClick={() => dispatch({ type: 'SET_ACTIVE_SPELLBOOK', spellbookId: sb.id })}
            style={{
              flexShrink: 0,
              padding: '0.25rem 0.875rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontFamily: 'Inter, sans-serif',
              fontWeight: sb.id === activeProfile.activeSpellbookId ? 600 : 400,
              border: '1px solid rgba(255,255,255,0.6)',
              background: sb.id === activeProfile.activeSpellbookId ? '#fff' : 'transparent',
              color: sb.id === activeProfile.activeSpellbookId ? '#f72585' : '#fff',
              cursor: 'pointer',
            }}
            aria-current={sb.id === activeProfile.activeSpellbookId ? 'true' : undefined}
          >
            {sb.name}
          </button>
        ))}
        <button
          type="button"
          onClick={handleCreateSpellbook}
          aria-label="New spellbook"
          style={{
            flexShrink: 0,
            padding: '0.25rem 0.625rem',
            borderRadius: '999px',
            fontSize: '0.875rem',
            border: '1px solid rgba(255,255,255,0.6)',
            background: 'transparent',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          +
        </button>
      </div>
    );
  }

  // Desktop variant
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0 0.75rem' }}>
      {activeProfile.spellbooks.map(sb => {
        const isActive = sb.id === activeProfile.activeSpellbookId;
        return (
          <button
            key={sb.id}
            type="button"
            onClick={() => dispatch({ type: 'SET_ACTIVE_SPELLBOOK', spellbookId: sb.id })}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.5rem',
              border: 'none',
              borderLeft: isActive ? '3px solid var(--sp-accent)' : '3px solid transparent',
              background: isActive ? 'var(--sp-accent-muted)' : 'transparent',
              color: isActive ? 'var(--sp-accent)' : 'var(--sp-text-2)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontFamily: 'Inter, sans-serif',
              fontWeight: isActive ? 600 : 400,
              textAlign: 'left',
            }}
            aria-current={isActive ? 'true' : undefined}
          >
            <span>{sb.name}</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{sb.spellIds.length}</span>
          </button>
        );
      })}
      <button
        type="button"
        onClick={handleCreateSpellbook}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          width: '100%',
          padding: '0.5rem 0.75rem',
          borderRadius: '0.5rem',
          border: '1px dashed var(--sp-border-strong)',
          background: 'transparent',
          color: 'var(--sp-label)',
          cursor: 'pointer',
          fontSize: '0.8125rem',
          fontFamily: 'Inter, sans-serif',
          marginTop: '0.125rem',
        }}
      >
        <span>+</span>
        <span>New spellbook</span>
      </button>
    </div>
  );
}
