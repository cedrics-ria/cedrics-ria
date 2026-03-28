import { C } from '../constants';

/**
 * VerifiedBadge
 * variant: "email" (default) — shown for email-confirmed accounts
 * variant: "phone" — shown for accounts with a phone number saved
 */
export default function VerifiedBadge({ small = false, variant = 'email' }) {
  const isPhone = variant === 'phone';

  return (
    <span
      title={isPhone ? 'Handynummer verifiziert' : 'Verifiziertes Konto'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.2rem',
        background: isPhone ? 'rgba(200,169,107,0.15)' : 'rgba(28,58,46,0.10)',
        color: isPhone ? C.gold : C.forest,
        borderRadius: 999,
        padding: small ? '0.12rem 0.45rem' : '0.2rem 0.6rem',
        fontSize: small ? '0.63rem' : '0.72rem',
        fontWeight: 700,
        letterSpacing: '0.02em',
        verticalAlign: 'middle',
      }}
    >
      {isPhone ? (
        <svg
          width={small ? 8 : 9}
          height={small ? 8 : 9}
          viewBox="0 0 24 24"
          fill="none"
          stroke={C.gold}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.56 3.42 2 2 0 0 1 3.55 1.25h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.79a16 16 0 0 0 6.29 6.29l.87-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ) : (
        <svg width={small ? 8 : 9} height={small ? 8 : 9} viewBox="0 0 10 10">
          <polyline
            points="1.5,5.5 4,8 8.5,2"
            stroke={C.forest}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {!small && (isPhone ? '✓ Verifiziert' : 'Verifiziert')}
    </span>
  );
}
