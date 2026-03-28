import { Component } from 'react';
import { C } from '../constants';

/**
 * Per-page error boundary — catches runtime errors in lazy-loaded pages
 * so a single broken page doesn't crash the entire app.
 */
export default class PageErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error('[PageErrorBoundary]', error, info.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 20,
              padding: '2.5rem 2rem',
              maxWidth: 440,
              border: `1px solid rgba(196,113,74,0.25)`,
              boxShadow: C.shadow,
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ color: C.forest, margin: '0 0 0.75rem', fontSize: '1.2rem' }}>
              Diese Seite konnte nicht geladen werden
            </h2>
            <p style={{ color: C.muted, fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
              Ein unerwarteter Fehler ist aufgetreten. Bitte lade die Seite neu oder geh zurück.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                style={{
                  padding: '0.7rem 1.25rem',
                  borderRadius: 12,
                  border: `1px solid ${C.line}`,
                  background: 'white',
                  color: C.forest,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                }}
              >
                Erneut versuchen
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.7rem 1.25rem',
                  borderRadius: 12,
                  border: 'none',
                  background: `linear-gradient(135deg, ${C.forest}, #163126)`,
                  color: 'white',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                }}
              >
                Seite neu laden
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
