import { C } from '../constants';

export default function OnboardingModal({ user, onClose, goTo }) {
  return (
    <div
      role="presentation"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        animation: 'fadeUp 0.3s ease',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        style={{
          background: 'white',
          borderRadius: 28,
          padding: '2.5rem',
          maxWidth: 520,
          width: '100%',
          boxShadow: '0 40px 80px rgba(0,0,0,0.25)',
          animation: 'fadeUp 0.4s 0.1s both',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 70,
            height: 70,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #163126, #1C3A2E)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            fontSize: '1.6rem',
            fontWeight: 800,
          }}
        >
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
        <div
          style={{
            display: 'inline-block',
            padding: '0.35rem 0.85rem',
            borderRadius: 999,
            background: '#EAF0EB',
            color: '#1C3A2E',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: '1rem',
          }}
        >
          Willkommen bei ria
        </div>
        <h2
          id="onboarding-title"
          style={{
            color: '#1C3A2E',
            fontSize: '1.9rem',
            marginTop: 0,
            marginBottom: '0.75rem',
            letterSpacing: '-0.03em',
          }}
        >
          Hey {user?.name?.split(' ')[0]}!
        </h2>
        <p style={{ color: '#7A7470', lineHeight: 1.7, marginBottom: '2rem', fontSize: '1rem' }}>
          Schön, dass du dabei bist. Du kannst jetzt Inserate durchstöbern, eigene Sachen verleihen
          und mit anderen in Kontakt treten.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '0.75rem',
            marginBottom: '2rem',
          }}
        >
          {[
            ['Mieten', 'Stöbere durch hunderte Inserate in deiner Stadt.'],
            ['Verleihen', 'Erstelle ein Inserat und verdiene nebenbei.'],
            ['Verbinden', 'Schreibe direkt und kläre alles persönlich.'],
          ].map(([t, d]) => (
            <div
              key={t}
              style={{ background: '#EAF0EB', borderRadius: 16, padding: '1rem 0.75rem' }}
            >
              <div
                style={{
                  fontWeight: 800,
                  color: '#1C3A2E',
                  marginBottom: '0.35rem',
                  fontSize: '0.95rem',
                }}
              >
                {t}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#7A7470', lineHeight: 1.5 }}>{d}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => {
              goTo('listings');
              onClose();
            }}
            style={{
              flex: 1,
              background: '#1C3A2E',
              color: 'white',
              padding: '1rem',
              borderRadius: 14,
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.95rem',
            }}
          >
            Inserate entdecken
          </button>
          <button
            onClick={() => {
              goTo('create-listing');
              onClose();
            }}
            style={{
              flex: 1,
              background: '#C4714A',
              color: 'white',
              padding: '1rem',
              borderRadius: 14,
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.95rem',
            }}
          >
            Inserat erstellen
          </button>
        </div>
        <button
          onClick={onClose}
          style={{
            marginTop: '1rem',
            background: 'none',
            border: 'none',
            color: '#7A7470',
            cursor: 'pointer',
            fontSize: '0.88rem',
          }}
        >
          Später
        </button>
      </div>
    </div>
  );
}
