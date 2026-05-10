import { useState } from 'react';
import { useApp } from './SpellbookApp';

export default function ProfileBar() {
  const { state, dispatch, activeProfile, setSettingsOpen } = useApp();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  function handleSelectProfile(id: string) {
    dispatch({ type: 'SET_ACTIVE_PROFILE', profileId: id });
    setProfileMenuOpen(false);
  }

  function handleSelectSpellbook(id: string) {
    dispatch({ type: 'SET_ACTIVE_SPELLBOOK', spellbookId: id });
  }

  function handleCreateSpellbook() {
    const name = prompt('Spellbook name:');
    if (!name?.trim()) return;
    dispatch({ type: 'CREATE_SPELLBOOK', name: name.trim() });
  }

  return (
    <header className="sticky top-0 z-10">
      {/* Row 1: logo + profile selector + gear */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ background: 'linear-gradient(135deg, #f72585 0%, #ff85c2 100%)' }}
      >
        <div className="flex items-center gap-2">
          {/* Crescent moon SVG */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M17 13A8 8 0 1 1 7 3a6 6 0 0 0 10 10z" fill="#fff" />
          </svg>
          <span className="font-cinzel font-bold text-sm" style={{ color: '#fff' }}>Spellbook</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Profile dropdown */}
          <div className="relative">
            <button
              className="flex items-center gap-1 text-sm font-cinzel px-2 py-1 rounded border"
              style={{ color: '#fff', borderColor: '#fff' }}
              onClick={() => setProfileMenuOpen(o => !o)}
              aria-haspopup="listbox"
              aria-expanded={profileMenuOpen}
            >
              {activeProfile?.name ?? 'No profile'}
              <span aria-hidden="true">▾</span>
            </button>
            {profileMenuOpen && (
              <div
                className="absolute right-0 mt-1 min-w-[140px] rounded border shadow-lg z-20"
                style={{ backgroundColor: 'var(--sp-card)', borderColor: 'var(--sp-pink-soft)' }}
                role="listbox"
              >
                {state.profiles.map(p => (
                  <button
                    key={p.id}
                    className="w-full text-left px-3 py-2 text-sm"
                    style={{
                      color: 'var(--sp-plum)',
                      fontWeight: p.id === state.activeProfileId ? 700 : 400,
                      backgroundColor: p.id === state.activeProfileId ? 'var(--sp-badge-bg)' : undefined,
                    }}
                    role="option"
                    aria-selected={p.id === state.activeProfileId}
                    onClick={() => handleSelectProfile(p.id)}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Gear icon */}
          <button
            aria-label="Settings"
            className="text-lg leading-none"
            style={{ color: '#fff' }}
            onClick={() => setSettingsOpen(true)}
          >
            ⚙
          </button>
        </div>
      </div>

      {/* Row 2: spellbook tabs */}
      {activeProfile && (
        <div
          className="flex items-center gap-1 px-4 pb-2 pt-1 overflow-x-auto"
          style={{ background: 'linear-gradient(135deg, #c41068 0%, #9b0050 100%)' }}
        >
          {activeProfile.spellbooks.map(sb => (
            <button
              key={sb.id}
              className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-cinzel border transition-colors"
              style={{
                backgroundColor: sb.id === activeProfile.activeSpellbookId ? '#fff' : 'transparent',
                color: sb.id === activeProfile.activeSpellbookId ? '#f72585' : '#fff',
                borderColor: '#fff',
              }}
              aria-current={sb.id === activeProfile.activeSpellbookId ? 'true' : undefined}
              onClick={() => handleSelectSpellbook(sb.id)}
            >
              {sb.name}
            </button>
          ))}
          <button
            className="flex-shrink-0 px-2 py-1 rounded-full text-xs border"
            style={{ color: '#fff', borderColor: '#fff' }}
            aria-label="New spellbook"
            onClick={handleCreateSpellbook}
          >
            +
          </button>
        </div>
      )}
    </header>
  );
}
