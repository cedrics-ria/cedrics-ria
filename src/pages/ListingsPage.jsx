import { useEffect, useMemo, useState } from 'react';
import { C } from '../constants';
import { inputBaseStyle, primaryButtonStyle, applyInputFocus, resetInputFocus } from '../styles';
import SkeletonCard from '../components/SkeletonCard';
import ScrollReveal from '../components/ScrollReveal';
import RatingStars from '../components/RatingStars';
import EmptyState from '../components/EmptyState';
import { useListingsSearch } from '../hooks/useListingsSearch.js';
import { smartImageUrl } from '../lib/getImageUrl.js';

export default function ListingsPage({
  listings,
  loading,
  goTo,
  onSelectListing,
  currentUser,
  favorites,
  toggleFavorite,
  initCategory,
  initSearch,
}) {
  const [search, setSearch] = useState(initSearch || '');
  const [categoryFilter, setCategoryFilter] = useState(initCategory || 'Alle');
  const [locationFilter, setLocationFilter] = useState('Alle');
  const [sort, setSort] = useState('newest');
  const [mode, setMode] = useState('all');
  const [visibleCount, setVisibleCount] = useState(12);
  const [priceFilter, setPriceFilter] = useState('Alle');

  // Sync when navigated from homepage with a pre-set filter
  useEffect(() => {
    if (initCategory && initCategory !== 'Alle') setCategoryFilter(initCategory);
    if (initSearch) setSearch(initSearch);
  }, [initCategory, initSearch]);

  // Server-side search — pass normalized filter values (empty string = no filter)
  const searchQuery = search;
  const selectedCategory = categoryFilter === 'Alle' ? '' : categoryFilter;
  const selectedLocation = locationFilter === 'Alle' ? '' : locationFilter;

  const { results: searchResults, searching } = useListingsSearch(
    searchQuery,
    selectedCategory,
    selectedLocation,
    { allListings: listings }
  );

  const categoryOptions = [
    'Alle',
    ...new Set(listings.map((item) => item.category).filter(Boolean)),
  ];
  const locationOptions = [
    'Alle',
    ...new Set(listings.map((item) => item.location).filter(Boolean)),
  ].slice(0, 8);

  useEffect(() => {
    setVisibleCount(12);
  }, [search, categoryFilter, locationFilter, priceFilter, mode, sort]);

  const filteredListings = useMemo(
    () =>
      searchResults
        .filter((item) => {
          const matchesUser =
            mode === 'all' ||
            (mode === 'mine' && currentUser && item.userId === currentUser.id) ||
            (mode === 'favorites' && favorites.includes(String(item.id)));
          return matchesUser;
        })
        .filter((item) => {
          if (priceFilter === 'Alle') return true;
          const m = item.price?.match(/(\d+[.,]?\d*)/);
          const p = m ? parseFloat(m[1].replace(',', '.')) : 999;
          if (priceFilter === 'bis 5 €') return p <= 5;
          if (priceFilter === 'bis 10 €') return p <= 10;
          if (priceFilter === 'bis 20 €') return p <= 20;
          if (priceFilter === 'über 20 €') return p > 20;
          return true;
        })
        .sort((a, b) => {
          if (sort === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          const getPrice = (item) => parseFloat((item.price || '0').replace(/[^0-9.]/g, '')) || 0;
          if (sort === 'cheapest') return getPrice(a) - getPrice(b);
          if (sort === 'expensive') return getPrice(b) - getPrice(a);
          return 0;
        }),
    [
      searchResults,
      mode,
      priceFilter,
      sort,
      currentUser,
      favorites,
    ]
  );

  const visibleListings = filteredListings.slice(0, visibleCount);
  const hasMore = filteredListings.length > visibleCount;

  return (
    <div style={{ minHeight: '100vh', background: C.cream, padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <p
              style={{
                fontSize: '0.75rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: C.sage,
                fontWeight: 500,
                marginBottom: '0.5rem',
              }}
            >
              Inserate
            </p>
            <h1 style={{ fontSize: '3rem', color: C.forest, margin: 0, letterSpacing: '-0.03em' }}>
              Finde, was du brauchst.
            </h1>
          </div>
          {currentUser ? (
            <button
              onClick={() => goTo('create-listing')}
              style={{
                ...primaryButtonStyle,
                padding: '0.9rem 1.4rem',
                borderRadius: 999,
                fontSize: '0.95rem',
              }}
            >
              Inserat erstellen
            </button>
          ) : (
            <button
              onClick={() => goTo('login')}
              style={{
                background: 'white',
                color: C.forest,
                padding: '0.9rem 1.4rem',
                borderRadius: 999,
                border: `1px solid ${C.line}`,
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(28,58,46,0.06)',
              }}
            >
              Einloggen zum Inserieren
            </button>
          )}
        </div>

        {/* Filters row */}
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              background: 'rgba(28,58,46,0.07)',
              borderRadius: 999,
              padding: '0.25rem',
            }}
          >
            {[
              ['all', 'Alle'],
              ['mine', 'Meine'],
              ['favorites', '♥ Favoriten'],
            ].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setMode(val)}
                style={{
                  padding: '0.55rem 1.1rem',
                  borderRadius: 999,
                  border: 'none',
                  background: mode === val ? 'white' : 'transparent',
                  color: mode === val ? C.forest : C.muted,
                  fontWeight: mode === val ? 700 : 600,
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  boxShadow: mode === val ? '0 2px 8px rgba(28,58,46,0.10)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div style={{ position: 'relative', marginLeft: 'auto' }}>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                padding: '0.6rem 2.5rem 0.6rem 1rem',
                borderRadius: 999,
                border: `1px solid ${C.line}`,
                background: 'white',
                color: C.forest,
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.88rem',
                appearance: 'none',
                WebkitAppearance: 'none',
              }}
            >
              <option value="newest">Neueste zuerst</option>
              <option value="cheapest">Günstigste zuerst</option>
              <option value="expensive">Teuerste zuerst</option>
            </select>
            <div
              style={{
                position: 'absolute',
                right: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: C.muted,
                fontSize: '0.75rem',
              }}
            >
              ▼
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <svg
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: C.sage,
              pointerEvents: 'none',
            }}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Suche nach Titel, Ort oder Beschreibung"
            onFocus={applyInputFocus}
            onBlur={resetInputFocus}
            style={{ ...inputBaseStyle, paddingLeft: '2.75rem' }}
          />
        </div>

        {/* Category chips */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {categoryOptions.map((option) => (
            <button
              key={option}
              onClick={() => setCategoryFilter(option)}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: 999,
                border: `1px solid ${C.line}`,
                background: categoryFilter === option ? C.forest : 'white',
                color: categoryFilter === option ? 'white' : C.forest,
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Location filter */}
        {locationOptions.length > 2 && (
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              marginBottom: '1.5rem',
              alignItems: 'center',
            }}
          >
            <span
              style={{ fontSize: '0.78rem', color: C.muted, fontWeight: 600, whiteSpace: 'nowrap' }}
            >
              📍 Ort:
            </span>
            {locationOptions.map((loc) => (
              <button
                key={loc}
                onClick={() => setLocationFilter(loc)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: 999,
                  border: `1px solid ${C.line}`,
                  background: locationFilter === loc ? C.terra : 'white',
                  color: locationFilter === loc ? 'white' : C.muted,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                }}
              >
                {loc}
              </button>
            ))}
          </div>
        )}
        {/* Price filter */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            marginBottom: '1.5rem',
            alignItems: 'center',
          }}
        >
          <span
            style={{ fontSize: '0.78rem', color: C.muted, fontWeight: 600, whiteSpace: 'nowrap' }}
          >
            💶 Preis:
          </span>
          {['Alle', 'bis 5 €', 'bis 10 €', 'bis 20 €', 'über 20 €'].map((opt) => (
            <button
              key={opt}
              onClick={() => setPriceFilter(opt)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 999,
                border: `1px solid ${C.line}`,
                background: priceFilter === opt ? C.gold : 'white',
                color: priceFilter === opt ? 'white' : C.muted,
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.8rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              {opt}
            </button>
          ))}
        </div>

        {!loading && (
          <p style={{ color: C.muted, marginBottom: '1.25rem', fontSize: '0.9rem' }}>
            {searching
              ? 'Suche...'
              : `${filteredListings.length} Inserat${filteredListings.length === 1 ? '' : 'e'} gefunden`}
          </p>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.2rem',
          }}
        >
          {loading || searching
            ? [1, 2, 3, 4, 5, 6].map((n) => <SkeletonCard key={n} />)
            : visibleListings.map((item, i) => (
                <ScrollReveal key={item.id} delay={Math.min(i * 60, 300)}>
                  <div
                    className="hover-card"
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
                    onClick={() => onSelectListing(item)}
                  >
                    <div
                      style={{
                        height: 190,
                        background: C.sageLight,
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {item.image ? (
                        <img
                          src={smartImageUrl(item.image, { width: 400, quality: 75 })}
                          alt={item.title}
                          loading="lazy"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: C.sage,
                            fontWeight: 500,
                          }}
                        >
                          {item.category}
                        </div>
                      )}
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
                      <button
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
                          color: favorites.includes(String(item.id)) ? C.terra : C.muted,
                        }}
                      >
                        {favorites.includes(String(item.id)) ? '♥' : '♡'}
                      </button>
                    </div>
                    <div style={{ padding: '1.25rem' }}>
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
                            fontSize: '1.1rem',
                            lineHeight: 1.2,
                          }}
                        >
                          {item.title}
                        </h2>
                        <span
                          style={{
                            color: C.terra,
                            fontWeight: 800,
                            fontSize: '1rem',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.price}
                        </span>
                      </div>
                      <p style={{ color: C.muted, fontSize: '0.85rem', margin: '0 0 0.6rem' }}>
                        {item.location}
                      </p>
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
                </ScrollReveal>
              ))}
        </div>

        {/* Mehr laden */}
        {!loading && hasMore && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', paddingTop: '1rem' }}>
            <button
              onClick={() => setVisibleCount((c) => c + 12)}
              style={{
                padding: '0.85rem 2.5rem',
                borderRadius: 999,
                border: `1px solid ${C.line}`,
                background: 'white',
                color: C.forest,
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.95rem',
                boxShadow: '0 4px 16px rgba(28,58,46,0.07)',
                transition: 'all 0.2s ease',
              }}
            >
              Mehr laden · {filteredListings.length - visibleCount} weitere
            </button>
          </div>
        )}

        {!loading &&
          filteredListings.length === 0 &&
          (() => {
            if (mode === 'mine' && !currentUser)
              return (
                <EmptyState
                  title="Einloggen zum Inserieren"
                  text="Melde dich an, um deine eigenen Inserate zu sehen und neue zu erstellen."
                  buttonLabel="Jetzt einloggen"
                  onClick={() => goTo('login')}
                />
              );
            if (mode === 'mine')
              return (
                <EmptyState
                  title="Noch kein Inserat erstellt"
                  text="Verleihe, was du gerade nicht brauchst – und verdiene dabei etwas dazu."
                  buttonLabel="Erstes Inserat erstellen"
                  onClick={() => goTo('create-listing')}
                />
              );
            if (mode === 'favorites')
              return (
                <EmptyState
                  title="Noch keine Favoriten"
                  text="Speichere Inserate mit dem ♥-Button – so findest du sie schnell wieder."
                  buttonLabel="Inserate durchstöbern"
                  onClick={() => setMode('all')}
                />
              );
            return (
              <EmptyState
                title="Keine Inserate gefunden"
                text="Versuche einen anderen Suchbegriff, eine andere Kategorie oder entferne den aktiven Filter."
                buttonLabel="Filter zurücksetzen"
                onClick={() => {
                  setSearch('');
                  setCategoryFilter('Alle');
                  setLocationFilter('Alle');
                  setPriceFilter('Alle');
                  setMode('all');
                }}
              />
            );
          })()}
      </div>
    </div>
  );
}
