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
    <div className="flex gap-1.5 overflow-x-auto pb-1">
      {PILLS.map((pill) => (
        <button
          key={pill.value}
          onClick={() => onChange(pill.value)}
          aria-pressed={value === pill.value}
          className="flex-shrink-0 px-3 py-1 rounded-full text-xs border transition-colors"
          style={
            value === pill.value
              ? {
                  backgroundColor: 'var(--sp-pink-hot)',
                  color: '#fff',
                  borderColor: 'var(--sp-pink-hot)',
                }
              : {
                  backgroundColor: 'transparent',
                  color: 'var(--sp-plum)',
                  borderColor: 'var(--sp-pink-soft)',
                }
          }
        >
          {pill.label}
        </button>
      ))}
    </div>
  );
};
