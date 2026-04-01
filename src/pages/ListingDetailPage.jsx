import { useEffect, useState } from 'react';
import { C, STORAGE_KEYS } from '../constants';
import { primaryButtonStyle } from '../styles';
import ImageGallery from '../components/ImageGallery';
import ListingMap from '../components/ListingMap';
import ReviewsSection from '../components/ReviewsSection';
import VerifiedBadge from '../components/VerifiedBadge';
import BookingCalendar from '../components/BookingCalendar';
import ReportModal from '../components/ReportModal';
import { supabase } from '../supabase';

export default function ListingDetailPage({
  listing,
  goTo,
  currentUser,
  onStartMessage,
  allListings,
  onSelectListing,
  favorites,
  toggleFavorite,
  addToast,
  onEditListing,
  onDeleteListing,
  onReviewAdded,
  onToggleAvailability,
  onViewOwner,
  onBook,
}) {
  const [ownerProfile, setOwnerProfile] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [onWatchlist, setOnWatchlist] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}?inserat=${listing.id}`;
    const shareText = `${listing.title} – ${listing.price} auf ria`;
    if (navigator.share) {
      try { await navigator.share({ title: listing.title, text: shareText, url }); } catch { /* ignore */ }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        addToast('Link kopiert! 📋');
      } catch {
        addToast('Link: ' + url);
      }
    }
  }

  useEffect(() => {
    if (!listing?.userId || listing.userId === 'demo') return;
    supabase
      .from('profiles')
      .select('phone')
      .eq('id', listing.userId)
      .single()
      .then(({ data }) => {
        if (data) setOwnerProfile(data);
      });
  }, [listing?.userId]);

  // Increment view counter — only for non-owners
  useEffect(() => {
    if (!listing?.id || listing.userId === 'demo') return;
    if (currentUser?.id === listing.userId) return;
    supabase.rpc('increment_listing_views', { p_listing_id: listing.id }).then(() => {});
  }, [listing?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Track recently viewed
  useEffect(() => {
    if (!listing?.id) return;
    try {
      const prev = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENTLY_VIEWED) || '[]');
      const next = [String(listing.id), ...prev.filter((id) => id !== String(listing.id))].slice(0, 8);
      localStorage.setItem(STORAGE_KEYS.RECENTLY_VIEWED, JSON.stringify(next));
    } catch {}
  }, [listing?.id]);

  // Dynamic SEO meta tags + JSON-LD
  useEffect(() => {
    if (!listing) return;
    const prevTitle = document.title;
    document.title = `${listing.title} – ${listing.price} | ria`;
    const setMeta = (sel, attr, val) => document.querySelector(sel)?.setAttribute(attr, val);
    setMeta('meta[property="og:title"]', 'content', `${listing.title} | ria`);
    setMeta('meta[property="og:description"]', 'content', (listing.description || '').slice(0, 160));
    setMeta('meta[property="og:image"]', 'content', listing.image || 'https://ria-rentitall.de/og-image.png');
    setMeta('meta[name="twitter:title"]', 'content', `${listing.title} | ria`);
    setMeta('meta[name="twitter:description"]', 'content', (listing.description || '').slice(0, 160));
    setMeta('meta[name="twitter:image"]', 'content', listing.image || 'https://ria-rentitall.de/og-image.png');
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'ria-listing-jsonld';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: listing.title,
      description: listing.description,
      image: listing.image,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'EUR',
        availability: listing.isAvailable !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: { '@type': 'Person', name: listing.ownerName },
      },
    });
    document.head.appendChild(script);
    return () => {
      document.title = prevTitle;
      setMeta('meta[property="og:title"]', 'content', 'ria — rent it all');
      setMeta('meta[property="og:description"]', 'content', 'Miete und verleihe Gegenstände lokal — direkt von Mensch zu Mensch.');
      setMeta('meta[property="og:image"]', 'content', 'https://ria-rentitall.de/og-image.png');
      setMeta('meta[name="twitter:title"]', 'content', 'ria — rent it all');
      setMeta('meta[name="twitter:description"]', 'content', 'Miete und verleihe Gegenstände lokal — direkt von Mensch zu Mensch.');
      setMeta('meta[name="twitter:image"]', 'content', 'https://ria-rentitall.de/og-image.png');
      document.getElementById('ria-listing-jsonld')?.remove();
    };
  }, [listing?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load watchlist status
  useEffect(() => {
    if (!currentUser?.id || !listing?.id || listing.isAvailable !== false) return;
    supabase
      .from('watchlist')
      .select('id')
      .eq('user_id', currentUser.id)
      .eq('listing_id', String(listing.id))
      .maybeSingle()
      .then(({ data }) => setOnWatchlist(!!data));
  }, [currentUser?.id, listing?.id, listing?.isAvailable]);

  async function toggleWatchlist() {
    if (!currentUser?.id || !listing?.id) return;
    if (onWatchlist) {
      await supabase.from('watchlist').delete().eq('user_id', currentUser.id).eq('listing_id', String(listing.id));
      setOnWatchlist(false);
    } else {
      await supabase.from('watchlist').upsert({ user_id: currentUser.id, listing_id: String(listing.id) });
      setOnWatchlist(true);
    }
  }

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

  const similar = (allListings || [])
    .filter((l) => l.id !== listing.id && l.category === listing.category)
    .slice(0, 3);

  return (
    <div style={{ minHeight: '100vh', background: C.cream, padding: '3rem 1.5rem 5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
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
            marginBottom: '1.75rem',
            fontSize: '0.9rem',
          }}
        >
          ← Zurück
        </button>

        <div
          className="ria-detail-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.15fr 0.85fr',
            gap: '1.5rem',
            alignItems: 'start',
          }}
        >
          {/* Left: Image */}
          <div>
            <div
              style={{
                background: 'white',
                borderRadius: 28,
                overflow: 'hidden',
                boxShadow: C.shadow,
                border: `1px solid ${C.line}`,
                marginBottom: '1.5rem',
              }}
            >
              <ImageGallery
                mainImage={listing.image}
                images={listing.images}
                title={listing.title}
              />
              <div style={{ padding: '1.5rem' }}>
                <div
                  style={{
                    display: 'inline-block',
                    background: C.sageLight,
                    color: C.forest,
                    padding: '0.35rem 0.8rem',
                    borderRadius: 999,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    marginBottom: '1rem',
                  }}
                >
                  {listing.category}
                </div>
                <h1
                  style={{
                    fontSize: '2rem',
                    lineHeight: 1.1,
                    color: C.forest,
                    marginTop: 0,
                    marginBottom: '0.75rem',
                  }}
                >
                  {listing.title}
                </h1>
                <p style={{ color: C.ink, lineHeight: 1.75, margin: 0, fontSize: '0.97rem' }}>
                  {listing.description}
                </p>
              </div>
            </div>
            <ListingMap location={listing.location} />
          </div>

          {/* Right: Info + CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Price card */}
            <div
              style={{
                background: 'white',
                borderRadius: 24,
                padding: '1.75rem',
                boxShadow: C.shadow,
                border: `1px solid ${C.line}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.25rem',
                }}
              >
                <p
                  style={{
                    color: C.terra,
                    fontSize: '2rem',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    margin: 0,
                    flex: 1,
                  }}
                >
                  {listing.price}
                </p>
                <button
                  onClick={() => toggleFavorite(listing.id)}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background: favorites.includes(String(listing.id))
                      ? 'rgba(196,113,74,0.1)'
                      : C.sageLight,
                    border: `1px solid ${favorites.includes(String(listing.id)) ? C.terra : C.line}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    color: favorites.includes(String(listing.id)) ? C.terra : C.muted,
                    flexShrink: 0,
                  }}
                >
                  {favorites.includes(String(listing.id)) ? '♥' : '♡'}
                </button>
                <button
                  onClick={handleShare}
                  title="Inserat teilen"
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background: C.sageLight,
                    border: `1px solid ${C.line}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    flexShrink: 0,
                  }}
                >
                  ↑
                </button>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: C.muted,
                  fontSize: '0.88rem',
                  marginBottom:
                    listing.kaution || listing.paymentMethods?.length ? '1rem' : '1.5rem',
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {listing.location}
              </div>

              {(listing.kaution || listing.paymentMethods?.length > 0) && (
                <div
                  style={{
                    background: C.cream,
                    borderRadius: 12,
                    padding: '0.85rem 1rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    alignItems: 'center',
                  }}
                >
                  {listing.kaution && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 600 }}>
                        Kaution:
                      </span>
                      <span
                        style={{
                          background: 'rgba(196,113,74,0.12)',
                          color: C.terra,
                          padding: '0.2rem 0.6rem',
                          borderRadius: 999,
                          fontSize: '0.82rem',
                          fontWeight: 700,
                        }}
                      >
                        {listing.kaution}
                      </span>
                    </div>
                  )}
                  {listing.paymentMethods?.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 600 }}>
                        Zahlung:
                      </span>
                      {listing.paymentMethods.map((m) => (
                        <span
                          key={m}
                          style={{
                            background: C.sageLight,
                            color: C.forest,
                            padding: '0.2rem 0.6rem',
                            borderRadius: 999,
                            fontSize: '0.82rem',
                            fontWeight: 600,
                          }}
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {listing.ownerName && (
                <div
                  onClick={() =>
                    onViewOwner && onViewOwner({ id: listing.userId, name: listing.ownerName })
                  }
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem',
                    borderRadius: 14,
                    background: C.sageLight,
                    marginBottom: '1.25rem',
                    cursor: onViewOwner ? 'pointer' : 'default',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (onViewOwner) e.currentTarget.style.background = '#dce8dc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = C.sageLight;
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #163126, #1C3A2E)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {listing.ownerName.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        color: C.forest,
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      {listing.ownerName}
                      {listing.ownerVerified && <VerifiedBadge small />}
                      {ownerProfile?.phone && <VerifiedBadge small variant="phone" />}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: C.sage }}>Profil ansehen →</div>
                  </div>
                  {listing.reviews > 0 && (
                    <div style={{ color: C.gold, fontWeight: 700, fontSize: '0.9rem' }}>
                      ★ {listing.rating.toFixed(1)}{' '}
                      <span style={{ color: C.muted, fontWeight: 400, fontSize: '0.78rem' }}>
                        ({listing.reviews})
                      </span>
                    </div>
                  )}
                </div>
              )}

              {currentUser?.id === listing.userId ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      background: C.sageLight,
                      borderRadius: 12,
                      padding: '0.75rem 1rem',
                      textAlign: 'center',
                      fontSize: '0.85rem',
                      color: C.forest,
                      fontWeight: 600,
                    }}
                  >
                    Das ist dein Inserat
                  </div>
                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <button
                      onClick={() => onEditListing(listing)}
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
                      Bearbeiten
                    </button>
                    <button
                      onClick={() => onDeleteListing(listing.id)}
                      style={{
                        flex: 1,
                        padding: '0.9rem',
                        borderRadius: 12,
                        border: 'none',
                        background: 'rgba(196,113,74,0.1)',
                        color: C.terra,
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                      }}
                    >
                      Löschen
                    </button>
                  </div>
                  <button
                    onClick={() => onToggleAvailability(listing.id, !listing.isAvailable)}
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      borderRadius: 12,
                      border: `1px solid ${listing.isAvailable ? C.line : C.terra}`,
                      background: listing.isAvailable ? 'white' : 'rgba(196,113,74,0.07)',
                      color: listing.isAvailable ? C.muted : C.terra,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.88rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span style={{ fontSize: '0.9rem' }}>{listing.isAvailable ? '✓' : '✗'}</span>
                    {listing.isAvailable
                      ? 'Verfügbar — als vergeben markieren'
                      : 'Vergeben — wieder freigeben'}
                  </button>
                </div>
              ) : listing.isAvailable === false ? (
                <div style={{ marginBottom: '0.75rem' }}>
                  <div
                    style={{
                      background: 'rgba(196,113,74,0.08)',
                      border: `1px solid ${C.terra}`,
                      borderRadius: 14,
                      padding: '1.1rem',
                      textAlign: 'center',
                      marginBottom: '0.6rem',
                    }}
                  >
                    <div style={{ fontWeight: 800, color: C.terra, marginBottom: '0.2rem' }}>
                      Momentan vergeben
                    </div>
                    <div style={{ fontSize: '0.82rem', color: C.muted }}>
                      Dieses Inserat ist aktuell nicht verfügbar.
                    </div>
                  </div>
                  {currentUser && (
                    <button
                      onClick={toggleWatchlist}
                      style={{
                        width: '100%',
                        padding: '0.85rem',
                        borderRadius: 14,
                        border: `1px solid ${onWatchlist ? C.forest : C.line}`,
                        background: onWatchlist ? C.sageLight : 'white',
                        color: onWatchlist ? C.forest : C.muted,
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      🔔 {onWatchlist ? 'Wirst benachrichtigt' : 'Benachrichtigen wenn verfügbar'}
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => onStartMessage(listing)}
                  style={{
                    ...primaryButtonStyle,
                    width: '100%',
                    padding: '1.1rem',
                    fontSize: '1rem',
                    borderRadius: 14,
                    marginBottom: '0.75rem',
                  }}
                >
                  {currentUser ? 'Nachricht senden' : 'Einloggen zum Schreiben'}
                </button>
              )}
              <button
                onClick={() => {
                  const text = `${listing.title} — ${listing.price} | ${listing.location} (via ria)`;
                  if (navigator.share) {
                    navigator
                      .share({ title: listing.title, text, url: window.location.href })
                      .catch(() => {});
                  } else {
                    navigator.clipboard
                      .writeText(text)
                      .then(() => addToast('Link kopiert!', 'info'))
                      .catch(() => {});
                  }
                }}
                style={{
                  padding: '0.85rem',
                  borderRadius: 14,
                  border: `1px solid ${C.line}`,
                  background: 'white',
                  color: C.forest,
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  justifyContent: 'center',
                  width: '100%',
                  marginBottom: '0.75rem',
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                Teilen
              </button>
              <p
                style={{
                  textAlign: 'center',
                  color: C.muted,
                  fontSize: '0.8rem',
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                Kostenlos & unverbindlich anfragen
              </p>

              {currentUser && currentUser.id !== listing.userId && listing.userId !== 'demo' && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                  <button
                    onClick={() => setShowReport(true)}
                    style={{ background: 'none', border: 'none', color: C.muted, fontSize: '0.78rem', cursor: 'pointer', padding: '0.25rem 0.5rem', textDecoration: 'underline', textUnderlineOffset: 3 }}
                  >
                    ⚑ Melden
                  </button>
                  <button
                    onClick={async () => {
                      if (!window.confirm(`${listing.ownerName} blockieren? Du siehst dann keine Nachrichten oder Inserate mehr von dieser Person.`)) return;
                      const blocked = Array.isArray(currentUser.blockedIds) ? currentUser.blockedIds : [];
                      if (blocked.includes(listing.userId)) return;
                      await supabase.from('profiles').update({ blocked_user_ids: [...blocked, listing.userId] }).eq('id', currentUser.id);
                      addToast(`${listing.ownerName} wurde blockiert.`, 'info');
                    }}
                    style={{ background: 'none', border: 'none', color: C.muted, fontSize: '0.78rem', cursor: 'pointer', padding: '0.25rem 0.5rem', textDecoration: 'underline', textUnderlineOffset: 3 }}
                  >
                    🚫 Blockieren
                  </button>
                </div>
              )}
            </div>

            {/* Trust signals */}
            <div
              style={{
                background: 'linear-gradient(135deg, white 0%, #f0f5f0 100%)',
                borderRadius: 20,
                padding: '1.25rem',
                border: `1.5px solid ${C.line}`,
              }}
            >
              {[
                ['💬', 'Direkt anfragen', 'Kläre alles persönlich mit dem Verleiher', false],
                ['🤝', 'Übergabe vor Ort', 'Treffe dich lokal – kein Versand, kein Mittelsmann', false],
                ['📄', 'Digitaler Mietvertrag', 'Schütze dich mit einem rechtssicheren Vertrag direkt im Chat (§126b BGB)', true],
                ['🌱', 'Gut fürs Klima', 'Mieten statt kaufen spart bis zu 80 % CO₂', false],
              ].map(([icon, t, d, highlight]) => (
                <div
                  key={t}
                  style={{
                    display: 'flex',
                    gap: '0.65rem',
                    alignItems: 'start',
                    marginBottom: '0.85rem',
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: C.sageLight,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '0.05rem',
                      fontSize: '0.9rem',
                    }}
                  >
                    {icon}
                  </div>
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        color: highlight ? C.forest : C.forest,
                        fontSize: '0.85rem',
                        ...(highlight ? { color: C.terra } : {}),
                      }}
                    >
                      {t}
                    </div>
                    <div style={{ color: C.muted, fontSize: '0.78rem', marginTop: '0.1rem' }}>
                      {d}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Booking calendar — only for listings not owned by current user and not demo */}
            {listing.userId !== 'demo' && currentUser?.id !== listing.userId && onBook && (
              <BookingCalendar
                listingId={String(listing.id)}
                currentUser={currentUser}
                onBook={({ startDate, endDate, startTime, endTime, mode: bookingMode }) =>
                  onBook(listing.id, listing.title, listing.userId, startDate, endDate, startTime, endTime, bookingMode)
                }
              />
            )}
          </div>
        </div>

        {showReport && (
          <ReportModal
            currentUser={currentUser}
            reportedUser={{ id: listing.userId, name: listing.ownerName }}
            listing={listing}
            onClose={() => setShowReport(false)}
            addToast={addToast}
          />
        )}

        {/* Bewertungen */}
        <ReviewsSection
          listingId={listing.id}
          listingUserId={listing.userId}
          currentUser={currentUser}
          addToast={addToast}
          onReviewAdded={onReviewAdded}
        />

        {/* Mehr vom Anbieter */}
        {(() => {
          const ownerOthers = (allListings || [])
            .filter((l) => l.userId === listing.userId && l.id !== listing.id)
            .slice(0, 3);
          if (!ownerOthers.length) return null;
          return (
            <div style={{ marginTop: '3rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1.25rem',
                  flexWrap: 'wrap',
                }}
              >
                <h2
                  style={{
                    color: C.forest,
                    fontSize: '1.5rem',
                    margin: 0,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Mehr von {listing.ownerName}
                </h2>
                <span style={{ fontSize: '0.82rem', color: C.muted }}>
                  {ownerOthers.length} weitere{ownerOthers.length !== 1 ? '' : 's'} Inserat
                  {ownerOthers.length !== 1 ? 'e' : ''}
                </span>
              </div>
              <div
                className="ria-grid-3"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gap: '1rem',
                }}
              >
                {ownerOthers.map((item) => (
                  <div
                    key={item.id}
                    className="hover-card"
                    style={{
                      background: 'white',
                      borderRadius: 20,
                      overflow: 'hidden',
                      border: `1px solid ${C.line}`,
                      boxShadow: C.shadow,
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      window.scrollTo(0, 0);
                      onSelectListing(item);
                    }}
                  >
                    <div style={{ height: 150, background: C.sageLight, position: 'relative' }}>
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
                            padding: '0.2rem 0.55rem',
                            borderRadius: 999,
                            fontSize: '0.68rem',
                            fontWeight: 800,
                          }}
                        >
                          Vergeben
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '1rem' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start',
                          gap: '0.4rem',
                          marginBottom: '0.3rem',
                        }}
                      >
                        <h3
                          style={{
                            color: C.forest,
                            margin: 0,
                            fontSize: '0.95rem',
                            lineHeight: 1.2,
                          }}
                        >
                          {item.title}
                        </h3>
                        <span
                          style={{
                            color: C.terra,
                            fontWeight: 800,
                            fontSize: '0.88rem',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.price}
                        </span>
                      </div>
                      <p style={{ color: C.muted, margin: 0, fontSize: '0.8rem' }}>
                        {item.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Similar listings */}
        {similar.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
            <h2
              style={{
                color: C.forest,
                fontSize: '1.5rem',
                marginBottom: '1.25rem',
                letterSpacing: '-0.02em',
              }}
            >
              Ähnliche Inserate
            </h2>
            <div
              className="ria-grid-3"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: '1rem',
              }}
            >
              {similar.map((item) => (
                <div
                  key={item.id}
                  className="hover-card"
                  style={{
                    background: 'white',
                    borderRadius: 20,
                    overflow: 'hidden',
                    border: `1px solid ${C.line}`,
                    boxShadow: C.shadow,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    window.scrollTo(0, 0);
                    onSelectListing(item);
                  }}
                >
                  <div style={{ height: 160, background: C.sageLight }}>
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
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                        gap: '0.5rem',
                      }}
                    >
                      <h3 style={{ color: C.forest, margin: '0 0 0.3rem', fontSize: '1rem' }}>
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
                    <p style={{ color: C.muted, margin: 0, fontSize: '0.82rem' }}>
                      {item.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
