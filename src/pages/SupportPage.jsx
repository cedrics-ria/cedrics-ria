import { useState } from 'react';
import { C } from '../constants';
import { inputBaseStyle, applyInputFocus, resetInputFocus } from '../styles';
import { supabase } from '../supabase';

const FAQS = [
  {
    q: 'Wie funktioniert ria?',
    a: 'ria ist ein lokaler Marktplatz zum Mieten und Verleihen. Du kannst Gegenstände die du besitzt inserieren und anderen leihen — oder selbst Dinge mieten die du nur kurz brauchst. Alles läuft direkt zwischen Privatpersonen ab, ohne Mittelsmann.',
  },
  {
    q: 'Wie erstelle ich ein Inserat?',
    a: 'Melde dich an, klicke unten auf das + Symbol und fülle das Formular aus: Titel, Kategorie, Preis pro Tag, Ort und ein Foto. Dein Inserat ist sofort sichtbar.',
  },
  {
    q: 'Wie kontaktiere ich einen Verleiher?',
    a: "Öffne ein Inserat und klicke auf 'Nachricht senden'. Du kannst direkt eine Anfrage mit optionalem Zeitraum schicken. Der Verleiher antwortet über die Nachrichten-Funktion.",
  },
  {
    q: 'Was kostet die Nutzung von ria?',
    a: 'ria ist aktuell komplett kostenlos — für Verleiher und Mieter. Wir planen keine versteckten Gebühren.',
  },
  {
    q: 'Was passiert bei Schäden?',
    a: 'Schäden werden direkt zwischen den Parteien geregelt. Wir empfehlen eine Kaution festzulegen und das Übergabeprotokoll zu nutzen um den Zustand vor und nach der Leihe zu dokumentieren. ria haftet nicht für Schäden — weitere Infos findest du in unseren AGB.',
  },
  {
    q: 'Wie funktioniert die Kaution?',
    a: 'Du kannst beim Inserieren eine Kaution angeben (z. B. 50 €). Diese wird bar oder per Überweisung beim Übergeben gezahlt und nach der Rückgabe zurückgegeben. ria wickelt die Kaution nicht ab — das läuft direkt zwischen euch.',
  },
  {
    q: 'Wie nutze ich das Übergabeprotokoll?',
    a: 'In jedem Chat gibt es den Button Übergabeprotokoll erstellen. Dort könnt ihr den Zustand des Gegenstands, das Übergabedatum und Notizen festhalten. Das schützt beide Seiten bei späteren Unklarheiten.',
  },
  {
    q: 'Wie bekomme ich ein Verifiziert-Badge?',
    a: 'Gehe zu deinem Profil und trage deine Handynummer ein. Nach dem Speichern erscheint das goldene ✓ Badge auf deinem Profil und deinen Inseraten — das signalisiert anderen Nutzern dass du vertrauenswürdig bist.',
  },
  {
    q: 'Kann ich mein Konto löschen?',
    a: 'Schreib uns eine E-Mail an ria.rentitall@web.de mit dem Betreff Konto loeschen und wir löschen deinen Account und alle deine Daten innerhalb von 48 Stunden.',
  },
  {
    q: 'Was mache ich wenn jemand nicht zurückgibt?',
    a: 'Versuche zunächst den Kontakt über ria herzustellen. Wenn das nicht klappt, wende dich an uns über das Kontaktformular. Bei größeren Schäden empfehlen wir rechtliche Schritte einzuleiten — ria kann dabei leider nicht als Vermittler auftreten.',
  },
];

export default function SupportPage({ goTo, currentUser }) {
  const [openFaq, setOpenFaq] = useState(null);
  const [form, setForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    subject: '',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Bitte fülle Name, E-Mail und Nachricht aus.');
      return;
    }
    setError('');
    setSending(true);
    const { error: dbError } = await supabase.from('support_requests').insert({
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim() || 'Allgemeine Anfrage',
      message: form.message.trim(),
      user_id: currentUser?.id || null,
    });
    setSending(false);
    if (dbError) {
      setError('Fehler beim Senden. Schreib uns direkt: ria.rentitall@web.de');
      return;
    }
    setSent(true);
  }

  const labelStyle = {
    display: 'block',
    marginBottom: '0.45rem',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: C.forest,
  };

  return (
    <div style={{ minHeight: '100vh', background: C.cream, padding: '3rem 1.5rem 5rem' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        {/* Header */}
        <button
          onClick={() => goTo('home')}
          style={{
            background: 'white',
            color: C.forest,
            padding: '0.6rem 1rem',
            borderRadius: 12,
            border: `1px solid ${C.line}`,
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '2rem',
            fontSize: '0.9rem',
          }}
        >
          ← Zurück
        </button>
        <p
          style={{
            fontSize: '0.75rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: C.sage,
            fontWeight: 700,
            marginBottom: '0.4rem',
          }}
        >
          Hilfe & Support
        </p>
        <h1
          style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            color: C.forest,
            margin: '0 0 0.5rem',
            letterSpacing: '-0.03em',
          }}
        >
          Wie können wir helfen?
        </h1>
        <p style={{ color: C.muted, fontSize: '1rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
          Hier findest du Antworten auf häufige Fragen — oder schreib uns direkt.
        </p>

        {/* Quick contact bar */}
        <div
          style={{
            background: C.forest,
            borderRadius: 20,
            padding: '1.25rem 1.5rem',
            marginBottom: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div
              style={{ color: 'white', fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}
            >
              Direkt per E-Mail erreichbar
            </div>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.88rem' }}>
              Wir antworten innerhalb von 24 Stunden
            </div>
          </div>
          <a
            href="mailto:ria.rentitall@web.de"
            style={{
              background: 'white',
              color: C.forest,
              padding: '0.75rem 1.25rem',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: '0.9rem',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            ria.rentitall@web.de
          </a>
        </div>

        {/* FAQ */}
        <h2
          style={{
            fontSize: '1.4rem',
            color: C.forest,
            marginBottom: '1rem',
            letterSpacing: '-0.02em',
          }}
        >
          Häufige Fragen
        </h2>
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '3rem' }}
        >
          {FAQS.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={i}
                style={{
                  background: 'white',
                  borderRadius: 16,
                  border: `1px solid ${isOpen ? C.sage : C.line}`,
                  overflow: 'hidden',
                  transition: 'border-color 0.2s ease',
                }}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  style={{
                    width: '100%',
                    padding: '1.1rem 1.5rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                    textAlign: 'left',
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      color: C.forest,
                      fontSize: '0.95rem',
                      lineHeight: 1.4,
                    }}
                  >
                    {faq.q}
                  </span>
                  <span
                    style={{
                      color: C.sage,
                      fontSize: '1rem',
                      flexShrink: 0,
                      transform: isOpen ? 'rotate(45deg)' : 'none',
                      transition: 'transform 0.2s ease',
                      fontWeight: 700,
                    }}
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <div
                    style={{
                      padding: '0 1.5rem 1.25rem',
                      color: C.ink,
                      fontSize: '0.92rem',
                      lineHeight: 1.7,
                      borderTop: `1px solid ${C.line}`,
                      paddingTop: '1rem',
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact form */}
        <h2
          style={{
            fontSize: '1.4rem',
            color: C.forest,
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em',
          }}
        >
          Nachricht schreiben
        </h2>
        <p style={{ color: C.muted, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Deine Frage nicht dabei? Wir helfen gerne weiter.
        </p>

        {sent ? (
          <div
            style={{
              background: 'white',
              borderRadius: 20,
              padding: '2.5rem',
              textAlign: 'center',
              border: `1px solid ${C.line}`,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: C.sageLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                fontSize: '1.5rem',
              }}
            >
              ✓
            </div>
            <h3 style={{ color: C.forest, margin: '0 0 0.5rem' }}>Nachricht erhalten!</h3>
            <p style={{ color: C.muted, margin: '0 0 1.5rem', lineHeight: 1.6 }}>
              Wir melden uns innerhalb von 24 Stunden bei dir unter <strong>{form.email}</strong>.
            </p>
            <button
              onClick={() => {
                setSent(false);
                setForm({
                  name: currentUser?.name || '',
                  email: currentUser?.email || '',
                  subject: '',
                  message: '',
                });
              }}
              style={{
                background: C.forest,
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: 12,
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Weitere Nachricht senden
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              background: 'white',
              borderRadius: 20,
              padding: '1.75rem',
              border: `1px solid ${C.line}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '1.1rem',
            }}
          >
            {error && (
              <div
                style={{
                  background: 'rgba(196,113,74,0.1)',
                  color: C.terra,
                  padding: '0.85rem 1rem',
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>
                  Name <span style={{ color: C.terra }}>*</span>
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Dein Name"
                  onFocus={applyInputFocus}
                  onBlur={resetInputFocus}
                  style={inputBaseStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>
                  E-Mail <span style={{ color: C.terra }}>*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="deine@email.de"
                  onFocus={applyInputFocus}
                  onBlur={resetInputFocus}
                  style={inputBaseStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Betreff</label>
              <div
                style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}
              >
                {['Allgemeine Frage', 'Problem melden', 'Konto', 'Inserat', 'Sonstiges'].map(
                  (s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, subject: s }))}
                      style={{
                        padding: '0.3rem 0.75rem',
                        borderRadius: 999,
                        border: `1px solid ${C.line}`,
                        background: form.subject === s ? C.forest : 'white',
                        color: form.subject === s ? 'white' : C.muted,
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {s}
                    </button>
                  )
                )}
              </div>
              <input
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Oder eigenen Betreff eingeben..."
                onFocus={applyInputFocus}
                onBlur={resetInputFocus}
                style={inputBaseStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>
                Nachricht <span style={{ color: C.terra }}>*</span>
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Beschreibe dein Anliegen so genau wie möglich..."
                rows={5}
                onFocus={applyInputFocus}
                onBlur={resetInputFocus}
                style={{ ...inputBaseStyle, resize: 'vertical', lineHeight: 1.65 }}
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              style={{
                background: 'linear-gradient(135deg, #163126, #1C3A2E)',
                color: 'white',
                padding: '1rem 1.5rem',
                borderRadius: 14,
                border: 'none',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                opacity: sending ? 0.7 : 1,
              }}
            >
              {sending ? 'Wird gesendet…' : 'Nachricht senden'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
