import { Component } from 'react';
import { C } from '../constants';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ria ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", background: C.cream, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
          <div style={{ maxWidth: 480 }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>😕</div>
            <h1 style={{ color: C.forest, fontSize: "1.8rem", marginBottom: "0.75rem", letterSpacing: "-0.02em" }}>Da ist etwas schiefgelaufen</h1>
            <p style={{ color: C.muted, lineHeight: 1.7, marginBottom: "2rem", fontSize: "0.95rem" }}>
              Ein unerwarteter Fehler ist aufgetreten. Lade die Seite neu — deine Daten sind sicher.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{ background: "linear-gradient(135deg, #163126, #1C3A2E)", color: "white", padding: "1rem 2rem", borderRadius: 14, border: "none", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem", boxShadow: "0 12px 28px rgba(28,58,46,0.22)", marginRight: "0.75rem" }}
            >
              Seite neu laden
            </button>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{ background: "white", color: C.forest, padding: "1rem 2rem", borderRadius: 14, border: `1px solid ${C.line}`, fontWeight: 700, cursor: "pointer", fontSize: "0.95rem" }}
            >
              Nochmal versuchen
            </button>
            {import.meta.env.DEV && this.state.error && (
              <pre style={{ marginTop: "1.5rem", background: "rgba(196,113,74,0.08)", border: `1px solid ${C.terra}`, borderRadius: 12, padding: "1rem", textAlign: "left", fontSize: "0.75rem", color: C.terra, overflow: "auto", maxHeight: 200 }}>
                {this.state.error.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
