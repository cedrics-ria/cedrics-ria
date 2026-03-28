import { useEffect, useState } from 'react';
import { C } from '../constants';

export default function ListingMap({ location }) {
  const [coords, setCoords] = useState(null);
  useEffect(() => {
    if (!location) return;
    fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data[0]) setCoords({ lat: data[0].lat, lon: data[0].lon });
      })
      .catch(() => {});
  }, [location]);
  if (!coords) return null;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(coords.lon) - 0.02},${parseFloat(coords.lat) - 0.01},${parseFloat(coords.lon) + 0.02},${parseFloat(coords.lat) + 0.01}&layer=mapnik&marker=${coords.lat},${coords.lon}`;
  return (
    <div
      style={{
        marginTop: '1rem',
        borderRadius: 20,
        overflow: 'hidden',
        border: `1px solid ${C.line}`,
        height: 200,
      }}
    >
      <iframe
        src={src}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Karte"
        loading="lazy"
      />
    </div>
  );
}
