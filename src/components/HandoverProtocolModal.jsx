import { useEffect, useState } from 'react';
import { C } from '../constants';
import { inputBaseStyle, primaryButtonStyle, applyInputFocus, resetInputFocus } from '../styles';
import { supabase } from '../supabase';

export default function HandoverProtocolModal({
  listingId,
  listingTitle,
  otherUserId,
  otherUserName,
  currentUser,
  onClose,
  addToast,
}) {
  const [existing, setExisting] = useState(null);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [condition, setCondition] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadExisting() {
      const { data } = await supabase
        .from('handover_protocols')
        .select('*')
        .eq('listing_id', String(listingId))
        .or(`lender_id.eq.${currentUser.id},borrower_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (data) setExisting(data);
      setLoadingExisting(false);
    }
    loadExisting();
  }, [listingId, currentUser.id]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!condition.trim() || !date) return;
    setSaving(true);

    // Determine roles: if otherUserId is the listing owner, current user is borrower; otherwise lender
    const { data: listing } = await supabase
      .from('listings')
      .select('user_id')
      .eq('id', String(listingId))
      .single();
    const isLender = listing?.user_id === currentUser.id;

    const payload = {
      listing_id: String(listingId),
      listing_title: listingTitle,
      lender_id: isLender ? currentUser.id : otherUserId,
      lender_name: isLender ? currentUser.name : otherUserName,
      borrower_id: isLender ? otherUserId : currentUser.id,
      borrower_name: isLender ? otherUserName : currentUser.name,
      condition: condition.trim(),
      handover_date: date,
      notes: notes.trim() || null,
      created_by: currentUser.id,
    };

    const { data, error } = await supabase
      .from('handover_protocols')
      .insert(payload)
      .select()
      .single();

    setSaving(false);

    if (error) {
      addToast('Fehler: ' + error.message, 'error');
      return;
    }

    setExisting(data);
    addToast('Übergabeprotokoll erstellt ✓', 'info');
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9500,
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 28,
          padding: '2rem',
          maxWidth: 500,
          width: '100%',
          boxShadow: '0 30px 80px rgba(0,0,0,0.22)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <p
              style={{
                fontSize: '0.72rem',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: C.sage,
                fontWeight: 700,
                margin: '0 0 0.25rem',
              }}
            >
              Übergabe dokumentieren
            </p>
            <h2 style={{ color: C.forest, margin: 0, fontSize: '1.3rem' }}>Übergabeprotokoll</h2>
            {listingTitle && (
              <p style={{ color: C.muted, margin: '0.2rem 0 0', fontSize: '0.82rem' }}>
                {listingTitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: `1px solid ${C.line}`,
              background: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: C.muted,
              fontSize: '1rem',
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {loadingExisting ? (
          <div style={{ textAlign: 'center', color: C.muted, padding: '2rem' }}>Lädt...</div>
        ) : existing ? (
          /* Show existing protocol */
          <div>
            <div
              style={{
                background: C.sageLight,
                borderRadius: 16,
                padding: '1.25rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              <span style={{ color: C.forest, fontSize: '1.1rem' }}>✓</span>
              <span style={{ fontWeight: 700, color: C.forest, fontSize: '0.9rem' }}>
                Protokoll bereits erstellt
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: C.cream, borderRadius: 14, padding: '1rem 1.25rem' }}>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: C.muted,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '0.4rem',
                  }}
                >
                  Verleiher
                </div>
                <div style={{ fontWeight: 600, color: C.forest }}>{existing.lender_name}</div>
              </div>
              <div style={{ background: C.cream, borderRadius: 14, padding: '1rem 1.25rem' }}>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: C.muted,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '0.4rem',
                  }}
                >
                  Entleiher
                </div>
                <div style={{ fontWeight: 600, color: C.forest }}>{existing.borrower_name}</div>
              </div>
              <div style={{ background: C.cream, borderRadius: 14, padding: '1rem 1.25rem' }}>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: C.muted,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '0.4rem',
                  }}
                >
                  Zustand bei Übergabe
                </div>
                <div style={{ color: C.ink, lineHeight: 1.6 }}>{existing.condition}</div>
              </div>
              <div style={{ background: C.cream, borderRadius: 14, padding: '1rem 1.25rem' }}>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: C.muted,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '0.4rem',
                  }}
                >
                  Datum der Übergabe
                </div>
                <div style={{ color: C.ink }}>
                  {new Date(existing.handover_date).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>
              {existing.notes && (
                <div style={{ background: C.cream, borderRadius: 14, padding: '1rem 1.25rem' }}>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: C.muted,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Notizen
                  </div>
                  <div style={{ color: C.ink, lineHeight: 1.6 }}>{existing.notes}</div>
                </div>
              )}
              <div style={{ fontSize: '0.78rem', color: C.muted, textAlign: 'right' }}>
                Erstellt am {new Date(existing.created_at).toLocaleDateString('de-DE')} von{' '}
                {existing.created_by === currentUser.id
                  ? 'dir'
                  : existing.lender_id === existing.created_by
                    ? existing.lender_name
                    : existing.borrower_name}
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                ...primaryButtonStyle,
                width: '100%',
                padding: '0.9rem',
                borderRadius: 12,
                fontSize: '0.9rem',
                marginTop: '1.5rem',
              }}
            >
              Schließen
            </button>
          </div>
        ) : (
          /* Create new protocol form */
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: C.forest,
                    marginBottom: '0.5rem',
                  }}
                >
                  Zustand des Gegenstands <span style={{ color: C.terra }}>*</span>
                </label>
                <textarea
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  placeholder="z. B. Gut erhalten, alle Teile vorhanden, kleiner Kratzer auf der Unterseite..."
                  rows={3}
                  required
                  onFocus={applyInputFocus}
                  onBlur={resetInputFocus}
                  style={{ ...inputBaseStyle, resize: 'none', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: C.forest,
                    marginBottom: '0.5rem',
                  }}
                >
                  Datum der Übergabe <span style={{ color: C.terra }}>*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  max={today}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  onFocus={applyInputFocus}
                  onBlur={resetInputFocus}
                  style={{ ...inputBaseStyle }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: C.forest,
                    marginBottom: '0.5rem',
                  }}
                >
                  Notizen <span style={{ color: C.muted, fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Weitere Anmerkungen zur Übergabe..."
                  rows={2}
                  onFocus={applyInputFocus}
                  onBlur={resetInputFocus}
                  style={{ ...inputBaseStyle, resize: 'none', fontSize: '0.9rem' }}
                />
              </div>

              <div
                style={{
                  background: C.sageLight,
                  borderRadius: 14,
                  padding: '0.9rem 1.1rem',
                  fontSize: '0.82rem',
                  color: C.forest,
                  lineHeight: 1.5,
                }}
              >
                Das Protokoll dokumentiert die Übergabe zwischen <strong>{currentUser.name}</strong>{' '}
                und <strong>{otherUserName}</strong>.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '0.9rem',
                  borderRadius: 12,
                  border: `1px solid ${C.line}`,
                  background: 'white',
                  color: C.forest,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={!condition.trim() || !date || saving}
                style={{
                  ...primaryButtonStyle,
                  flex: 2,
                  padding: '0.9rem',
                  borderRadius: 12,
                  fontSize: '0.9rem',
                  opacity: !condition.trim() || !date || saving ? 0.55 : 1,
                }}
              >
                {saving ? 'Wird erstellt...' : 'Protokoll erstellen'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
