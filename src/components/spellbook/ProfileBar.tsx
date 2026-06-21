import { useApp } from './SpellbookApp';
import ProfileSwitcher from './ProfileSwitcher';
import SpellbookTabs from './SpellbookTabs';

export default function ProfileBar() {
  const { setSettingsOpen } = useApp();

  return (
    <header className="sticky top-0 z-10">
      {/* Row 1: logo + profile switcher + gear */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.125rem 0.875rem',
          background: 'var(--sp-header-bg)',
          borderBottom: '1px solid var(--sp-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, #ffd6e7, #ffeaf2)',
            display: 'grid', placeItems: 'center',
            boxShadow: '0 4px 12px rgba(247,37,133,0.15), inset 0 0 0 1px rgba(255,255,255,0.8)',
          }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M17 13A8 8 0 1 1 7 3a6 6 0 0 0 10 10z" fill="var(--sp-accent)" />
            </svg>
          </div>
          <div>
            <div className="font-cormorant" style={{ fontWeight: 600, fontSize: '1.25rem', lineHeight: 1, color: 'var(--sp-text)' }}>
              Spellbook
            </div>
            <div className="font-italianno" style={{ fontSize: '1.125rem', color: 'var(--sp-accent)', lineHeight: 1, marginTop: 2 }}>
              grimoire
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ProfileSwitcher />
          <button
            type="button"
            aria-label="Settings"
            onClick={() => setSettingsOpen(true)}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              border: '1px solid var(--sp-border-strong)',
              background: 'var(--sp-card)',
              cursor: 'pointer',
              color: 'var(--sp-text-2)', fontSize: '1rem', lineHeight: 1,
              display: 'grid', placeItems: 'center',
            }}
          >
            ⚙
          </button>
        </div>
      </div>

      {/* Row 2: spellbook tabs */}
      <SpellbookTabs variant="mobile" />
    </header>
  );
}
