import { C } from '../constants';

/**
 * DSGVO/TTDSG-konformes Cookie-/Consent-Banner.
 * Zeigt sich beim ersten Besuch. Speichert die Entscheidung in localStorage.
 *
 * @param {{ onConsent: (choice: 'all' | 'necessary') => void, goTo: (page: string) => void }} props
 */
export default function CookieConsent({ onConsent, goTo }) {
  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie-Einstellungen"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: C.forest,
        color: 'white',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.18)',
      }}
    >
      <p style={{ flex: '1 1 260px', margin: 0, fontSize: '0.88rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.88)' }}>
        Wir nutzen technisch notwendige Cookies (Login-Session) sowie anonymisierte Nutzungsstatistiken (Vercel Analytics — ohne persönliche Identifikation).{' '}
        <button
          onClick={() => goTo('datenschutz')}
          style={{ background: 'none', border: 'none', color: '#7A9E7E', cursor: 'pointer', padding: 0, fontSize: 'inherit', textDecoration: 'underline' }}
        >
          Mehr erfahren
        </button>
      </p>
      <div style={{ display: 'flex', gap: '0.65rem', flexShrink: 0, flexWrap: 'wrap' }}>
        <button
          onClick={() => onConsent('necessary')}
          style={{
            padding: '0.65rem 1.1rem',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.35)',
            background: 'transparent',
            color: 'rgba(255,255,255,0.8)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          Nur notwendige
        </button>
        <button
          onClick={() => onConsent('all')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: 10,
            border: 'none',
            background: '#7A9E7E',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}
        >
          Alle akzeptieren
        </button>
      </div>
    </div>
  );
}
