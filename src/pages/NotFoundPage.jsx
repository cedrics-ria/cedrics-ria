import { C } from '../constants';
import { primaryButtonStyle } from '../styles';

export default function NotFoundPage({ goTo }) {
  return (
    <div
      style={{
        minHeight: '70vh',
        background: C.cream,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 1.5rem',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 420 }}>
        <div style={{ fontSize: '5rem', lineHeight: 1, marginBottom: '1rem' }}>📦</div>
        <h1 style={{ color: C.forest, fontSize: '2rem', margin: '0 0 0.75rem' }}>
          Seite nicht gefunden
        </h1>
        <p style={{ color: C.muted, lineHeight: 1.7, margin: '0 0 2rem', fontSize: '1rem' }}>
          Die Seite, die du suchst, existiert nicht oder wurde verschoben.
        </p>
        <button onClick={() => goTo('home')} style={{ ...primaryButtonStyle, padding: '0.9rem 2rem', borderRadius: 999, fontSize: '0.97rem' }}>
          Zur Startseite
        </button>
      </div>
    </div>
  );
}
