import { useState } from 'react';
import { C } from '../constants';
import { inputBaseStyle, primaryButtonStyle, applyInputFocus, resetInputFocus } from '../styles';

export default function MessageComposerPage({ listing, currentUser, goTo, onSendMessage }) {
  const [message, setMessage] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  // Parse daily rate from price string like "5€ / Tag", "8 € pro Nacht"
  const dailyRate = (() => {
    if (!listing?.price) return null;
    const lower = listing.price.toLowerCase();
    if (!lower.includes('tag') && !lower.includes('nacht')) return null;
    const m = listing.price.match(/(\d+[.,]?\d*)/);
    return m ? parseFloat(m[1].replace(',', '.')) : null;
  })();

  const days =
    fromDate && toDate
      ? Math.max(1, Math.round((new Date(toDate) - new Date(fromDate)) / 86400000) + 1)
      : 0;
  const totalPrice = days && dailyRate ? days * dailyRate : null;

  if (!listing) {
    return (
      <div style={{ minHeight: '100vh', background: C.cream, padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h1 style={{ color: C.forest, marginBottom: '1rem' }}>Kein Inserat ausgewählt</h1>
          <button
            onClick={() => goTo('listings')}
            style={{
              background: C.terra,
              color: 'white',
              padding: '0.9rem 1.3rem',
              borderRadius: 12,
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Zurück zu den Inseraten
          </button>
        </div>
      </div>
    );
  }

  async function handleSend(event) {
    event.preventDefault();
    if (!currentUser) {
      goTo('login');
      return;
    }
    let fullText = message.trim();
    // Prepend booking header when dates selected
    if (fromDate && toDate) {
      const fmt = (d) =>
        new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
      const header = `Mietanfrage: ${fmt(fromDate)} – ${fmt(toDate)} (${days} Tag${days !== 1 ? 'e' : ''})${totalPrice ? ` · Gesamt ca. ${totalPrice.toFixed(0)} €` : ''}`;
      fullText = header + (fullText ? '\n\n' + fullText : '');
    }
    if (!fullText) {
      setError('Bitte schreibe eine Nachricht oder wähle einen Zeitraum.');
      return;
    }
    setError('');
    setSending(true);
    const ok = await onSendMessage({
      listingId: listing.id,
      listingTitle: listing.title,
      toUserId: listing.userId,
      text: fullText,
    });
    setSending(false);
    if (ok) {
      setSent(true);
      setMessage('');
      setFromDate('');
      setToDate('');
    }
  }

  if (sent) {
    return (
      <div style={{ minHeight: '100vh', background: C.cream, padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div
            style={{
              background: 'white',
              borderRadius: 28,
              padding: '3rem 2rem',
              boxShadow: C.shadow,
              border: `1px solid ${C.line}`,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: C.sageLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                fontSize: '1.8rem',
              }}
            >
              ✓
            </div>
            <h2 style={{ color: C.forest, margin: '0 0 0.75rem' }}>Anfrage gesendet!</h2>
            <p style={{ color: C.muted, lineHeight: 1.7, marginBottom: '2rem' }}>
              Deine Anfrage zu „{listing.title}" wurde übermittelt. Du findest sie in deinem
              Postfach.
            </p>
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={() => goTo('messages')}
                style={{
                  padding: '0.85rem 1.4rem',
                  borderRadius: 12,
                  border: `1px solid ${C.line}`,
                  background: 'white',
                  color: C.forest,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Meine Nachrichten
              </button>
              <button
                onClick={() => goTo('listings')}
                style={{ ...primaryButtonStyle, padding: '0.85rem 1.4rem' }}
              >
                Weiter stöbern
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: C.cream, padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <button
          onClick={() => goTo('listing-detail')}
          style={{
            background: 'white',
            color: C.forest,
            padding: '0.8rem 1.1rem',
            borderRadius: 12,
            border: `1px solid ${C.line}`,
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '1.5rem',
          }}
        >
          ← Zurück zum Inserat
        </button>

        {/* Listing preview strip */}
        <div
          style={{
            background: 'white',
            borderRadius: 16,
            padding: '1rem 1.25rem',
            border: `1px solid ${C.line}`,
            marginBottom: '1.25rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
          }}
        >
          {listing.image && (
            <img
              src={listing.image}
              alt=""
              style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: 700,
                color: C.forest,
                fontSize: '0.95rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {listing.title}
            </div>
            <div style={{ color: C.muted, fontSize: '0.82rem' }}>
              {listing.ownerName} · {listing.location}
            </div>
          </div>
          <span
            style={{ color: C.terra, fontWeight: 800, fontSize: '0.95rem', whiteSpace: 'nowrap' }}
          >
            {listing.price}
          </span>
        </div>

        <div
          style={{
            background: 'white',
            borderRadius: 28,
            padding: '2rem',
            boxShadow: C.shadow,
            border: `1px solid ${C.line}`,
          }}
        >
          <p
            style={{
              fontSize: '0.78rem',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: C.sage,
              fontWeight: 700,
              marginBottom: '0.5rem',
            }}
          >
            Anfrage senden
          </p>
          <h1
            style={{
              fontSize: '1.9rem',
              color: C.forest,
              marginTop: 0,
              marginBottom: '1.5rem',
              letterSpacing: '-0.02em',
            }}
          >
            Buchungsanfrage
          </h1>

          {error && (
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 12,
                background: 'rgba(196,113,74,0.1)',
                color: C.terra,
                fontWeight: 600,
                marginBottom: '1rem',
                fontSize: '0.9rem',
              }}
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleSend}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            {/* Date range */}
            <div>
              <div
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: C.forest,
                  marginBottom: '0.65rem',
                  letterSpacing: '0.02em',
                }}
              >
                Zeitraum <span style={{ color: C.muted, fontWeight: 500 }}>(optional)</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: C.muted,
                      marginBottom: '0.3rem',
                      fontWeight: 600,
                    }}
                  >
                    Von
                  </div>
                  <input
                    type="date"
                    value={fromDate}
                    min={today}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      if (toDate && e.target.value > toDate) setToDate('');
                    }}
                    onFocus={applyInputFocus}
                    onBlur={resetInputFocus}
                    style={{ ...inputBaseStyle, fontSize: '0.95rem' }}
                  />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: C.muted,
                      marginBottom: '0.3rem',
                      fontWeight: 600,
                    }}
                  >
                    Bis (inkl.)
                  </div>
                  <input
                    type="date"
                    value={toDate}
                    min={fromDate || today}
                    onChange={(e) => setToDate(e.target.value)}
                    onFocus={applyInputFocus}
                    onBlur={resetInputFocus}
                    style={{ ...inputBaseStyle, fontSize: '0.95rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Price summary */}
            {days > 0 && (
              <div
                style={{
                  background: C.sageLight,
                  borderRadius: 14,
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: C.forest }}
                >
                  <span style={{ fontSize: '1.1rem' }}>📅</span>
                  <span style={{ fontWeight: 700 }}>
                    {days} Tag{days !== 1 ? 'e' : ''}
                  </span>
                </div>
                {totalPrice ? (
                  <>
                    <span style={{ color: C.muted }}>·</span>
                    <div style={{ color: C.muted, fontSize: '0.88rem' }}>
                      {days} × {dailyRate?.toFixed(0)} €
                    </div>
                    <span style={{ color: C.muted }}>·</span>
                    <div style={{ fontWeight: 800, color: C.terra, fontSize: '1.05rem' }}>
                      ≈ {totalPrice.toFixed(0)} €
                    </div>
                  </>
                ) : (
                  <span style={{ color: C.muted, fontSize: '0.85rem' }}>Zeitraum ausgewählt</span>
                )}
              </div>
            )}

            {/* Message */}
            <div>
              <div
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: C.forest,
                  marginBottom: '0.65rem',
                  letterSpacing: '0.02em',
                }}
              >
                Nachricht{' '}
                <span style={{ color: C.muted, fontWeight: 500 }}>
                  (optional wenn Datum gesetzt)
                </span>
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Hallo ${listing.ownerName}, ich interessiere mich für „${listing.title}". Ist es noch verfügbar?`}
                rows={5}
                onFocus={applyInputFocus}
                onBlur={resetInputFocus}
                style={{ ...inputBaseStyle, resize: 'vertical', lineHeight: 1.65 }}
              />
            </div>

            <button
              type="submit"
              disabled={sending || (!message.trim() && !fromDate)}
              style={{
                ...primaryButtonStyle,
                opacity: sending || (!message.trim() && !fromDate) ? 0.6 : 1,
              }}
            >
              {sending ? 'Wird gesendet…' : currentUser ? 'Anfrage senden' : 'Zum Login'}
            </button>
            {!currentUser && (
              <p style={{ textAlign: 'center', color: C.muted, fontSize: '0.82rem', margin: 0 }}>
                Du musst eingeloggt sein, um eine Anfrage zu senden.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
