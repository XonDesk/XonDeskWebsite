interface SpellbookBackgroundProps {
  background: 'clouds' | 'starfield' | 'clean';
}

const SPARKLES = [
  { top: '14%', left:  '8%', size: 8, opacity: 0.7 },
  { top:  '8%', left: '82%', size: 6, opacity: 0.6 },
  { top: '40%', left: '93%', size: 4, opacity: 0.6 },
  { top: '72%', left:  '5%', size: 5, opacity: 0.5 },
  { top: '88%', left: '72%', size: 7, opacity: 0.7 },
  { top: '24%', left: '48%', size: 3, opacity: 0.5 },
];

const STARS = [
  { top:  '5%', left: '12%', r: 2 }, { top:  '9%', left: '67%', r: 3 },
  { top: '15%', left: '38%', r: 2 }, { top: '18%', left: '82%', r: 2 },
  { top: '22%', left:  '5%', r: 3 }, { top: '27%', left: '55%', r: 2 },
  { top: '31%', left: '91%', r: 2 }, { top: '35%', left: '25%', r: 3 },
  { top: '42%', left: '73%', r: 2 }, { top: '48%', left: '10%', r: 2 },
  { top: '53%', left: '48%', r: 3 }, { top: '58%', left: '86%', r: 2 },
  { top: '63%', left: '32%', r: 2 }, { top: '67%', left: '62%', r: 3 },
  { top: '71%', left: '18%', r: 2 }, { top: '76%', left: '79%', r: 2 },
  { top: '81%', left: '44%', r: 3 }, { top: '85%', left:  '7%', r: 2 },
  { top: '90%', left: '93%', r: 2 }, { top: '95%', left: '58%', r: 3 },
];

export default function SpellbookBackground({ background }: SpellbookBackgroundProps) {
  if (background === 'clean') return null;

  if (background === 'clouds') {
    return (
      <div
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}
      >
        <div style={{
          position: 'absolute', inset: 0,
          background: [
            'radial-gradient(40% 30% at 10% 18%, rgba(255,255,255,0.9), transparent 60%)',
            'radial-gradient(45% 35% at 90% 10%, rgba(255,255,255,0.8), transparent 65%)',
            'radial-gradient(60% 40% at 50% 100%, rgba(255,255,255,0.95), transparent 60%)',
            'radial-gradient(35% 25% at 15% 85%, rgba(255,235,245,0.9), transparent 70%)',
          ].join(','),
        }} />
        {SPARKLES.map((p, i) => (
          <span
            key={i}
            style={{
              position: 'absolute', top: p.top, left: p.left,
              fontSize: p.size, opacity: p.opacity, color: '#fff',
              filter: 'drop-shadow(0 0 3px #fff)',
              pointerEvents: 'none', userSelect: 'none', lineHeight: 1,
            }}
          >
            ✦
          </span>
        ))}
      </div>
    );
  }

  // starfield
  return (
    <div
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}
    >
      {STARS.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute', top: s.top, left: s.left,
            width: s.r * 2, height: s.r * 2, borderRadius: '50%',
            background: '#ff85c2', opacity: 0.5, filter: 'blur(0.5px)',
          }}
        />
      ))}
      <svg
        aria-hidden="true"
        style={{ position: 'absolute', top: '6%', right: '8%' }}
        width="28"
        height="28"
        viewBox="0 0 20 20"
      >
        <path d="M17 13A8 8 0 1 1 7 3a6 6 0 0 0 10 10z" fill="rgba(255,133,194,0.3)" />
      </svg>
    </div>
  );
}
