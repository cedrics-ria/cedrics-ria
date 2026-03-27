import { useState } from 'react';
import { C } from '../constants';
import { inputBaseStyle, primaryButtonStyle, applyInputFocus, resetInputFocus } from '../styles';
import Logo from '../components/Logo';
import { supabase } from '../supabase';

export default function ResetPasswordPage({ onDone }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 6) { setError("Mindestens 6 Zeichen."); return; }
    if (password !== confirm) { setError("Passwörter stimmen nicht überein."); return; }
    setSaving(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (err) { setError(err.message); return; }
    setDone(true);
    setTimeout(() => onDone && onDone(), 2000);
  }

  return (
    <div style={{ minHeight: "100vh", background: C.cream, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1.5rem" }}>
      <div style={{ background: "white", borderRadius: 28, padding: "2.5rem 2rem", maxWidth: 440, width: "100%", boxShadow: C.shadow, border: `1px solid ${C.line}`, textAlign: "center" }}>
        {done ? (
          <>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: C.sageLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem", fontSize: "1.6rem" }}>✓</div>
            <h2 style={{ color: C.forest, margin: "0 0 0.5rem" }}>Passwort gespeichert!</h2>
            <p style={{ color: C.muted }}>Du wirst weitergeleitet…</p>
          </>
        ) : (
          <>
            <div style={{ marginBottom: "1.5rem" }}><Logo size={1.8} color={C.forest} /></div>
            <p style={{ fontSize: "0.75rem", letterSpacing: "0.14em", textTransform: "uppercase", color: C.sage, fontWeight: 700, marginBottom: "0.4rem" }}>Neues Passwort</p>
            <h2 style={{ color: C.forest, margin: "0 0 1.5rem", fontSize: "1.6rem", letterSpacing: "-0.02em" }}>Passwort festlegen</h2>
            {error && <div style={{ padding: "0.75rem 1rem", borderRadius: 12, background: "rgba(196,113,74,0.1)", color: C.terra, fontWeight: 600, marginBottom: "1rem", fontSize: "0.88rem" }}>{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Neues Passwort (min. 6 Zeichen)" onFocus={applyInputFocus} onBlur={resetInputFocus} style={inputBaseStyle} />
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Passwort wiederholen" onFocus={applyInputFocus} onBlur={resetInputFocus} style={inputBaseStyle} />
              <button type="submit" disabled={saving} style={{ ...primaryButtonStyle, opacity: saving ? 0.7 : 1 }}>
                {saving ? "Speichert…" : "Passwort speichern"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
