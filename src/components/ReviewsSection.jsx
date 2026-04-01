import { useEffect, useState } from 'react';
import { C } from '../constants';
import { inputBaseStyle, primaryButtonStyle, applyInputFocus, resetInputFocus } from '../styles';
import StarRow from './StarRow';
import { supabase } from '../supabase';

export default function ReviewsSection({ listingId, listingUserId, currentUser, addToast, onReviewAdded }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [hasCompletedBooking, setHasCompletedBooking] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null); // review id being replied to
  const [replyText, setReplyText] = useState('');
  const [savingReply, setSavingReply] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('listing_id', String(listingId))
        .order('created_at', { ascending: false });
      if (data) setReviews(data);
      setLoading(false);
    })();
  }, [listingId]);

  // Check if current user has a completed booking for this listing
  useEffect(() => {
    if (!currentUser?.id || !listingId) return;
    supabase
      .from('bookings')
      .select('id')
      .eq('listing_id', String(listingId))
      .eq('requester_id', currentUser.id)
      .in('status', ['returned', 'confirmed'])
      .limit(1)
      .then(({ data }) => setHasCompletedBooking((data?.length ?? 0) > 0));
  }, [currentUser?.id, listingId]);

  const hasReviewed = reviews.some((r) => r.reviewer_id === currentUser?.id);
  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const isOwner = currentUser?.id === listingUserId;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!rating || saving) return;
    setSaving(true);
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        listing_id: String(listingId),
        reviewer_id: currentUser.id,
        reviewer_name: currentUser.name,
        rating,
        comment: comment.trim() || null,
      })
      .select()
      .single();
    setSaving(false);
    if (error) {
      addToast('Fehler: ' + error.message, 'error');
      return;
    }
    setReviews((prev) => [data, ...prev]);
    if (onReviewAdded) onReviewAdded(listingId, rating);
    setShowForm(false);
    setRating(0);
    setHoverRating(0);
    setComment('');
    addToast('Bewertung gespeichert ✓', 'info');
  }

  async function handleSaveReply(reviewId) {
    if (!replyText.trim() || savingReply) return;
    setSavingReply(true);
    const { error } = await supabase
      .from('reviews')
      .update({ owner_reply: replyText.trim(), owner_reply_at: new Date().toISOString() })
      .eq('id', reviewId);
    setSavingReply(false);
    if (error) { addToast('Fehler beim Speichern', 'error'); return; }
    setReviews((prev) => prev.map((r) => r.id === reviewId ? { ...r, owner_reply: replyText.trim(), owner_reply_at: new Date().toISOString() } : r));
    setReplyingTo(null);
    setReplyText('');
    addToast('Antwort gespeichert ✓', 'info');
  }

  return (
    <div style={{ marginTop: '3rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <h2 style={{ color: C.forest, fontSize: '1.5rem', margin: 0, letterSpacing: '-0.02em' }}>
          Bewertungen
        </h2>
        {reviews.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <StarRow value={Math.round(avgRating)} size={15} />
            <span style={{ color: C.gold, fontWeight: 800, fontSize: '0.95rem' }}>
              {avgRating.toFixed(1)}
            </span>
            <span style={{ color: C.muted, fontSize: '0.85rem' }}>
              ({reviews.length} Bewertung{reviews.length !== 1 ? 'en' : ''})
            </span>
          </div>
        )}
        {currentUser && !hasReviewed && !showForm && !isOwner && (
          hasCompletedBooking ? (
            <button
              onClick={() => setShowForm(true)}
              style={{
                marginLeft: 'auto',
                padding: '0.55rem 1rem',
                borderRadius: 12,
                border: `1px solid ${C.line}`,
                background: 'white',
                color: C.forest,
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              + Bewertung
            </button>
          ) : (
            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: C.muted }}>
              Nur nach abgeschlossener Buchung
            </span>
          )
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            background: 'white',
            borderRadius: 20,
            padding: '1.5rem',
            border: `1px solid ${C.sage}`,
            boxShadow: '0 8px 32px rgba(28,58,46,0.10)',
            marginBottom: '1.5rem',
          }}
        >
          <p
            style={{
              fontSize: '0.75rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: C.sage,
              fontWeight: 700,
              margin: '0 0 1rem',
            }}
          >
            Deine Bewertung
          </p>
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', color: C.muted, marginBottom: '0.6rem' }}>
              Wie war deine Erfahrung?
            </div>
            <StarRow
              value={hoverRating || rating}
              size={32}
              interactive
              onHover={setHoverRating}
              onLeave={() => setHoverRating(0)}
              onClick={setRating}
            />
            {(hoverRating || rating) > 0 && (
              <div
                style={{ fontSize: '0.8rem', color: C.gold, fontWeight: 600, marginTop: '0.4rem' }}
              >
                {['', 'Schlecht', 'Naja', 'Ok', 'Gut', 'Sehr gut'][hoverRating || rating]}
              </div>
            )}
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Schreib etwas über deine Erfahrung (optional)..."
              rows={3}
              onFocus={applyInputFocus}
              onBlur={resetInputFocus}
              style={{ ...inputBaseStyle, resize: 'none', fontSize: '0.9rem' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setRating(0);
                setComment('');
              }}
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
              type="submit"
              disabled={!rating || saving}
              style={{
                ...primaryButtonStyle,
                flex: 2,
                padding: '0.85rem',
                borderRadius: 12,
                opacity: !rating || saving ? 0.55 : 1,
              }}
            >
              {saving ? 'Wird gespeichert...' : 'Bewertung abschicken'}
            </button>
          </div>
        </form>
      )}

      {!loading && reviews.length === 0 && !showForm && (
        <div
          style={{
            textAlign: 'center',
            padding: '2.5rem 1.5rem',
            color: C.muted,
            borderRadius: 20,
            border: `1px dashed ${C.line}`,
            background: 'rgba(255,255,255,0.6)',
          }}
        >
          <div style={{ fontSize: '1.8rem', marginBottom: '0.6rem' }}>⭐</div>
          <div style={{ fontWeight: 700, color: C.forest, marginBottom: '0.3rem' }}>
            Noch keine Bewertungen
          </div>
          <div style={{ fontSize: '0.85rem' }}>Sei der Erste, der eine Erfahrung teilt.</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {reviews.map((r) => (
          <div
            key={r.id}
            style={{
              background: 'white',
              borderRadius: 18,
              padding: '1.25rem 1.5rem',
              border: `1px solid ${C.line}`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: r.comment ? '0.75rem' : 0,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #163126, #1C3A2E)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {(r.reviewer_name || '?').charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: C.forest, fontSize: '0.9rem' }}>
                  {r.reviewer_name}
                </div>
                <div style={{ fontSize: '0.75rem', color: C.muted }}>
                  {new Date(r.created_at).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>
              <StarRow value={r.rating} size={14} />
            </div>
            {r.comment && (
              <p
                style={{
                  color: C.ink,
                  margin: 0,
                  fontSize: '0.9rem',
                  lineHeight: 1.7,
                  paddingLeft: '3.1rem',
                }}
              >
                {r.comment}
              </p>
            )}

            {/* Owner reply */}
            {r.owner_reply && (
              <div
                style={{
                  marginTop: '0.85rem',
                  marginLeft: '3.1rem',
                  background: C.sageLight,
                  borderRadius: 12,
                  padding: '0.75rem 1rem',
                  borderLeft: `3px solid ${C.forest}`,
                }}
              >
                <div style={{ fontSize: '0.75rem', color: C.forest, fontWeight: 700, marginBottom: '0.3rem' }}>
                  Antwort des Anbieters
                </div>
                <p style={{ margin: 0, fontSize: '0.88rem', color: C.ink, lineHeight: 1.6 }}>
                  {r.owner_reply}
                </p>
              </div>
            )}

            {/* Owner can reply if no reply yet */}
            {isOwner && !r.owner_reply && (
              replyingTo === r.id ? (
                <div style={{ marginTop: '0.75rem', marginLeft: '3.1rem' }}>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Deine Antwort..."
                    rows={2}
                    onFocus={applyInputFocus}
                    onBlur={resetInputFocus}
                    style={{ ...inputBaseStyle, resize: 'none', fontSize: '0.85rem', marginBottom: '0.5rem' }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => { setReplyingTo(null); setReplyText(''); }}
                      style={{ flex: 1, padding: '0.5rem', borderRadius: 10, border: `1px solid ${C.line}`, background: 'white', color: C.muted, fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Abbrechen
                    </button>
                    <button
                      onClick={() => handleSaveReply(r.id)}
                      disabled={!replyText.trim() || savingReply}
                      style={{ flex: 2, padding: '0.5rem', borderRadius: 10, border: 'none', background: C.forest, color: 'white', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 700, opacity: !replyText.trim() || savingReply ? 0.6 : 1 }}
                    >
                      {savingReply ? 'Speichern...' : 'Antworten'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { setReplyingTo(r.id); setReplyText(''); }}
                  style={{ marginTop: '0.5rem', marginLeft: '3.1rem', background: 'none', border: 'none', color: C.muted, fontSize: '0.78rem', cursor: 'pointer', padding: 0, textDecoration: 'underline', textUnderlineOffset: 2 }}
                >
                  Antworten
                </button>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
