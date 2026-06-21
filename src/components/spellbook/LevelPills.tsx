import React from 'react';

interface LevelPillsProps {
  value: string;
  onChange: (value: string) => void;
}

const PILLS = [
  { label: 'All', value: 'all' },
  { label: 'Cantrip', value: 'cantrip' },
  ...Array.from({ length: 9 }, (_, i) => ({
    label: `Lvl ${i + 1}`,
    value: String(i + 1),
  })),
];

export const LevelPills: React.FC<LevelPillsProps> = ({ value, onChange }) => {
  return (
    <div style={{ display: 'flex', gap: '0.375rem', overflowX: 'auto', padding: '0.625rem 14px 0.375rem' }}>
      {PILLS.map((pill) => {
        const active = value === pill.value;
        return (
          <button
            key={pill.value}
            onClick={() => onChange(pill.value)}
            aria-pressed={active}
            style={{
              flexShrink: 0,
              padding: '5px 12px',
              borderRadius: '999px',
              cursor: 'pointer',
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '0.75rem',
              letterSpacing: '0.06em',
              border: active ? 'none' : '1px solid var(--sp-pink-soft)',
              background: active
                ? 'linear-gradient(135deg, var(--sp-pink-hot), var(--sp-accent-mid))'
                : 'transparent',
              color: active ? '#fff' : 'var(--sp-plum)',
            }}
          >
            {pill.label}
          </button>
        );
      })}
    </div>
  );
};
