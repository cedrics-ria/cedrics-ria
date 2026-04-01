import { useMemo } from 'react';
import { C } from '../constants';
import { getFallbackImage } from '../styles';
import { smartImageUrl } from '../lib/getImageUrl.js';
import RatingStars from './RatingStars';

/**
 * Shared listing card used across HomePage, ListingsPage, and ProfilePage.
 * compact=false → 220px image height (grid view)
 * compact=true  → 150px image height (profile / admin view)
 */
export default function ListingCard({
  listing,
  onSelect,
  favorites,
  toggleFavorite,
  compact = false,
}) {
  const item = listing;
  const imageHeight = compact ? 150 : 220;
  const isFav = favorites ? favorites.includes(String(item.id)) : false;
  const imageSrc = useMemo(
    () => smartImageUrl(item.image || getFallbackImage(item.category), { width: compact ? 400 : 600, quality: compact ? 75 : 80 }),
    [item.image, item.category, compact]
  );

  return (
    <div
      className="hover-card"
      role="button"
      tabIndex={0}
      aria-label={`${item.title}, ${item.price}${item.isAvailable === false ? ', momentan vergeben' : ''}`}
      style={{
        background: 'white',
        borderRadius: 20,
        overflow: 'hidden',
        border: `1px solid ${item.isAvailable === false ? C.terra : C.line}`,
        boxShadow: C.shadow,
        cursor: 'pointer',
        height: '100%',
        opacity: item.isAvailable === false ? 0.72 : 1,
      }}
      onClick={() => onSelect && onSelect(item)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect && onSelect(item); } }}
    >
      {/* Image area */}
      <div
        style={{
          height: imageHeight,
          background: C.sageLight,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <img
          src={imageSrc}
          alt={item.title}
          width={compact ? 400 : 600}
          height={imageHeight}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />

        {/* Category badge */}
        <div
          style={{
            position: 'absolute',
            left: 10,
            bottom: 10,
            background: 'rgba(255,255,255,0.93)',
            color: C.forest,
            padding: '0.3rem 0.65rem',
            borderRadius: 999,
            fontSize: '0.76rem',
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          {item.category}
        </div>

        {/* Availability badge */}
        {item.isAvailable === false && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              background: C.terra,
              color: 'white',
              padding: '0.3rem 0.7rem',
              borderRadius: 999,
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
            }}
          >
            Vergeben
          </div>
        )}

        {/* Demo badge */}
        {item.userId === 'demo' && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              background: 'rgba(0,0,0,0.45)',
              color: 'white',
              padding: '0.2rem 0.55rem',
              borderRadius: 999,
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            Beispiel
          </div>
        )}

        {/* Favorite heart button */}
        {favorites && toggleFavorite && (
          <button
            aria-label={isFav ? `${item.title} aus Favoriten entfernen` : `${item.title} zu Favoriten hinzufügen`}
            aria-pressed={isFav}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(item.id);
            }}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.9)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              zIndex: 1,
              color: isFav ? C.terra : C.muted,
            }}
          >
            {isFav ? '♥' : '♡'}
          </button>
        )}
      </div>

      {/* Content area */}
      <div style={{ padding: compact ? '1rem' : '1.25rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start',
            gap: '0.5rem',
            marginBottom: '0.4rem',
          }}
        >
          <h2
            style={{
              color: C.forest,
              margin: 0,
              fontSize: compact ? '1rem' : '1.1rem',
              lineHeight: 1.2,
            }}
          >
            {item.title}
          </h2>
          <span
            style={{
              color: C.terra,
              fontWeight: 800,
              fontSize: compact ? '0.9rem' : '1rem',
              whiteSpace: 'nowrap',
            }}
          >
            {item.price}
          </span>
        </div>
        <p style={{ color: C.muted, fontSize: '0.85rem', margin: '0 0 0.6rem' }}>
          {item.location}
        </p>
        {!compact && (
          <p
            style={{
              color: C.ink,
              lineHeight: 1.6,
              fontSize: '0.88rem',
              margin: '0 0 1rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.description}
          </p>
        )}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <RatingStars rating={item.rating} reviews={item.reviews} small />
          <span style={{ fontSize: '0.78rem', color: C.sage, fontWeight: 600 }}>
            {item.ownerName}
          </span>
        </div>
      </div>
    </div>
  );
}
