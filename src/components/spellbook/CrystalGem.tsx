interface CrystalGemProps {
  filled: boolean;
  onClick: () => void;
  size?: number;
}

const GEM_GRADIENT_ID = 'gem-fill-gradient';

export default function CrystalGem({ filled, onClick, size = 20 }: CrystalGemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={filled ? 'Use spell slot' : 'Restore spell slot'}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width={size} height={size} viewBox="0 0 14 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={GEM_GRADIENT_ID} x1="7" y1="0.5" x2="7" y2="19.5" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--sp-accent-mid)" />
            <stop offset="100%" stopColor="var(--sp-accent)" />
          </linearGradient>
        </defs>
        <polygon
          points="7,0.5 13,7 7,19.5 1,7"
          fill={filled ? `url(#${GEM_GRADIENT_ID})` : 'none'}
          stroke={filled ? 'none' : 'var(--sp-border-strong)'}
          strokeWidth={filled ? 0 : 1.5}
          opacity={filled ? 1 : 0.45}
          style={filled ? { filter: 'drop-shadow(0 0 4px var(--sp-accent-muted))' } : undefined}
        />
      </svg>
    </button>
  );
}
