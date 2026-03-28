import { useState } from 'react';
import { C } from '../constants';
import { inputBaseStyle, primaryButtonStyle, applyInputFocus, resetInputFocus } from '../styles';
import Logo from '../components/Logo';
import { supabase } from '../supabase';

export default function LoginPage({ onLogin, currentUser }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [agbAccepted, setAgbAccepted] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError('Bitte E-Mail und Passwort ausfüllen.');
      setLoading(false);
      return;
    }
    if (mode === 'register' && !name.trim()) {
      setError('Bitte auch deinen Namen angeben.');
      setLoading(false);
      return;
    }

    if (mode === 'register') {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: { data: { name: name.trim() } },
      });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      if (!data.user) {
        setError('Registrierung fehlgeschlagen.');
        return;
      }
      // Email confirmation required – show verification screen instead of logging in
      setRegisteredEmail(data.user.email);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (!data.user) {
      setError('Login fehlgeschlagen.');
      return;
    }
    onLogin(
      { id: data.user.id, name: data.user.user_metadata?.name || 'User', email: data.user.email },
      false
    );
  }

  const benefits = [
    [
      'Kostenlos inserieren',
      'Erstelle unbegrenzt Inserate und verdiene mit dem, was du bereits hast.',
    ],
    ['Direkt kontaktieren', 'Kein Mittelsmann — kommuniziere direkt mit Verleihern und Mietern.'],
    ['Nachhaltig & lokal', 'Jede Miete spart CO₂. Gut für dich und den Planeten.'],
  ];

  // ── Email-verification screen ─────────────────────────────────────────────
  if (registeredEmail) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: C.cream,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1.5rem',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 480,
            background: 'white',
            borderRadius: 24,
            padding: '3rem 2.5rem',
            boxShadow: '0 8px 40px rgba(28,58,46,0.1)',
            textAlign: 'center',
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #e8f4ec, #d4ead9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.75rem',
            }}
          >
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
              <rect x="3" y="7" width="28" height="20" rx="3" stroke="#1C3A2E" strokeWidth="2" fill="none"/>
              <polyline points="3,7 17,19 31,7" stroke="#1C3A2E" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <Logo size={1.6} />
          <h1
            style={{
              fontSize: '1.65rem',
              color: C.forest,
              margin: '1.25rem 0 0.6rem',
              letterSpacing: '-0.02em',
            }}
          >
            Fast geschafft!
          </h1>
          <p style={{ color: C.muted, lineHeight: 1.7, marginBottom: '1.75rem', fontSize: '0.95rem' }}>
            Wir haben eine Bestätigungs-E-Mail an{' '}
            <strong style={{ color: C.forest }}>{registeredEmail}</strong> gesendet.
            <br />
            Klicke auf den Link in der E-Mail, um deinen Account zu aktivieren.
          </p>

          {/* Steps */}
          <div
            style={{
              background: C.cream,
              borderRadius: 14,
              padding: '1.25rem 1.5rem',
              textAlign: 'left',
              marginBottom: '2rem',
            }}
          >
            {[
              ['1', 'Öffne dein E-Mail-Postfach'],
              ['2', 'Suche nach einer E-Mail von ria'],
              ['3', 'Klicke auf „E-Mail bestätigen"'],
              ['4', 'Melde dich dann hier an'],
            ].map(([num, text]) => (
              <div
                key={num}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  marginBottom: num === '4' ? 0 : '0.85rem',
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: C.forest,
                    color: 'white',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {num}
                </div>
                <span style={{ fontSize: '0.9rem', color: C.ink }}>{text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => { setRegisteredEmail(''); setMode('login'); }}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #163126, #1C3A2E)',
              color: 'white',
              padding: '1rem',
              borderRadius: 14,
              border: 'none',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(28,58,46,0.2)',
            }}
          >
            Zum Login
          </button>

          <p style={{ color: C.muted, fontSize: '0.82rem', marginTop: '1.25rem', lineHeight: 1.6 }}>
            Keine E-Mail erhalten? Schau auch im Spam-Ordner nach.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: C.cream, display: 'flex' }}>
      {/* Left panel - branding */}
      <div
        className="ria-login-left"
        style={{
          flex: '0 0 42%',
          background: 'linear-gradient(160deg, #163126 0%, #1C3A2E 60%, #244536 100%)',
          padding: '4rem 3rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'rgba(200,169,107,0.07)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -60,
            left: -40,
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: 'rgba(122,158,126,0.08)',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <Logo size={2.2} color="white" />
            <div
              style={{
                marginTop: '0.05rem',
                fontSize: '0.85rem',
                fontStyle: 'italic',
                fontFamily: 'Georgia, serif',
                color: 'rgba(255,255,255,0.4)',
                letterSpacing: '0.08em',
              }}
            >
              rent it all.
            </div>
          </div>
          <h2
            style={{
              color: 'white',
              fontSize: '1.7rem',
              marginTop: 0,
              marginBottom: '0.75rem',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            {mode === 'register'
              ? 'Werde Teil der Gemeinschaft.'
              : 'Schön, dass du wieder da bist.'}
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.6)',
              lineHeight: 1.7,
              marginBottom: '2.5rem',
              fontSize: '0.95rem',
            }}
          >
            Paderborns Plattform für nachhaltige Nachbarschaftsmietgeschäfte.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {benefits.map(([title, desc]) => (
              <div key={title} style={{ display: 'flex', gap: '0.85rem', alignItems: 'start' }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: 'rgba(122,158,126,0.3)',
                    border: '1px solid rgba(122,158,126,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '0.1rem',
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 11 11">
                    <polyline
                      points="1.5,5.5 4.5,8.5 9.5,2.5"
                      stroke="#7A9E7E"
                      strokeWidth="1.8"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <div
                    style={{
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      marginBottom: '0.15rem',
                    }}
                  >
                    {title}
                  </div>
                  <div
                    style={{
                      color: 'rgba(255,255,255,0.55)',
                      fontSize: '0.82rem',
                      lineHeight: 1.5,
                    }}
                  >
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1.5rem',
        }}
      >
        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Tab toggle */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(28,58,46,0.06)',
              borderRadius: 14,
              padding: '0.3rem',
              marginBottom: '2rem',
              gap: '0.3rem',
            }}
          >
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError('');
                  setAgbAccepted(false);
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: 10,
                  border: 'none',
                  background: mode === m ? 'white' : 'transparent',
                  color: mode === m ? C.forest : C.muted,
                  fontWeight: mode === m ? 700 : 500,
                  cursor: 'pointer',
                  fontSize: '0.92rem',
                  boxShadow: mode === m ? '0 2px 10px rgba(28,58,46,0.1)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {m === 'login' ? 'Anmelden' : 'Registrieren'}
              </button>
            ))}
          </div>

          <h1
            style={{
              fontSize: '1.9rem',
              color: C.forest,
              marginTop: 0,
              marginBottom: '0.4rem',
              letterSpacing: '-0.02em',
            }}
          >
            {mode === 'login' ? 'Willkommen zurück' : 'Account erstellen'}
          </h1>
          <p
            style={{ color: C.muted, marginBottom: '1.75rem', fontSize: '0.9rem', lineHeight: 1.6 }}
          >
            {mode === 'login'
              ? 'Melde dich an, um Inserate zu verwalten und Nachrichten zu senden.'
              : 'In wenigen Sekunden dabei. Kostenlos und ohne Haken.'}
          </p>

          {currentUser && (
            <div
              style={{
                padding: '0.9rem 1rem',
                borderRadius: 14,
                background: C.sageLight,
                color: C.forest,
                fontWeight: 600,
                marginBottom: '1rem',
                fontSize: '0.9rem',
              }}
            >
              Eingeloggt als {currentUser.name}
            </div>
          )}
          {error && (
            <div
              id="login-error"
              role="alert"
              aria-live="assertive"
              style={{
                padding: '0.9rem 1rem',
                borderRadius: 14,
                background: 'rgba(196,113,74,0.12)',
                color: C.terra,
                fontWeight: 600,
                marginBottom: '1rem',
                fontSize: '0.88rem',
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            aria-label={mode === 'login' ? 'Anmeldeformular' : 'Registrierungsformular'}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            {mode === 'register' && (
              <div>
                <label
                  htmlFor="login-name"
                  style={{
                    display: 'block',
                    marginBottom: '0.4rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: C.forest,
                  }}
                >
                  Name{' '}
                  <span aria-hidden="true" style={{ color: C.terra }}>
                    *
                  </span>
                </label>
                <input
                  id="login-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="Dein Vorname"
                  autoComplete="name"
                  aria-required="true"
                  aria-invalid={!!error && !name}
                  aria-describedby={error ? 'login-error' : undefined}
                  onFocus={applyInputFocus}
                  onBlur={resetInputFocus}
                  style={inputBaseStyle}
                />
              </div>
            )}
            <div>
              <label
                htmlFor="login-email"
                style={{
                  display: 'block',
                  marginBottom: '0.4rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: C.forest,
                }}
              >
                E-Mail{' '}
                <span aria-hidden="true" style={{ color: C.terra }}>
                  *
                </span>
              </label>
              <input
                id="login-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="du@uni-paderborn.de"
                autoComplete="email"
                aria-required="true"
                aria-invalid={!!error}
                aria-describedby={error ? 'login-error' : undefined}
                onFocus={applyInputFocus}
                onBlur={resetInputFocus}
                style={inputBaseStyle}
              />
            </div>
            <div>
              <label
                htmlFor="login-password"
                style={{
                  display: 'block',
                  marginBottom: '0.4rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: C.forest,
                }}
              >
                Passwort{' '}
                <span aria-hidden="true" style={{ color: C.terra }}>
                  *
                </span>
              </label>
              <input
                id="login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Mindestens 6 Zeichen"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                aria-required="true"
                aria-invalid={!!error}
                aria-describedby={error ? 'login-error' : undefined}
                onFocus={applyInputFocus}
                onBlur={resetInputFocus}
                style={inputBaseStyle}
              />
            </div>
            {mode === 'register' && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <input
                  id="agb-checkbox"
                  type="checkbox"
                  checked={agbAccepted}
                  onChange={(e) => setAgbAccepted(e.target.checked)}
                  style={{ marginTop: '0.2rem', cursor: 'pointer', accentColor: C.forest, flexShrink: 0 }}
                />
                <label htmlFor="agb-checkbox" style={{ fontSize: '0.88rem', color: C.ink, lineHeight: 1.5, cursor: 'pointer' }}>
                  Ich akzeptiere die{' '}
                  <a href="#" onClick={(e) => e.preventDefault()} style={{ color: C.terra, fontWeight: 600, textDecoration: 'underline' }}>AGB</a>
                  {' '}und{' '}
                  <a href="#" onClick={(e) => e.preventDefault()} style={{ color: C.terra, fontWeight: 600, textDecoration: 'underline' }}>Datenschutzerklärung</a>
                </label>
              </div>
            )}
            <button
              type="submit"
              disabled={loading || (mode === 'register' && !agbAccepted)}
              style={{
                background: loading ? C.muted : 'linear-gradient(135deg, #163126, #1C3A2E)',
                color: 'white',
                padding: '1.05rem',
                borderRadius: 14,
                border: 'none',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: (loading || (mode === 'register' && !agbAccepted)) ? 'not-allowed' : 'pointer',
                boxShadow: '0 14px 34px rgba(28,58,46,0.25)',
                marginTop: '0.25rem',
                letterSpacing: '-0.01em',
                opacity: (mode === 'register' && !agbAccepted) ? 0.5 : 1,
              }}
            >
              {loading ? 'Bitte warten…' : mode !== 'login' ? 'Konto erstellen' : 'Einloggen'}
            </button>
            {mode === 'login' && !forgotMode && (
              <button
                type="button"
                onClick={() => setForgotMode(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: C.muted,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  textDecoration: 'underline',
                  padding: '0.25rem 0',
                }}
              >
                Passwort vergessen?
              </button>
            )}
            {forgotMode && !forgotSent && (
              <div
                style={{
                  borderTop: `1px solid ${C.line}`,
                  paddingTop: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <p style={{ margin: 0, fontSize: '0.88rem', color: C.muted, lineHeight: 1.5 }}>
                  Gib deine E-Mail-Adresse ein — wir schicken dir einen Reset-Link.
                </p>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="deine@email.de"
                  onFocus={applyInputFocus}
                  onBlur={resetInputFocus}
                  style={inputBaseStyle}
                />
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button
                    type="button"
                    onClick={() => setForgotMode(false)}
                    style={{
                      flex: 1,
                      padding: '0.85rem',
                      borderRadius: 12,
                      border: `1px solid ${C.line}`,
                      background: 'white',
                      color: C.forest,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Abbrechen
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!forgotEmail) return;
                      await supabase.auth.resetPasswordForEmail(forgotEmail, {
                        redirectTo: window.location.origin,
                      });
                      setForgotSent(true);
                    }}
                    style={{ flex: 2, ...primaryButtonStyle, borderRadius: 12, padding: '0.85rem' }}
                  >
                    Link senden
                  </button>
                </div>
              </div>
            )}
            {forgotSent && (
              <div
                style={{
                  background: C.sageLight,
                  borderRadius: 12,
                  padding: '0.85rem 1rem',
                  textAlign: 'center',
                  fontSize: '0.88rem',
                  color: C.forest,
                  fontWeight: 600,
                }}
              >
                ✓ E-Mail gesendet! Schau in deinem Postfach nach.
              </div>
            )}
          </form>

          <p
            style={{
              textAlign: 'center',
              color: C.muted,
              fontSize: '0.85rem',
              marginTop: '1.5rem',
            }}
          >
            {mode === 'login' ? 'Noch kein Account?' : 'Schon dabei?'}{' '}
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
                setAgbAccepted(false);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: C.forest,
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.85rem',
                textDecoration: 'underline',
              }}
            >
              {mode === 'login' ? 'Jetzt registrieren' : 'Zum Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
