import Logo from './Logo';
import { C } from '../constants';

export default function AppFooter({ navigate, isAdmin }) {
  const linkStyle = {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.45)',
    cursor: 'pointer',
    fontSize: '0.82rem',
    padding: 0,
  };

  return (
    <footer
      style={{
        background: C.forest,
        color: 'rgba(255,255,255,0.6)',
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div
        style={{
          marginBottom: '0.6rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.8rem',
        }}
      >
        <Logo size={1.4} color="white" />
        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '1.1rem' }}>—</span>
        <span
          style={{
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            fontSize: '1.05rem',
            color: 'rgba(255,255,255,0.55)',
            letterSpacing: '0.04em',
          }}
        >
          rent it all.
        </span>
      </div>
      <p style={{ margin: '0 0 0.75rem', fontSize: '0.9rem' }}>
        Nachhaltig mieten &amp; vermieten in deiner Stadt.
      </p>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1.5rem',
          marginBottom: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <button onClick={() => navigate('support')} style={linkStyle}>
          Support
        </button>
        <button onClick={() => navigate('agb')} style={linkStyle}>
          AGB
        </button>
        <button onClick={() => navigate('impressum')} style={linkStyle}>
          Impressum
        </button>
        <button onClick={() => navigate('datenschutz')} style={linkStyle}>
          Datenschutz
        </button>
        {isAdmin && (
          <button
            onClick={() => navigate('admin')}
            style={{ ...linkStyle, color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}
          >
            Admin
          </button>
        )}
      </div>
      <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>
        © 2026 ria · Paderborn
      </p>
    </footer>
  );
}
