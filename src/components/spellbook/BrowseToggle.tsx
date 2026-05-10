import { useApp } from './SpellbookApp';

export default function BrowseToggle() {
  const { browseMode, setBrowseMode } = useApp();
  return (
    <div className="flex rounded-full border overflow-hidden text-xs font-cinzel" style={{ borderColor: 'var(--sp-pink-hot)' }} role="group" aria-label="View mode">
      {(['mine', 'all'] as const).map(mode => (
        <button
          key={mode}
          className="px-3 py-1 transition-colors"
          style={{
            backgroundColor: browseMode === mode ? 'var(--sp-pink-hot)' : 'transparent',
            color: browseMode === mode ? '#fff' : 'var(--sp-plum)',
          }}
          aria-pressed={browseMode === mode}
          onClick={() => setBrowseMode(mode)}
        >
          {mode === 'mine' ? 'My Spellbook' : 'Browse All'}
        </button>
      ))}
    </div>
  );
}
