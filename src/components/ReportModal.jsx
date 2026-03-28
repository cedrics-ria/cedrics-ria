import { useState } from 'react';
import { C } from '../constants';
import { supabase } from '../supabase';

const REASONS = [
  'Spam / Fake-Inserat',
  'Unangemessene Inhalte',
  'Betrug / Abzocke',
  'Belästigung',
  'Falsche Angaben',
  'Sonstiges',
];

export default function ReportModal({ currentUser, reportedUser, listing, onClose, addToast }) {
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (!reason) return;
    setSending(true);
    const { error } = await supabase.from('reports').insert({
      reporter_id: currentUser.id,
      reporter_name: currentUser.name,
      reported_user_id: reportedUser?.id || null,
      reported_user_name: reportedUser?.name || null,
      listing_id: listing?.id ? String(listing.id) : null,
      listing_title: listing?.title || null,
      reason,
      message: message.trim() || null,
      status: 'open',
    });
    setSending(false);
    if (error) {
      addToast('Fehler beim Senden: ' + error.message, 'error');
      return;
    }
    setSent(true);
  }

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999,
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          background: 'white',
          borderRadius: 24,
          padding: '2rem',
          width: '90%',
          maxWidth: 440,
          boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
          animation: 'fadeUp 0.2s ease both',
        }}
      >
        {sent ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
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
            <h3 style={{ color: C.forest, margin: '0 0 0.5rem' }}>Meldung eingegangen</h3>
            <p style={{ color: C.muted, margin: '0 0 1.5rem', lineHeight: 1.6 }}>
              Wir prüfen deinen Hinweis und handeln bei Bedarf.
            </p>
            <button
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: 12,
                border: 'none',
                background: C.forest,
                color: 'white',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Schließen
            </button>
          </div>
        ) : (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1.25rem',
              }}
            >
              <div>
                <h3 style={{ color: C.forest, margin: '0 0 0.25rem', fontSize: '1.2rem' }}>
                  Melden
                </h3>
                <p style={{ color: C.muted, margin: 0, fontSize: '0.85rem' }}>
                  {reportedUser?.name && `${reportedUser.name}`}
                  {listing?.title && ` · ${listing.title}`}
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  color: C.muted,
                  lineHeight: 1,
                  padding: '0 0.25rem',
                }}
              >
                ×
              </button>
            </div>

            <p
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: C.forest,
                marginBottom: '0.6rem',
                margin: '0 0 0.6rem',
              }}
            >
              Grund der Meldung *
            </p>
            <div
              style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.1rem' }}
            >
              {REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: 999,
                    border: `1px solid ${reason === r ? C.terra : C.line}`,
                    background: reason === r ? 'rgba(196,113,74,0.1)' : 'white',
                    color: reason === r ? C.terra : C.muted,
                    fontSize: '0.82rem',
                    fontWeight: reason === r ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {r}
                </button>
              ))}
            </div>

            <p
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: C.forest,
                margin: '0 0 0.4rem',
              }}
            >
              Details (optional)
            </p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Was ist passiert? Je mehr Details, desto besser..."
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 12,
                border: `1px solid ${C.line}`,
                fontSize: '0.9rem',
                color: C.ink,
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box',
                lineHeight: 1.6,
                fontFamily: 'inherit',
              }}
            />

            <button
              onClick={handleSubmit}
              disabled={!reason || sending}
              style={{
                width: '100%',
                marginTop: '1rem',
                padding: '0.95rem',
                borderRadius: 14,
                border: 'none',
                background: reason ? C.terra : C.line,
                color: 'white',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: reason ? 'pointer' : 'not-allowed',
                opacity: sending ? 0.7 : 1,
                transition: 'background 0.2s ease',
              }}
            >
              {sending ? 'Wird gesendet…' : 'Meldung abschicken'}
            </button>
          </>
        )}
      </div>
    </>
  );
}
