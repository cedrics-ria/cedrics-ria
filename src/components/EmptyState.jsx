import { C } from '../constants';

export default function EmptyState({ title, text, buttonLabel, onClick }) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: 24,
        border: `1px solid ${C.line}`,
        boxShadow: C.shadow,
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: C.sageLight,
          margin: '0 auto 0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C12 2 4 6 4 13c0 4.4 3.6 8 8 8s8-3.6 8-8c0-7-8-11-8-11z" fill={C.sage} />
          <path d="M12 21V11" stroke={C.forest} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <h3 style={{ color: C.forest, marginTop: 0, marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ color: C.muted, maxWidth: 520, margin: '0 auto 1.25rem', lineHeight: 1.7 }}>
        {text}
      </p>
      {buttonLabel ? (
        <button
          onClick={onClick}
          style={{
            background: C.terra,
            color: 'white',
            padding: '0.9rem 1.2rem',
            borderRadius: 12,
            border: 'none',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {buttonLabel}
        </button>
      ) : null}
    </div>
  );
}
