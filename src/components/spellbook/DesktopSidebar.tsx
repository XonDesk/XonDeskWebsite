import { useApp } from './SpellbookApp';
import AvatarCircle from './AvatarCircle';
import StatReadout from './StatReadout';
import SlotTracker from './SlotTracker';
import SpellbookTabs from './SpellbookTabs';
import ProfileSwitcher from './ProfileSwitcher';

export default function DesktopSidebar() {
  const { setSettingsOpen } = useApp();

  return (
    <aside
      className="hidden lg:flex flex-col"
      style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        background: 'var(--sp-sidebar-glass)',
        backdropFilter: 'blur(12px)',
        borderRight: '1px solid var(--sp-border)',
      }}
    >
      {/* Logo header */}
      <div style={{ padding: '1.25rem 1rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M17 13A8 8 0 1 1 7 3a6 6 0 0 0 10 10z" fill="var(--sp-accent)" />
          </svg>
          <span className="font-italianno" style={{ fontSize: '1.5rem', color: 'var(--sp-text)', lineHeight: 1 }}>
            Spellbook
          </span>
        </div>
        <button
          type="button"
          aria-label="Settings"
          onClick={() => setSettingsOpen(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sp-text-2)', fontSize: '1.125rem' }}
        >
          ⚙
        </button>
      </div>

      {/* Profile switcher */}
      <div style={{ padding: '0 1rem 1rem' }}>
        <ProfileSwitcher />
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid var(--sp-border)', margin: '0 0.75rem' }} />

      <StatReadout />
      <SlotTracker />

      <div style={{ padding: '1rem 0 0.5rem', flex: 1 }}>
        <div style={{ padding: '0 1rem 0.5rem', fontSize: '0.6875rem', color: 'var(--sp-label)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
          Spellbooks
        </div>
        <SpellbookTabs variant="desktop" />
      </div>
    </aside>
  );
}
