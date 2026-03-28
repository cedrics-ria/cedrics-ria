import { C } from '../constants';

export default function Logo({ size = 1.9, color = C.forest }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.05em' }}>
      <span
        style={{ fontFamily: 'Georgia, serif', fontSize: size + 'rem', fontWeight: 700, color }}
      >
        r
      </span>
      <span
        style={{
          position: 'relative',
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: size + 'rem',
            fontWeight: 700,
            fontStyle: 'italic',
            color,
          }}
        >
          ı
        </span>
        <span
          style={{
            position: 'absolute',
            top: '-0.15em',
            animation: 'sway 3s ease-in-out infinite',
            transformOrigin: 'bottom center',
          }}
        >
          <svg width={size * 5.5} height={size * 7} viewBox="0 0 10 13" fill="none">
            <path
              d="M5 1C5 1 1 3.5 1 7C1 9.8 2.8 11.8 5 12.5C7.2 11.8 9 9.8 9 7C9 3.5 5 1 5 1Z"
              fill={C.sage}
            />
            <path
              d="M5 12.5V6"
              stroke={color === 'white' ? C.forest : 'white'}
              strokeWidth="0.8"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </span>
      <span
        style={{
          fontFamily: 'Georgia, serif',
          fontSize: size + 'rem',
          fontWeight: 700,
          fontStyle: 'italic',
          color,
        }}
      >
        a
      </span>
    </div>
  );
}
