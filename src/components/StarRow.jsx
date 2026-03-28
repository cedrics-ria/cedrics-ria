import { C } from '../constants';

export default function StarRow({
  value,
  size = 18,
  interactive = false,
  onHover,
  onLeave,
  onClick,
}) {
  return (
    <div style={{ display: 'flex', gap: '0.1rem' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{
            fontSize: size,
            color: i <= value ? C.gold : 'rgba(0,0,0,0.15)',
            cursor: interactive ? 'pointer' : 'default',
            lineHeight: 1,
            transition: 'color 0.1s ease',
            userSelect: 'none',
          }}
          onMouseEnter={interactive ? () => onHover(i) : undefined}
          onMouseLeave={interactive ? onLeave : undefined}
          onClick={interactive ? () => onClick(i) : undefined}
        >
          ★
        </span>
      ))}
    </div>
  );
}
