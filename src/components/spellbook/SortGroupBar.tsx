import React from 'react';

export type GroupBy = 'none' | 'level' | 'school';
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

function Pill({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flexShrink: 0,
        padding: '4px 12px',
        borderRadius: '999px',
        cursor: 'pointer',
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: '0.8125rem',
        border: active ? '1px solid var(--sp-accent)' : '1px solid var(--sp-border)',
        background: active ? 'var(--sp-accent-muted)' : 'transparent',
        color: active ? 'var(--sp-accent)' : 'var(--sp-label)',
        fontWeight: active ? 600 : 400,
      }}
    >
      {children}
    </button>
  );
}

export default function SortGroupBar({
  groupBy, sortBy, favoritesActive, combatActive,
  onGroupChange, onSortChange, onFavoritesToggle, onCombatToggle,
}: SortGroupBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.375rem 14px 0.5rem',
        overflowX: 'auto',
      }}
    >
      <span
        style={{
          flexShrink: 0,
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '0.6875rem',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--sp-label)',
          paddingRight: '0.125rem',
        }}
      >
        Group
      </span>

      <Pill active={groupBy === 'none'} onClick={() => onGroupChange('none')}>None</Pill>
      <Pill active={groupBy === 'level'} onClick={() => onGroupChange('level')}>Level</Pill>
      <Pill active={groupBy === 'school'} onClick={() => onGroupChange('school')}>School</Pill>

      <Pill
        active={false}
        onClick={() => onSortChange(sortBy === 'level' ? 'name' : 'level')}
      >
        Sort: {sortBy === 'level' ? 'Level' : 'Name'}
      </Pill>

      <Pill active={favoritesActive} onClick={onFavoritesToggle}>★ Favorites</Pill>
      <Pill active={combatActive} onClick={onCombatToggle}>✗ Combat</Pill>
    </div>
  );
}
