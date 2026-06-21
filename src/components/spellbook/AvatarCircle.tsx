interface AvatarCircleProps {
  hue: number;
  name: string;
  size?: number;
}

export default function AvatarCircle({ hue, name, size = 44 }: AvatarCircleProps) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `oklch(65% 0.22 ${hue})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 600,
        fontSize: size * 0.36,
        flexShrink: 0,
        userSelect: 'none',
      }}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
