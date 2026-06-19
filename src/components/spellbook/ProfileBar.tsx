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
          padding: '0.5rem 1rem',
          background: 'linear-gradient(135deg, #f72585 0%, #ff85c2 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M17 13A8 8 0 1 1 7 3a6 6 0 0 0 10 10z" fill="#fff" />
          </svg>
          <span className="font-italianno" style={{ fontSize: '1.25rem', color: '#fff', lineHeight: 1 }}>
            Spellbook
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ProfileSwitcher />
          <button
            type="button"
            aria-label="Settings"
            onClick={() => setSettingsOpen(true)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#fff', fontSize: '1.125rem', lineHeight: 1,
              padding: '0.25rem',
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
