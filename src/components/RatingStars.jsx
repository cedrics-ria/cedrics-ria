import { C } from '../constants';

export default function RatingStars({ rating, reviews, small = false }) {
  if (!rating || !reviews)
    return (
      <span style={{ fontSize: small ? '0.78rem' : '0.85rem', color: C.muted }}>
        Noch keine Bewertungen
      </span>
    );
  const stars = Math.round(rating);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.45rem',
        color: C.gold,
        fontSize: small ? '0.86rem' : '0.95rem',
      }}
    >
      <span>
        {'★'.repeat(stars)}
        {'☆'.repeat(5 - stars)}
      </span>
      <span style={{ color: C.ink, fontWeight: 700 }}>{rating.toFixed(1)}</span>
      <span style={{ color: C.muted }}>({reviews})</span>
    </div>
  );
}
