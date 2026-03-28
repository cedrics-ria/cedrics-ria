import { useState } from 'react';
import { C } from '../constants';
import { inputBaseStyle, primaryButtonStyle, applyInputFocus, resetInputFocus } from '../styles';
import StarRow from './StarRow';
import { supabase } from '../supabase';

export default function ReviewModal({
  listingId,
  listingTitle,
  revieweeId,
  revieweeName,
  currentUser,
  onClose,
  onReviewAdded,
  addToast,
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!rating) return;
    setSaving(true);
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        listing_id: String(listingId),
        reviewer_id: currentUser.id,
        reviewee_id: revieweeId,
        reviewer_name: currentUser.name,
        rating,
        text: text.trim() || null,
      })
      .select()
      .single();
    setSaving(false);
    if (error) {
      addToast('Fehler beim Speichern: ' + error.message, 'error');
      return;
    }
    if (onReviewAdded) onReviewAdded(listingId, rating);
    addToast('Bewertung abgegeben ✓', 'info');
    onClose();
  }

  const displayRating = hoverRating || rating;
  const ratingLabels = ['', 'Schlecht', 'Naja', 'Ok', 'Gut', 'Sehr gut'];

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
          maxWidth: 460,
          width: '100%',
          boxShadow: '0 30px 80px rgba(0,0,0,0.22)',
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
              Bewertung abgeben
            </p>
            <h2 style={{ color: C.forest, margin: 0, fontSize: '1.3rem' }}>{revieweeName}</h2>
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

        <form onSubmit={handleSubmit}>
          {/* Star picker */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                fontSize: '0.85rem',
                color: C.muted,
                marginBottom: '0.75rem',
                fontWeight: 600,
              }}
            >
              Wie war deine Erfahrung?
            </div>
            <StarRow
              value={displayRating}
              size={36}
              interactive
              onHover={setHoverRating}
              onLeave={() => setHoverRating(0)}
              onClick={setRating}
            />
            <div style={{ height: '1.2rem', marginTop: '0.4rem' }}>
              {displayRating > 0 && (
                <span style={{ fontSize: '0.82rem', color: C.gold, fontWeight: 700 }}>
                  {ratingLabels[displayRating]}
                </span>
              )}
            </div>
          </div>

          {/* Text input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: C.forest,
                marginBottom: '0.5rem',
              }}
            >
              Kommentar <span style={{ color: C.muted, fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Erzähl anderen von deiner Erfahrung..."
              rows={3}
              onFocus={applyInputFocus}
              onBlur={resetInputFocus}
              style={{ ...inputBaseStyle, resize: 'none', fontSize: '0.9rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
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
              disabled={!rating || saving}
              style={{
                ...primaryButtonStyle,
                flex: 2,
                padding: '0.9rem',
                borderRadius: 12,
                fontSize: '0.9rem',
                opacity: !rating || saving ? 0.55 : 1,
              }}
            >
              {saving ? 'Wird gespeichert...' : 'Bewertung abschicken'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
