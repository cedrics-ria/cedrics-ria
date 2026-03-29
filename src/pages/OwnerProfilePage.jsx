import { useEffect, useState } from 'react';
import { C } from '../constants';
import RatingStars from '../components/RatingStars';
import EmptyState from '../components/EmptyState';
import VerifiedBadge from '../components/VerifiedBadge';
import ReportModal from '../components/ReportModal';
import { supabase } from '../supabase';

export default function OwnerProfilePage({
  owner,
  listings,
  goTo,
  onSelectListing,
  currentUser,
  addToast,
}) {
  const [ownerProfile, setOwnerProfile] = useState(null);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    if (!owner?.id) return;
    supabase
      .from('profiles')
      .select('*')
      .eq('id', owner.id)
      .single()
      .then(({ data }) => {
        if (data) setOwnerProfile(data);
      });
  }, [owner?.id]);

  if (!owner) {
    return (
      <div style={{ minHeight: '100vh', background: C.cream, padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <button
            onClick={() => goTo('listings')}
            style={{
              background: 'white',
              color: C.forest,
              padding: '0.7rem 1.1rem',
              borderRadius: 12,
              border: `1px solid ${C.line}`,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ← Zurück
          </button>
        </div>
      </div>
    );
  }

  const ownerListings = listings.filter((l) => l.userId === owner.id);
  const totalReviews = ownerListings.reduce((s, l) => s + (l.reviews || 0), 0);
  const avgRating = ownerListings.filter((l) => l.reviews > 0).length
    ? ownerListings.filter((l) => l.reviews > 0).reduce((s, l) => s + l.rating, 0) /
      ownerListings.filter((l) => l.reviews > 0).length
    : 0;

  return (
    <div style={{ minHeight: '100vh', background: C.cream, padding: '3rem 1.5rem 5rem' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <button
          onClick={() => goTo('listing-detail')}
          style={{
            background: 'white',
            color: C.forest,
            padding: '0.7rem 1.1rem',
            borderRadius: 12,
            border: `1px solid ${C.line}`,
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '1.75rem',
            fontSize: '0.9rem',
          }}
        >
          ← Zurück zum Inserat
        </button>

        {/* Profile header */}
        <div
          style={{
            background: 'white',
            borderRadius: 28,
            padding: '2rem 2rem 1.75rem',
            border: `1px solid ${C.line}`,
            boxShadow: C.shadow,
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '1.5rem',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #163126, #1C3A2E)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 800,
                flexShrink: 0,
                boxShadow: '0 8px 24px rgba(28,58,46,0.2)',
              }}
            >
              {owner.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  flexWrap: 'wrap',
                  marginBottom: '0.3rem',
                }}
              >
                <h1
                  style={{
                    color: C.forest,
                    margin: 0,
                    fontSize: '1.9rem',
                    letterSpacing: '-0.03em',
                  }}
                >
                  {owner.name}
                </h1>
                {ownerProfile?.phone && <VerifiedBadge variant="phone" />}
              </div>
              {ownerProfile?.is_banned && (
                <div
                  style={{
                    display: 'inline-block',
                    background: 'rgba(196,113,74,0.12)',
                    color: C.terra,
                    padding: '0.2rem 0.7rem',
                    borderRadius: 999,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    marginBottom: '0.4rem',
                  }}
                >
                  ⚠ Gesperrt
                </div>
              )}
              {ownerProfile?.location && (
                <div
                  style={{
                    color: C.muted,
                    fontSize: '0.88rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    marginBottom: '0.4rem',
                  }}
                >
                  <span>📍</span>
                  {ownerProfile.location}
                </div>
              )}
              {ownerProfile?.bio && (
                <p
                  style={{
                    color: C.ink,
                    fontSize: '0.92rem',
                    margin: '0.5rem 0 0',
                    lineHeight: 1.65,
                    maxWidth: 560,
                  }}
                >
                  {ownerProfile.bio}
                </p>
              )}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              gap: '2rem',
              marginTop: '1.5rem',
              paddingTop: '1.5rem',
              borderTop: `1px solid ${C.line}`,
              flexWrap: 'wrap',
            }}
          >
            {[
              [ownerListings.length, 'Inserate'],
              [totalReviews, 'Bewertungen'],
              avgRating > 0 ? [`★ ${avgRating.toFixed(1)}`, 'Ø Bewertung'] : null,
            ]
              .filter(Boolean)
              .map(([val, label]) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.5rem', color: C.forest }}>{val}</div>
                  <div style={{ color: C.muted, fontSize: '0.8rem', marginTop: '0.1rem' }}>
                    {label}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {currentUser && currentUser.id !== owner.id && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button
              onClick={() => setShowReport(true)}
              style={{
                background: 'none',
                border: 'none',
                color: C.muted,
                fontSize: '0.8rem',
                cursor: 'pointer',
                padding: '0.25rem 0.5rem',
                textDecoration: 'underline',
                textUnderlineOffset: 3,
              }}
            >
              ⚑ Nutzer melden
            </button>
          </div>
        )}

        {showReport && currentUser && (
          <ReportModal
            currentUser={currentUser}
            reportedUser={owner}
            onClose={() => setShowReport(false)}
            addToast={addToast}
          />
        )}

        {/* Listings grid */}
        <p
          style={{
            fontSize: '0.75rem',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: C.sage,
            fontWeight: 700,
            marginBottom: '1rem',
          }}
        >
          Alle Inserate
        </p>
        {ownerListings.length === 0 ? (
          <EmptyState
            title="Noch keine Inserate"
            text="Dieser Verleiher hat noch nichts eingestellt."
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1.2rem',
            }}
          >
            {ownerListings.map((item) => (
              <div
                key={item.id}
                className="hover-card"
                style={{
                  background: 'white',
                  borderRadius: 20,
                  overflow: 'hidden',
                  border: `1px solid ${item.isAvailable === false ? C.terra : C.line}`,
                  boxShadow: C.shadow,
                  cursor: 'pointer',
                  opacity: item.isAvailable === false ? 0.72 : 1,
                }}
                onClick={() => onSelectListing(item)}
              >
                <div style={{ height: 180, background: C.sageLight, position: 'relative' }}>
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  )}
                  {item.isAvailable === false && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        background: C.terra,
                        color: 'white',
                        padding: '0.25rem 0.6rem',
                        borderRadius: 999,
                        fontSize: '0.72rem',
                        fontWeight: 800,
                      }}
                    >
                      Vergeben
                    </div>
                  )}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      background: 'rgba(255,255,255,0.93)',
                      color: C.forest,
                      padding: '0.25rem 0.6rem',
                      borderRadius: 999,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                    }}
                  >
                    {item.category}
                  </div>
                </div>
                <div style={{ padding: '1.1rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      gap: '0.5rem',
                      marginBottom: '0.35rem',
                    }}
                  >
                    <h3 style={{ color: C.forest, margin: 0, fontSize: '1rem', lineHeight: 1.2 }}>
                      {item.title}
                    </h3>
                    <span
                      style={{
                        color: C.terra,
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.price}
                    </span>
                  </div>
                  <p style={{ color: C.muted, margin: '0 0 0.6rem', fontSize: '0.82rem' }}>
                    {item.location}
                  </p>
                  <RatingStars rating={item.rating} reviews={item.reviews} small />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
