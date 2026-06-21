import { useState } from 'react';
import { useApp } from './SpellbookApp';
import AvatarCircle from './AvatarCircle';

export default function ProfileSwitcher() {
  const { state, commands, activeProfile } = useApp();
  const [open, setOpen] = useState(false);

  function handleSelect(id: string) {
    commands.setActiveProfile(id);
    setOpen(false);
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem',
        }}
      >
        {activeProfile ? (
          <AvatarCircle hue={activeProfile.avatarHue} name={activeProfile.name} size={32} />
        ) : (
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
        )}
        <span className="font-cormorant" style={{ fontSize: '0.8125rem', color: 'var(--sp-text)', fontWeight: 600 }}>
          {activeProfile?.name.split(' ')[0] ?? 'No profile'}
        </span>
        <span style={{ color: 'var(--sp-text-2)', fontSize: '0.6875rem' }}>▾</span>
      </button>

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 19 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: 'absolute', top: '100%', left: 0, marginTop: '0.5rem',
              minWidth: 200,
              background: 'var(--sp-panel)',
              border: '1px solid var(--sp-border-strong)',
              borderRadius: '0.75rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              backdropFilter: 'blur(8px)',
              zIndex: 20,
              overflow: 'hidden',
            }}
            role="listbox"
          >
            {state.profiles.map(p => (
              <button
                key={p.id}
                type="button"
                role="option"
                aria-selected={p.id === state.activeProfileId}
                onClick={() => handleSelect(p.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  width: '100%', padding: '0.625rem 0.875rem',
                  background: p.id === state.activeProfileId ? 'var(--sp-accent-muted)' : 'transparent',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <AvatarCircle hue={p.avatarHue} name={p.name} size={32} />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--sp-text)' }}>{p.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--sp-text-2)' }}>
                    {p.classEntries.map(e => `${e.class} ${e.level}`).join(' / ')}
                  </div>
                </div>
              </button>
            ))}
            <div style={{ borderTop: '1px solid var(--sp-border)', padding: '0.375rem' }}>
              <button
                type="button"
                onClick={() => { setOpen(false); }}
                style={{
                  width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--sp-label)', fontSize: '0.8125rem', textAlign: 'left',
                }}
              >
                + New witch
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
