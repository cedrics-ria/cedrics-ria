import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { C } from '../constants';
import { inputBaseStyle, primaryButtonStyle, applyInputFocus, resetInputFocus } from '../styles';
import SkeletonCard from '../components/SkeletonCard';
import ScrollReveal from '../components/ScrollReveal';
import EmptyState from '../components/EmptyState';
import ListingCard from '../components/ListingCard';
import { useListingsSearch } from '../hooks/useListingsSearch.js';

const ListingsMapView = lazy(() => import('../components/ListingsMapView'));

// Sync filter state to/from URL search params
function readUrlParams() {
  const p = new URLSearchParams(window.location.search);
  return {
    q: p.get('q') || '',
    cat: p.get('cat') || 'Alle',
    loc: p.get('loc') || 'Alle',
    sort: p.get('sort') || 'newest',
    view: p.get('view') || 'grid',
  };
}

function writeUrlParams(params) {
  const p = new URLSearchParams();
  if (params.q) p.set('q', params.q);
  if (params.cat && params.cat !== 'Alle') p.set('cat', params.cat);
  if (params.loc && params.loc !== 'Alle') p.set('loc', params.loc);
  if (params.sort && params.sort !== 'newest') p.set('sort', params.sort);
  if (params.view && params.view !== 'grid') p.set('view', params.view);
  const str = p.toString();
  const newUrl = str ? `${window.location.pathname}?${str}` : window.location.pathname;
  window.history.replaceState(window.history.state, '', newUrl);
}

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
  const urlParams = readUrlParams();
  const [search, setSearch] = useState(initSearch || urlParams.q);
  const [categoryFilter, setCategoryFilter] = useState(
    initCategory && initCategory !== 'Alle' ? initCategory : urlParams.cat
  );
  const [locationFilter, setLocationFilter] = useState(urlParams.loc);
  const [sort, setSort] = useState(urlParams.sort);
  const [mode, setMode] = useState('all');
  const [visibleCount, setVisibleCount] = useState(12);
  const [priceFilter, setPriceFilter] = useState('Alle');
  const [viewMode, setViewMode] = useState(urlParams.view); // 'grid' | 'map'

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

  const categoryOptions = useMemo(
    () => ['Alle', ...new Set(listings.filter((item) => item.category).map((item) => item.category))],
    [listings]
  );
  const locationOptions = useMemo(
    () => ['Alle', ...new Set(listings.filter((item) => item.location).map((item) => item.location))].slice(0, 8),
    [listings]
  );

  // Sync filters to URL so links are shareable
  useEffect(() => {
    writeUrlParams({ q: search, cat: categoryFilter, loc: locationFilter, sort, view: viewMode });
  }, [search, categoryFilter, locationFilter, sort, viewMode]);

  useEffect(() => {
    setVisibleCount(12);
    window.scrollTo({ top: 0, behavior: 'instant' });
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
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Grid / Map toggle */}
            <div style={{ display: 'inline-flex', background: 'rgba(28,58,46,0.07)', borderRadius: 999, padding: '0.2rem' }}>
              {[
                { val: 'grid', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>, label: 'Raster' },
                { val: 'map', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>, label: 'Karte' },
              ].map(({ val, icon, label }) => (
                <button key={val} onClick={() => setViewMode(val)} aria-label={label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.9rem', borderRadius: 999, border: 'none', background: viewMode === val ? 'white' : 'transparent', color: viewMode === val ? C.forest : C.muted, fontWeight: viewMode === val ? 700 : 500, cursor: 'pointer', fontSize: '0.82rem', boxShadow: viewMode === val ? '0 2px 8px rgba(28,58,46,0.10)' : 'none', transition: 'all 0.18s ease' }}>
                  {icon} {label}
                </button>
              ))}
            </div>
            {currentUser ? (
              <button onClick={() => goTo('create-listing')} style={{ ...primaryButtonStyle, padding: '0.9rem 1.4rem', borderRadius: 999, fontSize: '0.95rem' }}>
                Inserat erstellen
              </button>
            ) : (
              <button onClick={() => goTo('login')} style={{ background: 'white', color: C.forest, padding: '0.9rem 1.4rem', borderRadius: 999, border: `1px solid ${C.line}`, fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 20px rgba(28,58,46,0.06)' }}>
                Einloggen zum Inserieren
              </button>
            )}
          </div>
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

        {/* Location + Price filters */}
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'flex-start' }}>
          {locationOptions.length > 2 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: C.muted, fontWeight: 600, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Ort:
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
                    transition: 'all 0.18s ease',
                  }}
                >
                  {loc}
                </button>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: C.muted, fontWeight: 600, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              Preis:
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
                  transition: 'all 0.18s ease',
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {!loading && (
          <p style={{ color: C.muted, marginBottom: '1.25rem', fontSize: '0.9rem' }}>
            {searching
              ? 'Suche...'
              : `${filteredListings.length} Inserat${filteredListings.length === 1 ? '' : 'e'} gefunden`}
          </p>
        )}

        {viewMode === 'map' ? (
          <Suspense fallback={<div style={{ height: 520, background: 'white', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, border: `1px solid ${C.line}` }}>Karte wird geladen…</div>}>
            <ListingsMapView listings={filteredListings} onSelectListing={onSelectListing} />
          </Suspense>
        ) : (
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
                    <ListingCard
                      listing={item}
                      onSelect={onSelectListing}
                      favorites={favorites}
                      toggleFavorite={toggleFavorite}
                    />
                  </ScrollReveal>
                ))}
          </div>
        )}

        {/* Mehr laden */}
        {viewMode === 'grid' && !loading && hasMore && (
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
