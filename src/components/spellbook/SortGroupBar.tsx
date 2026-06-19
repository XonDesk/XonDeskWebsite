export type GroupBy = 'level' | 'school';
export type SortBy = 'name' | 'level';

interface SortGroupBarProps {
  groupBy: GroupBy;
  sortBy: SortBy;
  favoritesActive: boolean;
  combatActive: boolean;
  onGroupChange: (g: GroupBy) => void;
  onSortChange: (s: SortBy) => void;
  onFavoritesToggle: () => void;
  onCombatToggle: () => void;
}

const selectStyle: React.CSSProperties = {
  background: 'var(--sp-card)',
  border: '1px solid var(--sp-border)',
  borderRadius: '0.5rem',
  color: 'var(--sp-text)',
  padding: '0.25rem 0.5rem',
  fontSize: '0.8125rem',
  fontFamily: 'Inter, sans-serif',
  cursor: 'pointer',
  outline: 'none',
};

export default function SortGroupBar({
  groupBy, sortBy, favoritesActive, combatActive,
  onGroupChange, onSortChange, onFavoritesToggle, onCombatToggle,
}: SortGroupBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        borderBottom: '1px solid var(--sp-border)',
        background: 'var(--sp-bg)',
        flexWrap: 'wrap',
      }}
    >
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--sp-label)' }}>
        Group
        <select value={groupBy} onChange={e => onGroupChange(e.target.value as GroupBy)} style={selectStyle}>
          <option value="level">Level</option>
          <option value="school">School</option>
        </select>
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--sp-label)' }}>
        Sort
        <select value={sortBy} onChange={e => onSortChange(e.target.value as SortBy)} style={selectStyle}>
          <option value="name">Name</option>
          <option value="level">Level</option>
        </select>
      </label>

      <div style={{ display: 'flex', gap: '0.375rem', marginLeft: 'auto' }}>
        <button
          type="button"
          onClick={onFavoritesToggle}
          style={{
            padding: '0.25rem 0.625rem',
            borderRadius: '999px',
            border: favoritesActive ? '1px solid var(--sp-accent)' : '1px solid var(--sp-border)',
            background: favoritesActive ? 'var(--sp-accent-muted)' : 'transparent',
            color: favoritesActive ? 'var(--sp-accent)' : 'var(--sp-label)',
            fontSize: '0.8125rem',
            cursor: 'pointer',
            fontWeight: favoritesActive ? 600 : 400,
          }}
        >
          ★ Favorites
        </button>
        <button
          type="button"
          onClick={onCombatToggle}
          style={{
            padding: '0.25rem 0.625rem',
            borderRadius: '999px',
            border: combatActive ? '1px solid var(--sp-accent)' : '1px solid var(--sp-border)',
            background: combatActive ? 'var(--sp-accent-muted)' : 'transparent',
            color: combatActive ? 'var(--sp-accent)' : 'var(--sp-label)',
            fontSize: '0.8125rem',
            cursor: 'pointer',
            fontWeight: combatActive ? 600 : 400,
          }}
        >
          ⚔ Combat
        </button>
      </div>
    </div>
  );
}
