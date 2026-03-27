import { useState } from 'react';
import { C } from '../constants';

export default function ImageGallery({ mainImage, images, title }) {
  const all = [mainImage, ...(images || [])].filter(Boolean);
  const [current, setCurrent] = useState(0);
  if (all.length === 0) return <div style={{ height: 460, background: C.sageLight, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted }}>Kein Bild</div>;
  return (
    <div style={{ position: "relative" }}>
      <div style={{ height: 460, background: C.sageLight, overflow: "hidden", position: "relative" }}>
        <img src={all[current]} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "opacity 0.25s ease" }} />
        {all.length > 1 && (
          <>
            <button aria-label="Vorheriges Bild" onClick={() => setCurrent((c) => (c - 1 + all.length) % all.length)} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", boxShadow: "0 2px 12px rgba(0,0,0,0.15)", zIndex: 1 }} aria-hidden={undefined}>‹</button>
            <button aria-label="Nächstes Bild" onClick={() => setCurrent((c) => (c + 1) % all.length)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", boxShadow: "0 2px 12px rgba(0,0,0,0.15)", zIndex: 1 }}>›</button>
            <div role="tablist" aria-label="Bildnavigation" style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: "0.4rem" }}>
              {all.map((_, i) => <button key={i} role="tab" aria-label={`Bild ${i + 1} von ${all.length}`} aria-selected={i === current} onClick={() => setCurrent(i)} style={{ width: i === current ? 20 : 6, height: 6, borderRadius: 3, background: i === current ? "white" : "rgba(255,255,255,0.55)", cursor: "pointer", transition: "all 0.2s ease", border: "none", padding: 0 }} />)}
            </div>
          </>
        )}
      </div>
      {all.length > 1 && (
        <div style={{ display: "flex", gap: "0.5rem", padding: "0.75rem 0 0", overflowX: "auto" }}>
          {all.map((img, i) => (
            <img key={i} src={img} alt="" onClick={() => setCurrent(i)} style={{ width: 70, height: 56, objectFit: "cover", borderRadius: 10, cursor: "pointer", border: i === current ? `2px solid ${C.forest}` : "2px solid transparent", opacity: i === current ? 1 : 0.65, flexShrink: 0, transition: "all 0.2s" }} />
          ))}
        </div>
      )}
    </div>
  );
}
