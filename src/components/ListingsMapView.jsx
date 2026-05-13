import { useEffect, useRef, useState } from 'react';
import { C } from '../constants';
import { smartImageUrl } from '../lib/getImageUrl';

const NOMINATIM_CACHE_KEY = 'ria-geocode-cache';

function loadGeoCache() {
  try { return JSON.parse(localStorage.getItem(NOMINATIM_CACHE_KEY) || '{}'); }
  catch { return {}; }
}
function saveGeoCache(cache) {
  try { localStorage.setItem(NOMINATIM_CACHE_KEY, JSON.stringify(cache)); }
  catch {}
}

async function geocodeLocation(location, cache) {
  if (cache[location]) return cache[location];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'ria-rentitall/1.0' } }
    );
    const data = await res.json();
    if (data[0]) {
      const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      cache[location] = coords;
      saveGeoCache(cache);
      return coords;
    }
  } catch {}
  return null;
}

export default function ListingsMapView({ listings, onSelectListing }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [geocoding, setGeocoding] = useState(true);
  const [located, setLocated] = useState(0);

  useEffect(() => {
    if (!mapRef.current) return;

    let cancelled = false;

    async function initMap() {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (cancelled || mapInstanceRef.current) return;

      const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false }).setView([51.2, 10.4], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);
      mapInstanceRef.current = map;

      // Group listings by location
      const byLocation = {};
      listings.forEach((l) => {
        if (!l.location) return;
        if (!byLocation[l.location]) byLocation[l.location] = [];
        byLocation[l.location].push(l);
      });

      const uniqueLocations = Object.keys(byLocation);
      const cache = loadGeoCache();
      const bounds = [];
      let done = 0;

      for (const loc of uniqueLocations) {
        if (cancelled) return;
        const coords = await geocodeLocation(loc, cache);
        done++;
        if (!cancelled) setLocated(done);
        if (!coords || cancelled) continue;

        bounds.push(coords);
        const group = byLocation[loc];
        const count = group.length;

        // Custom div marker
        const icon = L.divIcon({
          className: '',
          html: `<div style="
            background: ${C.forest};
            color: white;
            border-radius: 50%;
            width: ${count > 1 ? 36 : 28}px;
            height: ${count > 1 ? 36 : 28}px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${count > 1 ? '0.8rem' : '0.65rem'};
            font-weight: 800;
            font-family: Inter, sans-serif;
            box-shadow: 0 4px 14px rgba(28,58,46,0.35);
            border: 2px solid white;
            cursor: pointer;
          ">${count > 1 ? count : '●'}</div>`,
          iconSize: [count > 1 ? 36 : 28, count > 1 ? 36 : 28],
          iconAnchor: [count > 1 ? 18 : 14, count > 1 ? 18 : 14],
        });

        const marker = L.marker(coords, { icon }).addTo(map);

        // Popup with listing cards
        const popupContent = `
          <div style="min-width:220px;max-width:260px;font-family:Inter,sans-serif;">
            <div style="font-size:0.75rem;font-weight:700;color:#7A9E7E;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.6rem;">${loc}</div>
            ${group.slice(0, 3).map((l) => `
              <div data-id="${l.id}" style="display:flex;gap:0.6rem;align-items:center;padding:0.5rem 0;border-bottom:1px solid rgba(28,58,46,0.08);cursor:pointer;">
                <img src="${smartImageUrl(l.image, { width: 60, quality: 70 })}" style="width:44px;height:44px;border-radius:8px;object-fit:cover;flex-shrink:0;" />
                <div>
                  <div style="font-weight:700;font-size:0.85rem;color:#1C3A2E;line-height:1.2;">${l.title}</div>
                  <div style="color:#C4714A;font-weight:800;font-size:0.8rem;">${l.price}</div>
                </div>
              </div>
            `).join('')}
            ${count > 3 ? `<div style="font-size:0.75rem;color:#7A7470;padding-top:0.4rem;">+${count - 3} weitere</div>` : ''}
          </div>
        `;

        const popup = L.popup({ closeButton: false, className: 'ria-map-popup' }).setContent(popupContent);
        marker.bindPopup(popup);

        popup.on('add', () => {
          setTimeout(() => {
            document.querySelectorAll('[data-id]').forEach((el) => {
              el.addEventListener('click', () => {
                const listing = group.find((l) => String(l.id) === el.dataset.id);
                if (listing) onSelectListing(listing);
              });
            });
          }, 50);
        });

        markersRef.current.push(marker);

        // Rate-limit Nominatim: 1 req/sec
        if (!cache[loc]) await new Promise((r) => setTimeout(r, 1100));
      }

      if (!cancelled && bounds.length > 0) {
        if (bounds.length === 1) {
          map.setView(bounds[0], 13);
        } else {
          map.fitBounds(bounds, { padding: [40, 40] });
        }
      }

      if (!cancelled) setGeocoding(false);
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = [];
      }
    };
  }, [listings, onSelectListing]);

  return (
    <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', border: `1px solid ${C.line}`, boxShadow: C.shadow }}>
      {geocoding && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1000, background: 'rgba(247,243,236,0.88)',
          backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
        }}>
          <div style={{ width: 36, height: 36, border: `3px solid ${C.sage}`, borderTopColor: C.forest, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontSize: '0.85rem', color: C.forest, fontWeight: 600 }}>
            Standorte werden geladen{located > 0 ? ` (${located})` : ''}…
          </span>
        </div>
      )}
      <div ref={mapRef} style={{ height: 520, width: '100%' }} />
      <style>{`
        .ria-map-popup .leaflet-popup-content-wrapper {
          border-radius: 16px;
          box-shadow: 0 20px 50px rgba(28,58,46,0.18);
          border: 1px solid rgba(28,58,46,0.08);
          padding: 0;
        }
        .ria-map-popup .leaflet-popup-content { margin: 1rem; }
        .ria-map-popup .leaflet-popup-tip-container { display: none; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
