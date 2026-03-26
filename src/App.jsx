import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "./supabase";

const C = {
  forest: "#1C3A2E",
  sage: "#7A9E7E",
  sageLight: "#EAF0EB",
  terra: "#C4714A",
  cream: "#F7F3EC",
  ink: "#1A1714",
  muted: "#7A7470",
  gold: "#C8A96B",
  line: "rgba(28,58,46,0.10)",
  shadow: "0 18px 50px rgba(28,58,46,0.10)",
};

const categoryImages = {
  Werkzeug: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&q=80",
  Technik: "https://images.unsplash.com/photo-1528395874238-34ebe249b3f2?w=1200&q=80",
  Outdoor: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80",
  "Outdoor & Sport": "https://images.unsplash.com/photo-1533240332313-0db49b459ad6?w=1200&q=80",
  "Foto & Technik": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&q=80",
  "Party & Events": "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&q=80",
  Musik: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=1200&q=80",
  "Bücher & Uni": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&q=80",
  Transport: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
  Gaming: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1200&q=80",
  Sonstiges: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80",
};

const initialListings = [
  {
    id: 1,
    title: "Bohrmaschine",
    price: "5€ / Tag",
    location: "Paderborn",
    description: "Ideal für kleine Arbeiten in der Wohnung. Voll funktionsfähig und mit Koffer.",
    image: categoryImages.Werkzeug,
    category: "Werkzeug",
    rating: 4.9,
    reviews: 18,
    featured: true,
    userId: 1001,
    ownerName: "Lisa",
    status: "aktiv",
  },
  {
    id: 2,
    title: "Beamer",
    price: "8€ / Tag",
    location: "Uni Paderborn",
    description: "Perfekt für Präsentationen oder Filmabende. HDMI-Kabel inklusive.",
    image: categoryImages.Technik,
    category: "Technik",
    rating: 4.8,
    reviews: 11,
    featured: true,
    userId: 1002,
    ownerName: "Mert",
    status: "aktiv",
  },
  {
    id: 3,
    title: "Campingstuhl",
    price: "3€ / Tag",
    location: "Paderborn",
    description: "Leicht, klappbar und bequem für unterwegs. Ideal für Festivals oder Balkon.",
    image: categoryImages.Outdoor,
    category: "Outdoor",
    rating: 4.7,
    reviews: 7,
    featured: false,
    userId: 1003,
    ownerName: "Paul",
    status: "aktiv",
  },
  {
    id: 4,
    title: "Mikrowelle für WG-Party",
    price: "4€ / Tag",
    location: "Paderborn",
    description: "Schnell, sauber und perfekt für den kurzfristigen Einsatz in der WG oder beim Event.",
    image: categoryImages["Party & Events"],
    category: "Party & Events",
    rating: 4.6,
    reviews: 5,
    featured: false,
    userId: 1004,
    ownerName: "Tina",
    status: "aktiv",
  },
];

const allCategoryNames = ["Werkzeug", "Technik", "Outdoor & Sport", "Foto & Technik", "Party & Events", "Musik", "Bücher & Uni", "Transport", "Gaming", "Sonstiges"];

const categories = [
  { name: "Outdoor & Sport", img: categoryImages["Outdoor & Sport"] },
  { name: "Werkzeug", img: categoryImages.Werkzeug },
  { name: "Foto & Technik", img: categoryImages["Foto & Technik"] },
  { name: "Party & Events", img: categoryImages["Party & Events"] },
  { name: "Musik", img: categoryImages.Musik },
  { name: "Bücher & Uni", img: categoryImages["Bücher & Uni"] },
  { name: "Transport", img: categoryImages.Transport },
  { name: "Gaming", img: categoryImages.Gaming },
];

const steps = [
  { num: "01", title: "Suchen oder Inserieren", desc: "Durchstöbere Gegenstände in deiner Nähe oder biete deine eigenen an und verdiene nebenbei." },
  { num: "02", title: "Kontakt & Einigung", desc: "Schreibe dem Vermieter direkt, einige dich auf Preis und Zeitraum und klärt die Übergabe." },
  { num: "03", title: "Abholen & Nutzen", desc: "Trefft euch lokal, übergebt den Gegenstand und gebt euch danach Feedback." },
];

const inputBaseStyle = {
  width: "100%",
  padding: "0.95rem 1rem",
  borderRadius: 16,
  border: "1px solid rgba(28,58,46,0.15)",
  fontSize: "1rem",
  background: "rgba(255,255,255,0.92)",
  backdropFilter: "blur(6px)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
  outline: "none",
};

const primaryButtonStyle = {
  background: "linear-gradient(135deg, #C4714A, #A95A3A)",
  color: "white",
  padding: "1rem 1.2rem",
  borderRadius: 14,
  border: "none",
  fontSize: "1rem",
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 14px 34px rgba(196,113,74,0.28)",
};

function applyInputFocus(event) {
  event.target.style.border = `1px solid ${C.forest}`;
  event.target.style.boxShadow = "0 0 0 4px rgba(28,58,46,0.08)";
}

function resetInputFocus(event) {
  event.target.style.border = "1px solid rgba(28,58,46,0.15)";
  event.target.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.6)";
}

function getFallbackImage(category) {
  return categoryImages[category] || categoryImages.Sonstiges;
}

function Logo({ size = 1.9, color = C.forest }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: "0.05em" }}>
      <span style={{ fontFamily: "Georgia, serif", fontSize: size + "rem", fontWeight: 700, color }}>r</span>
      <span style={{ position: "relative", display: "inline-flex", flexDirection: "column", alignItems: "center" }}>
        <span style={{ fontFamily: "Georgia, serif", fontSize: size + "rem", fontWeight: 700, fontStyle: "italic", color }}>ı</span>
        <span style={{ position: "absolute", top: "-0.15em", animation: "sway 3s ease-in-out infinite", transformOrigin: "bottom center" }}>
          <svg width={size * 5.5} height={size * 7} viewBox="0 0 10 13" fill="none">
            <path d="M5 1C5 1 1 3.5 1 7C1 9.8 2.8 11.8 5 12.5C7.2 11.8 9 9.8 9 7C9 3.5 5 1 5 1Z" fill={C.sage} />
            <path d="M5 12.5V6" stroke={color === "white" ? C.forest : "white"} strokeWidth="0.8" strokeLinecap="round" />
          </svg>
        </span>
      </span>
      <span style={{ fontFamily: "Georgia, serif", fontSize: size + "rem", fontWeight: 700, fontStyle: "italic", color }}>a</span>
    </div>
  );
}

function Toaster({ toasts }) {
  return (
    <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 9999, display: "flex", flexDirection: "column", gap: "0.75rem", pointerEvents: "none" }}>
      {toasts.map((t) => (
        <div key={t.id} style={{ background: t.type === "error" ? C.terra : C.forest, color: "white", padding: "0.9rem 1.25rem", borderRadius: 14, fontSize: "0.95rem", fontWeight: 600, boxShadow: "0 12px 30px rgba(0,0,0,0.18)", animation: "fadeUp 0.3s ease both", maxWidth: 340 }}>
          {t.text}
        </div>
      ))}
    </div>
  );
}

function AnimatedStat({ value, label }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setVisible(true); }, { threshold: 0.4 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ padding: "1.75rem 1.5rem", borderRadius: 20, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(6px)", transition: "opacity 0.7s ease, transform 0.7s ease", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)" }}>
      <div style={{ fontSize: "2rem", fontWeight: 700, color: "white", marginBottom: "0.35rem" }}>{value}</div>
      <div style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{label}</div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: "white", borderRadius: 20, overflow: "hidden", border: `1px solid ${C.line}` }}>
      <div style={{ height: 180, background: "linear-gradient(90deg, #EAF0EB 25%, #dce8dc 50%, #EAF0EB 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
      <div style={{ padding: "1.4rem" }}>
        {[60, 40, 80].map((w) => (
          <div key={w} style={{ height: 14, borderRadius: 8, background: "#EAF0EB", marginBottom: "0.65rem", width: `${w}%`, animation: "shimmer 1.4s infinite" }} />
        ))}
        <div style={{ height: 38, borderRadius: 12, background: "#EAF0EB", marginTop: "0.5rem", animation: "shimmer 1.4s infinite" }} />
      </div>
    </div>
  );
}

function AnimatedCounter({ to, suffix = "", prefix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 1400;
        const startTime = Date.now();
        const tick = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(eased * to));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [to]);
  return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

function ScrollReveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); observer.disconnect(); } }, { threshold: 0.08 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ transition: `opacity 0.55s ${delay}ms ease, transform 0.55s ${delay}ms ease`, opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(22px)" }}>
      {children}
    </div>
  );
}

function OnboardingModal({ user, onClose, goTo }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", animation: "fadeUp 0.3s ease" }}>
      <div style={{ background: "white", borderRadius: 28, padding: "2.5rem", maxWidth: 520, width: "100%", boxShadow: "0 40px 80px rgba(0,0,0,0.25)", animation: "fadeUp 0.4s 0.1s both", textAlign: "center" }}>
        <div style={{ width: 70, height: 70, borderRadius: "50%", background: "linear-gradient(135deg, #163126, #1C3A2E)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem", fontSize: "1.6rem", fontWeight: 800 }}>
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
        <div style={{ display: "inline-block", padding: "0.35rem 0.85rem", borderRadius: 999, background: "#EAF0EB", color: "#1C3A2E", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1rem" }}>Willkommen bei ria</div>
        <h2 style={{ color: "#1C3A2E", fontSize: "1.9rem", marginTop: 0, marginBottom: "0.75rem", letterSpacing: "-0.03em" }}>Hey {user?.name?.split(" ")[0]}!</h2>
        <p style={{ color: "#7A7470", lineHeight: 1.7, marginBottom: "2rem", fontSize: "1rem" }}>Schön, dass du dabei bist. Du kannst jetzt Inserate durchstöbern, eigene Sachen verleihen und mit anderen in Kontakt treten.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "2rem" }}>
          {[["Mieten", "Stöbere durch hunderte Inserate in deiner Stadt."], ["Verleihen", "Erstelle ein Inserat und verdiene nebenbei."], ["Verbinden", "Schreibe direkt und kläre alles persönlich."]].map(([t, d]) => (
            <div key={t} style={{ background: "#EAF0EB", borderRadius: 16, padding: "1rem 0.75rem" }}>
              <div style={{ fontWeight: 800, color: "#1C3A2E", marginBottom: "0.35rem", fontSize: "0.95rem" }}>{t}</div>
              <div style={{ fontSize: "0.78rem", color: "#7A7470", lineHeight: 1.5 }}>{d}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={() => { goTo("listings"); onClose(); }} style={{ flex: 1, background: "#1C3A2E", color: "white", padding: "1rem", borderRadius: 14, border: "none", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem" }}>Inserate entdecken</button>
          <button onClick={() => { goTo("create-listing"); onClose(); }} style={{ flex: 1, background: "#C4714A", color: "white", padding: "1rem", borderRadius: 14, border: "none", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem" }}>Inserat erstellen</button>
        </div>
        <button onClick={onClose} style={{ marginTop: "1rem", background: "none", border: "none", color: "#7A7470", cursor: "pointer", fontSize: "0.88rem" }}>Später</button>
      </div>
    </div>
  );
}

function NavButton({ label, active, onClick }) {
  return (
    <button
      className="ria-topbar-navbtn"
      onClick={onClick}
      style={{
        background: active ? "linear-gradient(135deg, #163126, #1C3A2E)" : "rgba(255,255,255,0.72)",
        color: active ? "white" : C.forest,
        border: active ? "1px solid transparent" : `1px solid ${C.line}`,
        borderRadius: 999,
        padding: "0.8rem 1.2rem",
        fontSize: "0.95rem",
        fontWeight: 700,
        cursor: "pointer",
        boxShadow: active ? "0 12px 28px rgba(28,58,46,0.18)" : "0 2px 10px rgba(28,58,46,0.04)",
        transition: "all 0.25s ease",
        letterSpacing: "-0.01em",
      }}
    >
      {label}
    </button>
  );
}

function RatingStars({ rating, reviews, small = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", color: C.gold, fontSize: small ? "0.86rem" : "0.95rem" }}>
      <span>{"★★★★★"}</span>
      <span style={{ color: C.ink, fontWeight: 700 }}>{(rating || 0).toFixed(1)}</span>
      <span style={{ color: C.muted }}>({reviews || 0})</span>
    </div>
  );
}

function EmptyState({ title, text, buttonLabel, onClick }) {
  return (
    <div style={{ background: "white", borderRadius: 24, border: `1px solid ${C.line}`, boxShadow: C.shadow, padding: "2rem", textAlign: "center" }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.sageLight, margin: "0 auto 0.75rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2C12 2 4 6 4 13c0 4.4 3.6 8 8 8s8-3.6 8-8c0-7-8-11-8-11z" fill={C.sage}/><path d="M12 21V11" stroke={C.forest} strokeWidth="1.5" strokeLinecap="round"/></svg>
      </div>
      <h3 style={{ color: C.forest, marginTop: 0, marginBottom: "0.5rem" }}>{title}</h3>
      <p style={{ color: C.muted, maxWidth: 520, margin: "0 auto 1.25rem", lineHeight: 1.7 }}>{text}</p>
      {buttonLabel ? (
        <button onClick={onClick} style={{ background: C.terra, color: "white", padding: "0.9rem 1.2rem", borderRadius: 12, border: "none", fontWeight: 700, cursor: "pointer" }}>
          {buttonLabel}
        </button>
      ) : null}
    </div>
  );
}

function TopBar({ currentPage, goTo, currentUser, onLogout, darkMode, onToggleDark }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuItemStyle = { display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: "0.65rem 1rem", borderRadius: 10, fontSize: "0.93rem", fontWeight: 600, color: C.forest, cursor: "pointer" };
  return (
    <div className="ria-topbar" style={{ position: "sticky", top: 0, zIndex: 300, background: "rgba(255,255,255,0.82)", backdropFilter: "blur(18px)", borderBottom: `1px solid ${C.line}`, padding: "0.85rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.8rem", flexWrap: "wrap", boxShadow: "0 8px 30px rgba(28,58,46,0.06)" }}>
      <div className="ria-topbar-logo" style={{ minWidth: 120, display: "flex", justifyContent: "center", alignItems: "center" }}><Logo size={1.6} color={C.forest} /></div>
      <NavButton label="Home" active={currentPage === "home"} onClick={() => goTo("home")} />
      <NavButton label="Inserate" active={currentPage === "listings"} onClick={() => goTo("listings")} />
      {!currentUser ? (
        <button onClick={() => goTo("login")} style={{ background: "linear-gradient(135deg, #163126, #1C3A2E)", color: "white", border: "none", borderRadius: 999, padding: "0.8rem 1.3rem", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 24px rgba(28,58,46,0.22)", letterSpacing: "-0.01em" }}>Einloggen →</button>
      ) : (
        <div style={{ position: "relative" }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: menuOpen ? C.sageLight : "rgba(255,255,255,0.72)", border: `1px solid ${C.line}`, borderRadius: 999, padding: "0.45rem 0.9rem 0.45rem 0.45rem", cursor: "pointer" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #163126, #1C3A2E)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 800 }}>
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: "0.9rem", fontWeight: 600, color: C.forest }}>{currentUser.name}</span>
            <span style={{ fontSize: "0.65rem", color: C.muted, display: "inline-block", transform: menuOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}>▾</span>
          </button>
          {menuOpen && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 398 }} onClick={() => setMenuOpen(false)} />
              <div style={{ position: "absolute", top: "calc(100% + 0.6rem)", right: 0, background: "white", borderRadius: 18, border: `1px solid ${C.line}`, boxShadow: "0 20px 50px rgba(28,58,46,0.14)", padding: "0.5rem", minWidth: 210, zIndex: 399, animation: "fadeUp 0.2s ease both" }}>
                <button style={menuItemStyle} onClick={() => { goTo("create-listing"); setMenuOpen(false); }}>Inserat erstellen</button>
                <button style={menuItemStyle} onClick={() => { goTo("messages"); setMenuOpen(false); }}>Nachrichten</button>
                <button style={menuItemStyle} onClick={() => { goTo("profile"); setMenuOpen(false); }}>Profil</button>
                <div style={{ borderTop: `1px solid ${C.line}`, margin: "0.4rem 0" }} />
                <button style={{ ...menuItemStyle, color: C.terra }} onClick={() => { onLogout(); setMenuOpen(false); }}>Ausloggen</button>
              </div>
            </>
          )}
        </div>
      )}
      <button onClick={onToggleDark} title={darkMode ? "Hell" : "Dunkel"} style={{ width: 36, height: 36, borderRadius: "50%", border: `1px solid ${C.line}`, background: darkMode ? C.ink : "rgba(255,255,255,0.72)", color: darkMode ? "white" : C.forest, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, fontSize: "0.95rem" }}>
        {darkMode ? "☀" : "☾"}
      </button>
    </div>
  );
}

function HomePage({ goTo, listings }) {
  const featuredListings = (() => {
    const f = listings.filter((item) => item.featured).slice(0, 3);
    return f.length > 0 ? f : listings.slice(0, 3);
  })();

  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>
      <section className="ria-hero-section" style={{ background: "linear-gradient(135deg, #173126 0%, #1C3A2E 48%, #244536 100%)", color: "white", padding: "6rem 1.5rem 5rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at top right, rgba(200,169,107,0.18), transparent 28%), radial-gradient(circle at bottom left, rgba(122,158,126,0.16), transparent 24%)", pointerEvents: "none" }} />
        <div className="ria-hero-grid" style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" }}>
          <div>
            <div style={{ marginBottom: "1.5rem", animation: "fadeUp 0.6s ease both" }}>
              <Logo size={2.6} color="white" />
              <div style={{ marginTop: "0.05rem", fontSize: "0.9rem", fontStyle: "italic", fontFamily: "Georgia, serif", color: "rgba(255,255,255,0.42)", letterSpacing: "0.08em" }}>rent it all.</div>
            </div>
            <div style={{ display: "inline-block", padding: "0.5rem 1rem", borderRadius: 999, border: "1px solid rgba(255,255,255,0.16)", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.82)", fontSize: "0.78rem", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "1.25rem", animation: "fadeUp 0.7s 0.1s both", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}>Lokal. Nachhaltig. Günstig.</div>
            <h1 style={{ fontSize: "clamp(2rem, 8vw, 5.4rem)", lineHeight: 1.02, margin: 0, marginBottom: "1rem", animation: "fadeUp 0.8s 0.2s both", letterSpacing: "-0.04em", textWrap: "balance" }}>Miete lokal –<br />von Mensch zu Mensch.</h1>
            <p style={{ maxWidth: 720, fontSize: "1.12rem", lineHeight: 1.8, color: "rgba(255,255,255,0.76)", marginBottom: "2.2rem", animation: "fadeUp 0.9s 0.3s both" }}>Verleihe, was du nicht brauchst. Miete, was du kurz brauchst. Direkt, günstig, nachhaltig.</p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", animation: "fadeUp 1s 0.4s both" }}>
              <button onClick={() => goTo("listings")} style={{ background: C.terra, color: "white", padding: "1rem 1.5rem", borderRadius: 14, border: "none", fontWeight: 700, cursor: "pointer", boxShadow: "0 14px 30px rgba(196,113,74,0.35)" }}>Jetzt entdecken</button>
              <button onClick={() => goTo("create-listing")} style={{ background: "rgba(255,255,255,0.08)", color: "white", padding: "1rem 1.5rem", borderRadius: 14, border: "1px solid rgba(255,255,255,0.18)", fontWeight: 700, cursor: "pointer", backdropFilter: "blur(6px)" }}>Inserat erstellen</button>
            </div>
          </div>
          <div className="ria-hero-cards" style={{ display: "flex", flexDirection: "column", gap: "1rem", animation: "fadeUp 0.8s 0.3s both" }}>
            {initialListings.slice(0, 2).map((item, i) => (
              <div key={item.id} style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: "1rem 1.25rem", display: "flex", gap: "1rem", alignItems: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", transform: i === 1 ? "translateX(1.5rem) rotate(1deg)" : "rotate(-1deg)" }}>
                <img src={item.image} alt={item.title} style={{ width: 64, height: 64, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />
                <div>
                  <div style={{ color: "white", fontWeight: 700, marginBottom: "0.2rem" }}>{item.title}</div>
                  <div style={{ color: C.terra, fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.2rem" }}>{item.price}</div>
                  <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.82rem" }}>{item.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "3rem 1.5rem 1rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
            <div>
              <p style={{ fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase", color: C.sage, fontWeight: 700, marginBottom: "0.75rem" }}>Beliebt in deiner Nähe</p>
              <h2 style={{ fontSize: "2.1rem", color: C.forest, margin: 0, letterSpacing: "-0.03em" }}>Beliebte Inserate aus Paderborn</h2>
            </div>
            <button onClick={() => goTo("listings")} style={{ background: "white", color: C.forest, border: `1px solid ${C.line}`, borderRadius: 999, padding: "0.8rem 1rem", fontWeight: 700, cursor: "pointer" }}>Alles ansehen</button>
          </div>
          <div className="ria-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1rem" }}>
            {featuredListings.map((item) => (
              <div key={item.id} className="hover-card" style={{ background: "white", borderRadius: 24, overflow: "hidden", border: `1px solid ${C.line}`, boxShadow: C.shadow }}>
                <div style={{ position: "relative", height: 220 }}>
                  <img src={item.image || getFallbackImage(item.category)} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(255,255,255,0.95)", color: C.forest, padding: "0.35rem 0.7rem", borderRadius: 999, fontSize: "0.75rem", fontWeight: 800 }}>Beliebt</div>
                </div>
                <div style={{ padding: "1.2rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "start", marginBottom: "0.5rem" }}>
                    <h3 style={{ color: C.forest, margin: 0 }}>{item.title}</h3>
                    <span style={{ color: C.terra, fontWeight: 800, whiteSpace: "nowrap" }}>{item.price}</span>
                  </div>
                  <p style={{ color: C.muted, marginTop: 0, marginBottom: "0.65rem" }}>{item.location}</p>
                  <RatingStars rating={item.rating} reviews={item.reviews} small />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "4rem 1.5rem 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase", color: C.sage, fontWeight: 700, marginBottom: "0.75rem" }}>So einfach geht's</p>
          <h2 style={{ fontSize: "2.35rem", color: C.forest, marginTop: 0, marginBottom: "2rem", letterSpacing: "-0.03em" }}>In drei Schritten mieten oder vermieten.</h2>
          <div className="ria-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1rem" }}>
            {steps.map((step) => (
              <div key={step.num} className="hover-card" style={{ background: "rgba(255,255,255,0.9)", borderRadius: 24, padding: "1.6rem", boxShadow: C.shadow, border: `1px solid ${C.line}` }}>
                <div style={{ fontSize: "2.2rem", color: C.gold, fontWeight: 800, marginBottom: "0.75rem" }}>{step.num}</div>
                <h3 style={{ color: C.forest, marginTop: 0, marginBottom: "0.5rem" }}>{step.title}</h3>
                <p style={{ color: C.muted, lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "#EAF0EB", padding: "5.5rem 1.5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2C12 2 4 6 4 13c0 4.4 3.6 8 8 8s8-3.6 8-8c0-7-8-11-8-11z" fill={C.sage}/><path d="M12 21V11" stroke={C.forest} strokeWidth="1.8" strokeLinecap="round"/></svg>
            <p style={{ fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase", color: C.sage, fontWeight: 700, margin: 0 }}>Gut für die Welt</p>
          </div>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: C.forest, marginTop: 0, marginBottom: "0.75rem", letterSpacing: "-0.03em", lineHeight: 1.1 }}>Teilen ist das Nachhaltigste,<br/>was du heute tun kannst.</h2>
          <p style={{ color: C.muted, lineHeight: 1.7, maxWidth: 580, marginBottom: "3rem", fontSize: "1.05rem" }}>Statt einmal kaufen und jahrelang verstauben lassen — einfach mieten, nutzen, zurückgeben. Gut für deinen Geldbeutel und den Planeten.</p>

          <div style={{ background: "linear-gradient(135deg, #173126 0%, #1C3A2E 100%)", borderRadius: 28, padding: "3rem 2.5rem", marginBottom: "2rem", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -50, right: -50, width: 260, height: 260, borderRadius: "50%", background: "rgba(122,158,126,0.08)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -70, left: -30, width: 200, height: 200, borderRadius: "50%", background: "rgba(200,169,107,0.07)", pointerEvents: "none" }} />
            <div className="ria-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "2.5rem", position: "relative", zIndex: 1 }}>
              {[
                { to: 15, suffix: " Min", label: "Wird eine Bohrmaschine in ihrem Leben durchschnittlich genutzt." },
                { to: 80, suffix: "%", label: "Aller Haushaltsgeräte werden weniger als einmal pro Monat benutzt." },
                { to: 50, prefix: "−", suffix: " kg", label: "CO₂ sparst du, wenn du mietest statt neu zu kaufen." },
              ].map((s) => (
                <div key={s.suffix}>
                  <div style={{ fontSize: "3.2rem", fontWeight: 800, color: "white", lineHeight: 1, marginBottom: "0.6rem", fontVariantNumeric: "tabular-nums" }}>
                    <AnimatedCounter to={s.to} suffix={s.suffix} prefix={s.prefix || ""} />
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.6, fontSize: "0.92rem" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="ria-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
            <div style={{ background: "rgba(196,113,74,0.07)", border: "1px solid rgba(196,113,74,0.18)", borderRadius: 24, padding: "2rem" }}>
              <div style={{ fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase", color: C.terra, fontWeight: 700, marginBottom: "1.25rem" }}>Kaufen</div>
              {[["€89–150", "Kaufpreis für eine Bohrmaschine"], ["25 kg CO₂", "Durch Produktion & Transport"], ["15 Min / Jahr", "Tatsächliche Nutzungsdauer"], ["Jahre im Keller", "Danach verstaubt sie"]].map(([val, label]) => (
                <div key={val} style={{ display: "flex", gap: "0.75rem", alignItems: "start", marginBottom: "0.9rem" }}>
                  <span style={{ color: C.terra, fontWeight: 800, minWidth: "5.5rem", fontSize: "0.93rem" }}>{val}</span>
                  <span style={{ color: C.muted, fontSize: "0.9rem", lineHeight: 1.5 }}>{label}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "white", border: `1px solid rgba(28,58,46,0.12)`, borderRadius: 24, padding: "2rem", boxShadow: C.shadow }}>
              <div style={{ fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase", color: C.sage, fontWeight: 700, marginBottom: "1.25rem" }}>Bei ria mieten</div>
              {[["€3–8 / Tag", "Nur zahlen, wenn du's brauchst"], ["~0.1 kg CO₂", "Kein Neukauf nötig"], ["Wann du willst", "Flexibel & spontan"], ["Für den Nächsten", "Das Gerät bleibt im Umlauf"]].map(([val, label]) => (
                <div key={val} style={{ display: "flex", gap: "0.75rem", alignItems: "start", marginBottom: "0.9rem" }}>
                  <span style={{ color: C.forest, fontWeight: 800, minWidth: "5.5rem", fontSize: "0.93rem" }}>{val}</span>
                  <span style={{ color: C.muted, fontSize: "0.9rem", lineHeight: 1.5 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ria-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1rem" }}>
            {[
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2C12 2 4 6 4 13c0 4.4 3.6 8 8 8s8-3.6 8-8c0-7-8-11-8-11z" fill={C.sage}/><path d="M12 21V11" stroke={C.forest} strokeWidth="1.6" strokeLinecap="round"/></svg>,
                title: "Weniger Produktion", desc: "Jedes gemietete Produkt verhindert einen Neukauf — und damit Emissionen durch Herstellung, Verpackung und Transport.", bg: "white",
              },
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.forest} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>,
                title: "Kreislaufwirtschaft", desc: "Dinge bleiben länger in Nutzung. Statt im Müll landet das Gerät beim Nächsten, der es braucht.", bg: C.sageLight,
              },
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.forest} strokeWidth="1.8" strokeLinecap="round"><circle cx="9" cy="7" r="3"/><circle cx="17" cy="7" r="3"/><path d="M3 21v-1a6 6 0 0 1 6-6h6a6 6 0 0 1 6 6v1"/></svg>,
                title: "Lokale Community", desc: "Ria verbindet Nachbarn, Studis und Locals direkt — ohne Umwege, von Mensch zu Mensch in deiner Stadt.", bg: "white",
              },
            ].map((item) => (
              <div key={item.title} className="hover-card" style={{ background: item.bg, border: `1px solid ${C.line}`, borderRadius: 24, padding: "1.75rem", boxShadow: C.shadow }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: C.sageLight, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>{item.icon}</div>
                <h3 style={{ color: C.forest, marginTop: 0, marginBottom: "0.5rem", fontSize: "1.1rem" }}>{item.title}</h3>
                <p style={{ color: C.muted, lineHeight: 1.65, margin: 0, fontSize: "0.93rem" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "2rem 1.5rem 4rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase", color: C.sage, fontWeight: 700, marginBottom: "0.75rem" }}>Kategorien</p>
          <h2 style={{ fontSize: "2.35rem", color: C.forest, marginTop: 0, marginBottom: "1.5rem", letterSpacing: "-0.03em" }}>Alles – wirklich alles.</h2>
          <div className="ria-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "1rem" }}>
            {categories.map((category) => (
              <div key={category.name} className="hover-media" style={{ borderRadius: 24, overflow: "hidden", position: "relative", minHeight: 210, animation: "fadeUp 0.6s ease both", boxShadow: C.shadow, border: `1px solid ${C.line}` }}>
                <img src={category.img} alt={category.name} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(16,33,26,0.92) 0%, rgba(28,58,46,0.22) 58%, rgba(28,58,46,0.08) 100%)" }} />
                <div style={{ position: "relative", zIndex: 1, minHeight: 210, display: "flex", alignItems: "flex-end", padding: "1.35rem", color: "white", fontWeight: 700, fontSize: "1.05rem" }}>{category.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function LoginPage({ onLogin, currentUser }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    if (!email.trim() || !password.trim()) { setError("Bitte E-Mail und Passwort ausfüllen."); setLoading(false); return; }
    if (mode === "register" && !name.trim()) { setError("Bitte auch deinen Namen angeben."); setLoading(false); return; }

    if (mode === "register") {
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password: password.trim(), options: { data: { name: name.trim() } } });
      setLoading(false);
      if (error) { setError(error.message); return; }
      if (!data.user) { setError("Registrierung fehlgeschlagen."); return; }
      onLogin({ id: data.user.id, name: name.trim(), email: data.user.email }, true);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: password.trim() });
    setLoading(false);
    if (error) { setError(error.message); return; }
    if (!data.user) { setError("Login fehlgeschlagen."); return; }
    onLogin({ id: data.user.id, name: data.user.user_metadata?.name || "User", email: data.user.email }, false);
  }

  const benefits = [
    ["Kostenlos inserieren", "Erstelle unbegrenzt Inserate und verdiene mit dem, was du bereits hast."],
    ["Direkt kontaktieren", "Kein Mittelsmann — kommuniziere direkt mit Verleihern und Mietern."],
    ["Nachhaltig & lokal", "Jede Miete spart CO₂. Gut für dich und den Planeten."],
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.cream, display: "flex" }}>
      {/* Left panel - branding */}
      <div className="ria-login-left" style={{ flex: "0 0 42%", background: "linear-gradient(160deg, #163126 0%, #1C3A2E 60%, #244536 100%)", padding: "4rem 3rem", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", background: "rgba(200,169,107,0.07)" }} />
        <div style={{ position: "absolute", bottom: -60, left: -40, width: 240, height: 240, borderRadius: "50%", background: "rgba(122,158,126,0.08)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ marginBottom: "2.5rem" }}>
            <Logo size={2.2} color="white" />
            <div style={{ marginTop: "0.05rem", fontSize: "0.85rem", fontStyle: "italic", fontFamily: "Georgia, serif", color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em" }}>rent it all.</div>
          </div>
          <h2 style={{ color: "white", fontSize: "1.7rem", marginTop: 0, marginBottom: "0.75rem", lineHeight: 1.2, letterSpacing: "-0.02em" }}>{mode === "register" ? "Werde Teil der Gemeinschaft." : "Schön, dass du wieder da bist."}</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: "2.5rem", fontSize: "0.95rem" }}>Paderborns Plattform für nachhaltige Nachbarschaftsmietgeschäfte.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {benefits.map(([title, desc]) => (
              <div key={title} style={{ display: "flex", gap: "0.85rem", alignItems: "start" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(122,158,126,0.3)", border: "1px solid rgba(122,158,126,0.5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "0.1rem" }}>
                  <svg width="11" height="11" viewBox="0 0 11 11"><polyline points="1.5,5.5 4.5,8.5 9.5,2.5" stroke="#7A9E7E" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div>
                  <div style={{ color: "white", fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.15rem" }}>{title}</div>
                  <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.82rem", lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1.5rem" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          {/* Tab toggle */}
          <div style={{ display: "flex", background: "rgba(28,58,46,0.06)", borderRadius: 14, padding: "0.3rem", marginBottom: "2rem", gap: "0.3rem" }}>
            {["login", "register"].map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(""); }} style={{ flex: 1, padding: "0.75rem", borderRadius: 10, border: "none", background: mode === m ? "white" : "transparent", color: mode === m ? C.forest : C.muted, fontWeight: mode === m ? 700 : 500, cursor: "pointer", fontSize: "0.92rem", boxShadow: mode === m ? "0 2px 10px rgba(28,58,46,0.1)" : "none", transition: "all 0.2s ease" }}>
                {m === "login" ? "Anmelden" : "Registrieren"}
              </button>
            ))}
          </div>

          <h1 style={{ fontSize: "1.9rem", color: C.forest, marginTop: 0, marginBottom: "0.4rem", letterSpacing: "-0.02em" }}>{mode === "login" ? "Willkommen zurück" : "Account erstellen"}</h1>
          <p style={{ color: C.muted, marginBottom: "1.75rem", fontSize: "0.9rem", lineHeight: 1.6 }}>{mode === "login" ? "Melde dich an, um Inserate zu verwalten und Nachrichten zu senden." : "In wenigen Sekunden dabei. Kostenlos und ohne Haken."}</p>

          {currentUser && <div style={{ padding: "0.9rem 1rem", borderRadius: 14, background: C.sageLight, color: C.forest, fontWeight: 600, marginBottom: "1rem", fontSize: "0.9rem" }}>Eingeloggt als {currentUser.name}</div>}
          {error && <div style={{ padding: "0.9rem 1rem", borderRadius: 14, background: "rgba(196,113,74,0.12)", color: C.terra, fontWeight: 600, marginBottom: "1rem", fontSize: "0.88rem", lineHeight: 1.5 }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {mode === "register" && (
              <div>
                <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.85rem", fontWeight: 700, color: C.forest }}>Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Dein Vorname" autoComplete="name" onFocus={applyInputFocus} onBlur={resetInputFocus} style={inputBaseStyle} />
              </div>
            )}
            <div>
              <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.85rem", fontWeight: 700, color: C.forest }}>E-Mail</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="du@uni-paderborn.de" autoComplete="email" onFocus={applyInputFocus} onBlur={resetInputFocus} style={inputBaseStyle} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.85rem", fontWeight: 700, color: C.forest }}>Passwort</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Mindestens 6 Zeichen" autoComplete={mode === "login" ? "current-password" : "new-password"} onFocus={applyInputFocus} onBlur={resetInputFocus} style={inputBaseStyle} />
            </div>
            <button type="submit" disabled={loading} style={{ background: loading ? C.muted : "linear-gradient(135deg, #163126, #1C3A2E)", color: "white", padding: "1.05rem", borderRadius: 14, border: "none", fontSize: "1rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 14px 34px rgba(28,58,46,0.25)", marginTop: "0.25rem", letterSpacing: "-0.01em" }}>
              {loading ? "Einen Moment..." : mode === "login" ? "Anmelden" : "Account erstellen"}
            </button>
          </form>

          <p style={{ textAlign: "center", color: C.muted, fontSize: "0.85rem", marginTop: "1.5rem" }}>
            {mode === "login" ? "Noch kein Account?" : "Schon dabei?"}{" "}
            <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} style={{ background: "none", border: "none", color: C.forest, fontWeight: 700, cursor: "pointer", fontSize: "0.85rem", textDecoration: "underline" }}>
              {mode === "login" ? "Jetzt registrieren" : "Zum Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function ListingsPage({ listings, loading, goTo, onSelectListing, currentUser, favorites, toggleFavorite }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Alle");
  const [sort, setSort] = useState("newest");
  const [mode, setMode] = useState("all");

  const categoryOptions = ["Alle", ...new Set(listings.map((item) => item.category).filter(Boolean))];

  const filteredListings = listings
    .filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || item.location.toLowerCase().includes(search.toLowerCase()) || (item.description || "").toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "Alle" || item.category === categoryFilter;
      const matchesUser = mode === "all" || (mode === "mine" && currentUser && item.userId === currentUser.id) || (mode === "favorites" && favorites.includes(item.id));
      return matchesSearch && matchesCategory && matchesUser;
    })
    .sort((a, b) => {
      if (sort === "newest") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      const getPrice = (item) => parseFloat((item.price || "0").replace(/[^0-9.]/g, "")) || 0;
      if (sort === "cheapest") return getPrice(a) - getPrice(b);
      if (sort === "expensive") return getPrice(b) - getPrice(a);
      return 0;
    });

  return (
    <div style={{ minHeight: "100vh", background: C.cream, padding: "4rem 1.5rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          <div>
            <p style={{ fontSize: "0.75rem", letterSpacing: "0.18em", textTransform: "uppercase", color: C.sage, fontWeight: 500, marginBottom: "0.5rem" }}>Inserate</p>
            <h1 style={{ fontSize: "3rem", color: C.forest, margin: 0, letterSpacing: "-0.03em" }}>Finde, was du brauchst.</h1>
          </div>
          {currentUser ? (
            <button onClick={() => goTo("create-listing")} style={{ ...primaryButtonStyle, padding: "0.9rem 1.4rem", borderRadius: 999, fontSize: "0.95rem" }}>Inserat erstellen</button>
          ) : (
            <button onClick={() => goTo("login")} style={{ background: "white", color: C.forest, padding: "0.9rem 1.4rem", borderRadius: 999, border: `1px solid ${C.line}`, fontSize: "0.95rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 20px rgba(28,58,46,0.06)" }}>Einloggen zum Inserieren</button>
          )}
        </div>

        {/* Filters row */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "inline-flex", background: "rgba(28,58,46,0.07)", borderRadius: 999, padding: "0.25rem" }}>
            {[["all","Alle"],["mine","Meine"],["favorites","♥ Favoriten"]].map(([val, label]) => (
              <button key={val} onClick={() => setMode(val)} style={{ padding: "0.55rem 1.1rem", borderRadius: 999, border: "none", background: mode === val ? "white" : "transparent", color: mode === val ? C.forest : C.muted, fontWeight: mode === val ? 700 : 600, cursor: "pointer", fontSize: "0.88rem", boxShadow: mode === val ? "0 2px 8px rgba(28,58,46,0.10)" : "none", transition: "all 0.2s ease" }}>{label}</button>
            ))}
          </div>

          {/* Sort */}
          <div style={{ position: "relative", marginLeft: "auto" }}>
            <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ padding: "0.6rem 2.5rem 0.6rem 1rem", borderRadius: 999, border: `1px solid ${C.line}`, background: "white", color: C.forest, fontWeight: 600, cursor: "pointer", fontSize: "0.88rem", appearance: "none", WebkitAppearance: "none" }}>
              <option value="newest">Neueste zuerst</option>
              <option value="cheapest">Günstigste zuerst</option>
              <option value="expensive">Teuerste zuerst</option>
            </select>
            <div style={{ position: "absolute", right: "0.85rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: C.muted, fontSize: "0.75rem" }}>▼</div>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: "1rem" }}>
          <svg style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: C.sage, pointerEvents: "none" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Suche nach Titel, Ort oder Beschreibung" onFocus={applyInputFocus} onBlur={resetInputFocus} style={{ ...inputBaseStyle, paddingLeft: "2.75rem" }} />
        </div>

        {/* Category chips */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          {categoryOptions.map((option) => (
            <button key={option} onClick={() => setCategoryFilter(option)} style={{ padding: "0.45rem 0.9rem", borderRadius: 999, border: `1px solid ${C.line}`, background: categoryFilter === option ? C.forest : "white", color: categoryFilter === option ? "white" : C.forest, fontWeight: 600, cursor: "pointer", fontSize: "0.85rem", whiteSpace: "nowrap", transition: "all 0.2s ease" }}>
              {option}
            </button>
          ))}
        </div>

        {!loading && <p style={{ color: C.muted, marginBottom: "1.25rem", fontSize: "0.9rem" }}>{filteredListings.length} Inserat{filteredListings.length === 1 ? "" : "e"} gefunden</p>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.2rem" }}>
          {loading ? [1,2,3,4,5,6].map((n) => <SkeletonCard key={n} />) : filteredListings.map((item, i) => (
            <ScrollReveal key={item.id} delay={Math.min(i * 60, 300)}>
              <div className="hover-card" style={{ background: "white", borderRadius: 20, overflow: "hidden", border: `1px solid ${C.line}`, boxShadow: C.shadow, cursor: "pointer", height: "100%" }} onClick={() => onSelectListing(item)}>
                <div style={{ height: 190, background: C.sageLight, position: "relative", overflow: "hidden" }}>
                  {item.image ? <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: C.sage, fontWeight: 500 }}>{item.category}</div>}
                  <div style={{ position: "absolute", left: 10, bottom: 10, background: "rgba(255,255,255,0.93)", color: C.forest, padding: "0.3rem 0.65rem", borderRadius: 999, fontSize: "0.76rem", fontWeight: 700, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>{item.category}</div>
                  <button onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }} style={{ position: "absolute", top: 10, right: 10, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", zIndex: 1, color: favorites.includes(item.id) ? C.terra : C.muted }}>
                    {favorites.includes(item.id) ? "♥" : "♡"}
                  </button>
                </div>
                <div style={{ padding: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "0.5rem", marginBottom: "0.4rem" }}>
                    <h2 style={{ color: C.forest, margin: 0, fontSize: "1.1rem", lineHeight: 1.2 }}>{item.title}</h2>
                    <span style={{ color: C.terra, fontWeight: 800, fontSize: "1rem", whiteSpace: "nowrap" }}>{item.price}</span>
                  </div>
                  <p style={{ color: C.muted, fontSize: "0.85rem", margin: "0 0 0.6rem" }}>{item.location}</p>
                  <p style={{ color: C.ink, lineHeight: 1.6, fontSize: "0.88rem", margin: "0 0 1rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.description}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <RatingStars rating={item.rating} reviews={item.reviews} small />
                    <span style={{ fontSize: "0.78rem", color: C.sage, fontWeight: 600 }}>{item.ownerName}</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {!loading && filteredListings.length === 0 && (() => {
          if (mode === "mine" && !currentUser) return <EmptyState title="Einloggen zum Inserieren" text="Melde dich an, um deine eigenen Inserate zu sehen und neue zu erstellen." buttonLabel="Jetzt einloggen" onClick={() => goTo("login")} />;
          if (mode === "mine") return <EmptyState title="Noch kein Inserat erstellt" text="Verleihe, was du gerade nicht brauchst – und verdiene dabei etwas dazu." buttonLabel="Erstes Inserat erstellen" onClick={() => goTo("create-listing")} />;
          if (mode === "favorites") return <EmptyState title="Noch keine Favoriten" text="Speichere Inserate mit dem ♥-Button – so findest du sie schnell wieder." buttonLabel="Inserate durchstöbern" onClick={() => setMode("all")} />;
          return <EmptyState title="Keine Inserate gefunden" text="Versuche einen anderen Suchbegriff, eine andere Kategorie oder entferne den aktiven Filter." buttonLabel="Filter zurücksetzen" onClick={() => { setSearch(""); setCategoryFilter("Alle"); setMode("all"); }} />;
        })()}
      </div>
    </div>
  );
}

function ListingDetailPage({ listing, goTo, currentUser, onStartMessage, allListings, onSelectListing, favorites, toggleFavorite, addToast }) {
  if (!listing) {
    return (
      <div style={{ minHeight: "100vh", background: C.cream, padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h1 style={{ color: C.forest, marginBottom: "1rem" }}>Kein Inserat ausgewählt</h1>
          <button onClick={() => goTo("listings")} style={{ background: C.terra, color: "white", padding: "0.9rem 1.3rem", borderRadius: 12, border: "none", fontWeight: 600, cursor: "pointer" }}>Zurück zu den Inseraten</button>
        </div>
      </div>
    );
  }

  const similar = (allListings || []).filter((l) => l.id !== listing.id && l.category === listing.category).slice(0, 3);

  return (
    <div style={{ minHeight: "100vh", background: C.cream, padding: "3rem 1.5rem 5rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <button onClick={() => goTo("listings")} style={{ background: "white", color: C.forest, padding: "0.7rem 1.1rem", borderRadius: 12, border: `1px solid ${C.line}`, fontWeight: 600, cursor: "pointer", marginBottom: "1.75rem", fontSize: "0.9rem" }}>← Zurück</button>

        <div className="ria-detail-grid" style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: "1.5rem", alignItems: "start" }}>
          {/* Left: Image */}
          <div>
            <div style={{ background: "white", borderRadius: 28, overflow: "hidden", boxShadow: C.shadow, border: `1px solid ${C.line}`, marginBottom: "1.5rem" }}>
              <div style={{ height: 460, background: C.sageLight }}>
                {listing.image
                  ? <img src={listing.image} alt={listing.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: C.sage }}>Kein Bild</div>}
              </div>
              <div style={{ padding: "1.5rem" }}>
                <div style={{ display: "inline-block", background: C.sageLight, color: C.forest, padding: "0.35rem 0.8rem", borderRadius: 999, fontSize: "0.8rem", fontWeight: 700, marginBottom: "1rem" }}>{listing.category}</div>
                <h1 style={{ fontSize: "2rem", lineHeight: 1.1, color: C.forest, marginTop: 0, marginBottom: "0.75rem" }}>{listing.title}</h1>
                <p style={{ color: C.ink, lineHeight: 1.75, margin: 0, fontSize: "0.97rem" }}>{listing.description}</p>
              </div>
            </div>
            <ListingMap location={listing.location} />
          </div>

          {/* Right: Info + CTA */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Price card */}
            <div style={{ background: "white", borderRadius: 24, padding: "1.75rem", boxShadow: C.shadow, border: `1px solid ${C.line}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
                <p style={{ color: C.terra, fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em", margin: 0, flex: 1 }}>{listing.price}</p>
                <button onClick={() => toggleFavorite(listing.id)} style={{ width: 42, height: 42, borderRadius: "50%", background: favorites.includes(listing.id) ? "rgba(196,113,74,0.1)" : C.sageLight, border: `1px solid ${favorites.includes(listing.id) ? C.terra : C.line}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", color: favorites.includes(listing.id) ? C.terra : C.muted, flexShrink: 0 }}>
                  {favorites.includes(listing.id) ? "♥" : "♡"}
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: C.muted, fontSize: "0.88rem", marginBottom: "1.5rem" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {listing.location}
              </div>

              {listing.ownerName && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem", borderRadius: 14, background: C.sageLight, marginBottom: "1.25rem" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #163126, #1C3A2E)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: 800, flexShrink: 0 }}>
                    {listing.ownerName.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: C.forest, fontSize: "0.9rem" }}>{listing.ownerName}</div>
                    <div style={{ fontSize: "0.78rem", color: C.sage }}>Verleiht in deiner Nähe</div>
                  </div>
                  {listing.rating > 0 && <div style={{ marginLeft: "auto", color: C.gold, fontWeight: 700, fontSize: "0.9rem" }}>★ {listing.rating.toFixed(1)}</div>}
                </div>
              )}

              <button onClick={() => onStartMessage(listing)} style={{ ...primaryButtonStyle, width: "100%", padding: "1.1rem", fontSize: "1rem", borderRadius: 14, marginBottom: "0.75rem" }}>
                {currentUser ? "Nachricht senden" : "Einloggen zum Schreiben"}
              </button>
              <button onClick={() => {
                const text = `${listing.title} — ${listing.price} | ${listing.location} (via ria)`;
                if (navigator.share) {
                  navigator.share({ title: listing.title, text, url: window.location.href }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(text).then(() => addToast("Link kopiert!", "info")).catch(() => {});
                }
              }} style={{ padding: "0.85rem", borderRadius: 14, border: `1px solid ${C.line}`, background: "white", color: C.forest, cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center", width: "100%", marginBottom: "0.75rem" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                Teilen
              </button>
              <p style={{ textAlign: "center", color: C.muted, fontSize: "0.8rem", margin: 0, lineHeight: 1.5 }}>Kostenlos & unverbindlich anfragen</p>
            </div>

            {/* Trust signals */}
            <div style={{ background: "white", borderRadius: 20, padding: "1.25rem", border: `1px solid ${C.line}` }}>
              {[
                ["Direkt anfragen", "Kläre alles persönlich mit dem Verleiher"],
                ["Übergabe vor Ort", "Treffe dich lokal – kein Versand, kein Mittelsmann"],
                ["Gut fürs Klima", "Mieten statt kaufen spart bis zu 80 % CO₂"],
              ].map(([t, d]) => (
                <div key={t} style={{ display: "flex", gap: "0.65rem", alignItems: "start", marginBottom: "0.85rem" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: C.sageLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "0.1rem" }}>
                    <svg width="10" height="10" viewBox="0 0 10 10"><polyline points="1.5,5.5 4,8 8.5,2" stroke={C.sage} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: C.forest, fontSize: "0.85rem" }}>{t}</div>
                    <div style={{ color: C.muted, fontSize: "0.78rem", marginTop: "0.1rem" }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Similar listings */}
        {similar.length > 0 && (
          <div style={{ marginTop: "3rem" }}>
            <h2 style={{ color: C.forest, fontSize: "1.5rem", marginBottom: "1.25rem", letterSpacing: "-0.02em" }}>Ähnliche Inserate</h2>
            <div className="ria-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1rem" }}>
              {similar.map((item) => (
                <div key={item.id} className="hover-card" style={{ background: "white", borderRadius: 20, overflow: "hidden", border: `1px solid ${C.line}`, boxShadow: C.shadow, cursor: "pointer" }} onClick={() => { window.scrollTo(0, 0); onSelectListing(item); }}>
                  <div style={{ height: 160, background: C.sageLight }}>
                    {item.image && <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
                  </div>
                  <div style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "0.5rem" }}>
                      <h3 style={{ color: C.forest, margin: "0 0 0.3rem", fontSize: "1rem" }}>{item.title}</h3>
                      <span style={{ color: C.terra, fontWeight: 800, fontSize: "0.9rem", whiteSpace: "nowrap" }}>{item.price}</span>
                    </div>
                    <p style={{ color: C.muted, margin: 0, fontSize: "0.82rem" }}>{item.location}</p>
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

function MessageComposerPage({ listing, currentUser, goTo, onSendMessage }) {
  const [message, setMessage] = useState("");
  const [info, setInfo] = useState("");

  if (!listing) {
    return (
      <div style={{ minHeight: "100vh", background: C.cream, padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h1 style={{ color: C.forest, marginBottom: "1rem" }}>Kein Inserat ausgewählt</h1>
          <button onClick={() => goTo("listings")} style={{ background: C.terra, color: "white", padding: "0.9rem 1.3rem", borderRadius: 12, border: "none", fontWeight: 600, cursor: "pointer" }}>Zurück zu den Inseraten</button>
        </div>
      </div>
    );
  }

  function handleSend(event) {
    event.preventDefault();
    if (!currentUser) {
      goTo("login");
      return;
    }
    if (!message.trim()) {
      setInfo("Bitte schreibe zuerst eine Nachricht.");
      return;
    }
    onSendMessage({ id: Date.now(), listingId: listing.id, listingTitle: listing.title, fromName: currentUser.name, fromEmail: currentUser.email, text: message.trim(), createdAt: new Date().toISOString() });
    setMessage("");
    setInfo("Nachricht gespeichert. Als Nächstes können wir daraus ein echtes Nachrichtensystem bauen.");
  }

  return (
    <div style={{ minHeight: "100vh", background: C.cream, padding: "4rem 1.5rem" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <button onClick={() => goTo("listing-detail")} style={{ background: "white", color: C.forest, padding: "0.8rem 1.1rem", borderRadius: 12, border: `1px solid ${C.line}`, fontWeight: 600, cursor: "pointer", marginBottom: "1.5rem" }}>← Zurück zum Inserat</button>
        <div style={{ background: "white", borderRadius: 28, padding: "2rem", boxShadow: C.shadow, border: `1px solid ${C.line}` }}>
          <p style={{ fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.1em", color: C.sage, fontWeight: 700, marginBottom: "0.6rem" }}>Nachricht</p>
          <h1 style={{ fontSize: "2.2rem", color: C.forest, marginTop: 0, marginBottom: "0.75rem" }}>Anfrage zu „{listing.title}“</h1>
          <p style={{ color: C.muted, lineHeight: 1.7, marginBottom: "1.5rem" }}>{currentUser ? `Du schreibst als ${currentUser.name} (${currentUser.email}).` : "Du musst eingeloggt sein, um Nachrichten zu schreiben."}</p>
          {info ? <div style={{ padding: "0.9rem 1rem", borderRadius: 14, background: currentUser ? C.sageLight : "rgba(196,113,74,0.12)", color: currentUser ? C.forest : C.terra, fontWeight: 600, marginBottom: "1rem" }}>{info}</div> : null}
          <form onSubmit={handleSend} style={{ display: "grid", gap: "1rem" }}>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Hallo, ich interessiere mich für dein Inserat..." rows={7} onFocus={applyInputFocus} onBlur={resetInputFocus} style={{ ...inputBaseStyle, resize: "vertical" }} />
            <button type="submit" style={primaryButtonStyle}>{currentUser ? "Nachricht absenden" : "Zum Login"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function CreateListingPage({ onAddListing, goTo, currentUser, addToast }) {
  const [formData, setFormData] = useState({ title: "", price: "", location: "", image: "", category: "", description: "" });
  const [imgError, setImgError] = useState(false);
  const [uploading, setUploading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    if (name === "image") setImgError(false);
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function setCategory(cat) {
    setFormData((prev) => ({ ...prev, category: cat }));
  }

  function setPrice(p) {
    setFormData((prev) => ({ ...prev, price: p }));
  }

  const filledFields = [formData.title, formData.price, formData.location, formData.category, formData.description].filter(Boolean).length;
  const progress = Math.round((filledFields / 5) * 100);
  const previewImage = (!imgError && formData.image) ? formData.image : getFallbackImage(formData.category || "Sonstiges");

  const categoryIcons = {
    "Werkzeug": "🔧", "Technik": "💻", "Outdoor & Sport": "⛺", "Foto & Technik": "📷",
    "Party & Events": "🎉", "Musik": "🎸", "Bücher & Uni": "📚", "Transport": "🚲", "Gaming": "🎮", "Sonstiges": "📦"
  };

  async function handleSubmit(event) {
    event.preventDefault();
    if (!currentUser) { addToast("Bitte logge dich zuerst ein.", "error"); goTo("login"); return; }
    if (!formData.title.trim() || !formData.price.trim() || !formData.location.trim() || !formData.category.trim() || !formData.description.trim()) {
      addToast("Bitte fülle alle Pflichtfelder aus.", "error"); return;
    }
    await onAddListing({
      title: formData.title.trim(), price: formData.price.trim(), location: formData.location.trim(),
      image: formData.image.trim() || getFallbackImage(formData.category.trim()),
      category: formData.category.trim(), description: formData.description.trim(),
      userId: currentUser.id, ownerName: currentUser.name || "Ria Mitglied",
      rating: 5.0, reviews: 0, featured: false, status: "aktiv",
    });
    goTo("listings");
  }

  const labelStyle = { display: "block", marginBottom: "0.45rem", fontSize: "0.85rem", fontWeight: 700, color: C.forest, letterSpacing: "0.01em" };
  const sectionStyle = { background: "white", borderRadius: 20, padding: "1.5rem", border: `1px solid ${C.line}`, boxShadow: "0 4px 20px rgba(28,58,46,0.05)" };

  return (
    <div style={{ minHeight: "100vh", background: C.cream, padding: "3rem 1.5rem 5rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <button onClick={() => goTo("listings")} style={{ background: "white", color: C.forest, padding: "0.6rem 1rem", borderRadius: 12, border: `1px solid ${C.line}`, fontWeight: 600, cursor: "pointer", marginBottom: "2rem", fontSize: "0.9rem" }}>← Zurück</button>
        <div style={{ marginBottom: "2rem" }}>
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.18em", textTransform: "uppercase", color: C.sage, fontWeight: 700, marginBottom: "0.4rem" }}>Neues Inserat</p>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: C.forest, margin: 0, letterSpacing: "-0.03em" }}>Was möchtest du verleihen?</h1>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.82rem", color: C.muted, fontWeight: 600 }}>{filledFields} von 5 Feldern ausgefüllt</span>
            <span style={{ fontSize: "0.82rem", color: progress === 100 ? C.sage : C.muted, fontWeight: 700 }}>{progress}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: C.line, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 99, background: progress === 100 ? `linear-gradient(90deg, ${C.sage}, ${C.forest})` : `linear-gradient(90deg, ${C.terra}, #E8845A)`, width: `${progress}%`, transition: "width 0.4s ease" }} />
          </div>
        </div>

        {/* Main 2-col layout */}
        <div className="ria-create-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "1.5rem", alignItems: "start" }}>

          {/* Left: Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* Title */}
            <div style={sectionStyle}>
              <label style={labelStyle}>Titel des Inserats <span style={{ color: C.terra }}>*</span></label>
              <input name="title" value={formData.title} onChange={handleChange} placeholder="z. B. Campingzelt, Kamera, E-Roller ..." onFocus={applyInputFocus} onBlur={resetInputFocus} style={{ ...inputBaseStyle, fontSize: "1.05rem", fontWeight: 600 }} />
            </div>

            {/* Category chips */}
            <div style={sectionStyle}>
              <label style={labelStyle}>Kategorie <span style={{ color: C.terra }}>*</span></label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {allCategoryNames.map((cat) => {
                  const active = formData.category === cat;
                  return (
                    <button key={cat} type="button" onClick={() => setCategory(cat)} style={{ padding: "0.5rem 0.85rem", borderRadius: 999, border: active ? `2px solid ${C.forest}` : `1px solid ${C.line}`, background: active ? C.forest : "white", color: active ? "white" : C.ink, fontWeight: active ? 700 : 500, fontSize: "0.88rem", cursor: "pointer", transition: "all 0.18s ease", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <span>{categoryIcons[cat]}</span>{cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price + Location */}
            <div style={sectionStyle}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                <div>
                  <label style={labelStyle}>Preis <span style={{ color: C.terra }}>*</span></label>
                  <input name="price" value={formData.price} onChange={handleChange} placeholder="z. B. 8€ / Tag" onFocus={applyInputFocus} onBlur={resetInputFocus} style={{ ...inputBaseStyle, fontWeight: 700 }} />
                  <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.6rem", flexWrap: "wrap" }}>
                    {["3€ / Tag", "5€ / Tag", "8€ / Tag", "15€ / Tag"].map((p) => (
                      <button key={p} type="button" onClick={() => setPrice(p)} style={{ padding: "0.25rem 0.65rem", borderRadius: 999, border: `1px solid ${C.line}`, background: formData.price === p ? C.terra : "white", color: formData.price === p ? "white" : C.muted, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s ease" }}>{p}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Ort <span style={{ color: C.terra }}>*</span></label>
                  <input name="location" value={formData.location} onChange={handleChange} placeholder="Deine Stadt oder Stadtteil" onFocus={applyInputFocus} onBlur={resetInputFocus} style={inputBaseStyle} />
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={sectionStyle}>
              <label style={labelStyle}>Beschreibung <span style={{ color: C.terra }}>*</span></label>
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Kurz den Zustand beschreiben, was dabei ist und ob Abholung oder Übergabe vor Ort möglich ist..." rows={5} onFocus={applyInputFocus} onBlur={resetInputFocus} style={{ ...inputBaseStyle, resize: "vertical", lineHeight: 1.65 }} />
              <div style={{ textAlign: "right", fontSize: "0.78rem", color: formData.description.length > 400 ? C.terra : C.muted, marginTop: "0.4rem" }}>{formData.description.length} Zeichen</div>
            </div>

            {/* Image Upload + URL */}
            <div style={sectionStyle}>
              <label style={labelStyle}>Bild <span style={{ color: C.muted, fontWeight: 400 }}>(optional)</span></label>

              {/* File upload button */}
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                <label style={{ padding: "0.75rem 1.25rem", borderRadius: 12, background: C.sageLight, color: C.forest, fontWeight: 700, cursor: "pointer", fontSize: "0.88rem", border: `1px solid ${C.line}`, display: "inline-block" }}>
                  {uploading ? "Wird hochgeladen..." : "Bild auswählen"}
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploading(true);
                    const ext = file.name.split(".").pop();
                    const path = `${Date.now()}.${ext}`;
                    const { data, error } = await supabase.storage.from("listing-images").upload(path, file, { upsert: true });
                    if (error) {
                      addToast("Bild-Upload fehlgeschlagen: " + error.message, "error");
                      setUploading(false);
                      return;
                    }
                    const { data: urlData } = supabase.storage.from("listing-images").getPublicUrl(path);
                    setFormData((prev) => ({ ...prev, image: urlData.publicUrl }));
                    setImgError(false);
                    setUploading(false);
                  }} />
                </label>
                {formData.image && !imgError && (
                  <div style={{ position: "relative" }}>
                    <img src={formData.image} alt="Vorschau" style={{ height: 60, width: 80, objectFit: "cover", borderRadius: 10, border: `1px solid ${C.line}` }} onError={() => setImgError(true)} />
                    <button type="button" onClick={() => setFormData((p) => ({ ...p, image: "" }))} style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", background: C.terra, color: "white", border: "none", fontSize: "0.65rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>×</button>
                  </div>
                )}
              </div>
              <p style={{ margin: "0.6rem 0 0.5rem", color: C.muted, fontSize: "0.78rem" }}>oder direkt eine URL eingeben:</p>
              <input name="image" value={formData.image} onChange={handleChange} placeholder="https://..." onFocus={applyInputFocus} onBlur={resetInputFocus} style={inputBaseStyle} />
              <p style={{ margin: "0.5rem 0 0", fontSize: "0.8rem", color: C.muted, lineHeight: 1.5 }}>Kein Bild? Wir nutzen automatisch ein Kategoriebild.</p>
            </div>

            {/* Submit */}
            <button type="submit" style={{ background: progress === 100 ? "linear-gradient(135deg, #163126, #1C3A2E)" : "linear-gradient(135deg, #C4714A, #A95A3A)", color: "white", padding: "1.1rem 1.5rem", borderRadius: 16, border: "none", fontSize: "1.05rem", fontWeight: 800, cursor: "pointer", boxShadow: progress === 100 ? "0 14px 34px rgba(28,58,46,0.28)" : "0 14px 34px rgba(196,113,74,0.28)", transition: "all 0.3s ease", letterSpacing: "-0.01em" }}>
              {progress === 100 ? "Inserat jetzt veröffentlichen" : "Inserat veröffentlichen"}
            </button>
          </form>

          {/* Right: Live Preview */}
          <div style={{ position: "sticky", top: "6rem" }}>
            <p style={{ fontSize: "0.75rem", letterSpacing: "0.14em", textTransform: "uppercase", color: C.sage, fontWeight: 700, marginBottom: "0.75rem" }}>Vorschau</p>
            <div style={{ background: "white", borderRadius: 24, overflow: "hidden", border: `1px solid ${C.line}`, boxShadow: C.shadow }}>
              <div style={{ height: 220, background: C.sageLight, position: "relative", overflow: "hidden" }}>
                <img
                  src={previewImage} alt="Vorschau"
                  onError={() => setImgError(true)}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "opacity 0.3s ease" }}
                />
                {formData.category && (
                  <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(255,255,255,0.95)", color: C.forest, padding: "0.35rem 0.75rem", borderRadius: 999, fontSize: "0.78rem", fontWeight: 800, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                    {categoryIcons[formData.category]} {formData.category}
                  </div>
                )}
              </div>
              <div style={{ padding: "1.4rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "0.75rem", marginBottom: "0.5rem" }}>
                  <h3 style={{ color: C.forest, margin: 0, fontSize: "1.15rem", lineHeight: 1.3 }}>{formData.title || <span style={{ color: C.muted, fontStyle: "italic", fontWeight: 400 }}>Dein Titel...</span>}</h3>
                  <span style={{ color: C.terra, fontWeight: 800, whiteSpace: "nowrap", fontSize: "1rem" }}>{formData.price || <span style={{ color: C.muted, fontStyle: "italic", fontWeight: 400 }}>Preis</span>}</span>
                </div>
                <p style={{ color: C.muted, margin: "0 0 0.75rem", fontSize: "0.88rem" }}>{formData.location || "Ort"}</p>
                <p style={{ color: C.ink, fontSize: "0.9rem", lineHeight: 1.65, margin: "0 0 1rem", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {formData.description || <span style={{ color: C.muted, fontStyle: "italic" }}>Deine Beschreibung erscheint hier...</span>}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingTop: "0.75rem", borderTop: `1px solid ${C.line}` }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #163126, #1C3A2E)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.78rem", fontWeight: 800 }}>
                    {currentUser?.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <span style={{ fontSize: "0.85rem", color: C.muted }}>{currentUser?.name || "Dein Name"}</span>
                  <span style={{ marginLeft: "auto", fontSize: "0.82rem", color: C.gold, fontWeight: 700 }}>★ 5.0</span>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div style={{ marginTop: "1.25rem", background: "white", borderRadius: 18, padding: "1.25rem", border: `1px solid ${C.line}` }}>
              <p style={{ margin: "0 0 0.75rem", fontSize: "0.8rem", fontWeight: 700, color: C.forest }}>Checkliste</p>
              {[
                ["Titel", formData.title],
                ["Kategorie", formData.category],
                ["Preis", formData.price],
                ["Ort", formData.location],
                ["Beschreibung", formData.description],
              ].map(([label, val]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${val ? C.sage : C.line}`, background: val ? C.sage : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s ease" }}>
                    {val && <svg width="10" height="10" viewBox="0 0 10 10"><polyline points="1.5,5.5 4,8 8.5,2" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span style={{ fontSize: "0.85rem", color: val ? C.forest : C.muted, fontWeight: val ? 600 : 400 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessagesPage({ messages, currentUser, goTo, listings }) {
  const [tab, setTab] = useState("sent");

  const sentMessages = messages.filter((m) => m.fromEmail === currentUser?.email);
  const myListingIds = new Set((listings || []).filter((l) => l.userId === currentUser?.id).map((l) => l.id));
  const receivedMessages = messages.filter((m) => m.fromEmail !== currentUser?.email && myListingIds.has(m.listingId));

  const displayed = tab === "sent" ? sentMessages : receivedMessages;

  return (
    <div style={{ minHeight: "100vh", background: C.cream, padding: "4rem 1.5rem" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <p style={{ fontSize: "0.75rem", letterSpacing: "0.18em", textTransform: "uppercase", color: C.sage, fontWeight: 700, marginBottom: "0.5rem" }}>Posteingang</p>
        <h1 style={{ fontSize: "2.8rem", color: C.forest, marginTop: 0, marginBottom: "1.5rem", letterSpacing: "-0.03em" }}>Nachrichten</h1>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.75rem", background: "rgba(28,58,46,0.06)", borderRadius: 14, padding: "0.3rem" }}>
          {[["sent", `Gesendet (${sentMessages.length})`], ["received", `Erhalten (${receivedMessages.length})`]].map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "0.7rem", borderRadius: 10, border: "none", background: tab === t ? "white" : "transparent", color: tab === t ? C.forest : C.muted, fontWeight: tab === t ? 700 : 500, cursor: "pointer", fontSize: "0.9rem", boxShadow: tab === t ? "0 2px 10px rgba(28,58,46,0.1)" : "none", transition: "all 0.2s ease" }}>
              {label}
            </button>
          ))}
        </div>

        {displayed.length === 0 ? (
          <EmptyState
            title={tab === "sent" ? "Noch keine Nachrichten gesendet" : "Noch keine Nachrichten erhalten"}
            text={tab === "sent" ? "Stöbere durch die Inserate und schreibe Verleihern direkt." : "Sobald jemand eine Anfrage zu deinen Inseraten schickt, erscheint sie hier."}
            buttonLabel={tab === "sent" ? "Inserate durchsuchen" : "Inserat erstellen"}
            onClick={() => goTo(tab === "sent" ? "listings" : "create-listing")}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {displayed.map((msg) => (
              <div key={msg.id} style={{ background: "white", padding: "1.5rem", borderRadius: 20, border: `1px solid ${C.line}`, boxShadow: C.shadow }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.75rem", gap: "1rem" }}>
                  <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ background: C.sageLight, color: C.forest, padding: "0.3rem 0.75rem", borderRadius: 999, fontSize: "0.78rem", fontWeight: 700 }}>{msg.listingTitle}</span>
                    {tab === "received" && <span style={{ color: C.muted, fontSize: "0.82rem" }}>von <strong style={{ color: C.forest }}>{msg.fromName}</strong></span>}
                  </div>
                  <span style={{ fontSize: "0.78rem", color: C.muted, whiteSpace: "nowrap" }}>{new Date(msg.createdAt).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })}</span>
                </div>
                <p style={{ margin: 0, color: C.ink, lineHeight: 1.7, fontSize: "0.95rem" }}>{msg.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProfilePage({ currentUser, listings, messages, goTo, onSelectListing, onDeleteListing, onEditListing }) {
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  if (!currentUser) {
    return (
      <div style={{ minHeight: "100vh", background: C.cream, padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <EmptyState title="Noch kein Profil aktiv" text="Melde dich an oder registriere dich, damit du dein Profil, deine Inserate und Nachrichten sehen kannst." buttonLabel="Zum Login" onClick={() => goTo("login")} />
        </div>
      </div>
    );
  }

  const myListings = listings.filter((item) => item.userId === currentUser.id);
  const myMessages = messages.filter((msg) => msg.fromEmail === currentUser.email);

  return (
    <div style={{ minHeight: "100vh", background: C.cream, padding: "4rem 1.5rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Delete confirmation modal */}
        {deleteConfirm && (
          <div style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
            <div style={{ background: "white", borderRadius: 24, padding: "2rem", maxWidth: 420, width: "100%", boxShadow: "0 30px 60px rgba(0,0,0,0.2)", textAlign: "center" }}>
              <h3 style={{ color: C.forest, margin: "0 0 0.75rem", fontSize: "1.3rem" }}>Inserat löschen?</h3>
              <p style={{ color: C.muted, marginBottom: "1.5rem", lineHeight: 1.6 }}>„{deleteConfirm.title}" wird unwiderruflich gelöscht.</p>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: "0.9rem", borderRadius: 12, border: `1px solid ${C.line}`, background: "white", color: C.forest, fontWeight: 700, cursor: "pointer" }}>Abbrechen</button>
                <button onClick={() => { onDeleteListing(deleteConfirm.id); setDeleteConfirm(null); }} style={{ flex: 1, padding: "0.9rem", borderRadius: 12, border: "none", background: C.terra, color: "white", fontWeight: 700, cursor: "pointer" }}>Löschen</button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "2.5rem", background: "white", borderRadius: 24, padding: "1.75rem", border: `1px solid ${C.line}`, boxShadow: C.shadow, flexWrap: "wrap" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #163126, #1C3A2E)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", fontWeight: 800, flexShrink: 0 }}>
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <div style={{ fontWeight: 800, fontSize: "1.3rem", color: C.forest }}>{currentUser.name}</div>
            <div style={{ color: C.muted, fontSize: "0.88rem" }}>{currentUser.email}</div>
          </div>
          <div style={{ display: "flex", gap: "2rem" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: C.forest }}>{myListings.length}</div>
              <div style={{ fontSize: "0.78rem", color: C.muted }}>Inserate</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: C.forest }}>{myMessages.length}</div>
              <div style={{ fontSize: "0.78rem", color: C.muted }}>Nachrichten</div>
            </div>
          </div>
        </div>

        {/* My Listings */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
            <h2 style={{ color: C.forest, margin: 0, fontSize: "1.4rem" }}>Meine Inserate</h2>
            <button onClick={() => goTo("create-listing")} style={{ ...primaryButtonStyle, padding: "0.7rem 1.2rem", fontSize: "0.9rem", borderRadius: 999 }}>+ Neu erstellen</button>
          </div>
          {myListings.length === 0 ? (
            <EmptyState title="Noch keine Inserate" text="Du hast noch nichts verliehen. Erstelle dein erstes Inserat und verdiene nebenbei." buttonLabel="Inserat erstellen" onClick={() => goTo("create-listing")} />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
              {myListings.map((item) => (
                <div key={item.id} className="hover-card" style={{ background: "white", borderRadius: 20, overflow: "hidden", border: `1px solid ${C.line}`, boxShadow: C.shadow }}>
                  <div style={{ height: 150, background: C.sageLight, position: "relative", cursor: "pointer" }} onClick={() => onSelectListing(item)}>
                    {item.image && <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
                    <div style={{ position: "absolute", top: 8, left: 8, background: "rgba(255,255,255,0.93)", color: C.forest, padding: "0.25rem 0.6rem", borderRadius: 999, fontSize: "0.72rem", fontWeight: 700 }}>{item.category}</div>
                  </div>
                  <div style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.25rem" }}>
                      <h3 style={{ color: C.forest, margin: 0, fontSize: "1rem", cursor: "pointer" }} onClick={() => onSelectListing(item)}>{item.title}</h3>
                      <span style={{ color: C.terra, fontWeight: 800, fontSize: "0.9rem" }}>{item.price}</span>
                    </div>
                    <p style={{ color: C.muted, margin: "0 0 0.85rem", fontSize: "0.82rem" }}>{item.location}</p>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button onClick={() => onEditListing(item)} style={{ flex: 1, background: C.sageLight, color: C.forest, border: `1px solid ${C.line}`, borderRadius: 10, padding: "0.55rem", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>Bearbeiten</button>
                      <button onClick={() => setDeleteConfirm(item)} style={{ flex: 1, background: "rgba(196,113,74,0.08)", color: C.terra, border: `1px solid rgba(196,113,74,0.2)`, borderRadius: 10, padding: "0.55rem", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>Löschen</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent messages */}
        {myMessages.length > 0 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ color: C.forest, margin: 0, fontSize: "1.4rem" }}>Gesendete Nachrichten</h2>
              <button onClick={() => goTo("messages")} style={{ background: "white", color: C.forest, border: `1px solid ${C.line}`, borderRadius: 999, padding: "0.55rem 1rem", fontWeight: 600, cursor: "pointer", fontSize: "0.85rem" }}>Alle ansehen</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {myMessages.slice(0, 5).map((msg) => (
                <div key={msg.id} style={{ background: "white", padding: "1.25rem 1.5rem", borderRadius: 16, border: `1px solid ${C.line}`, display: "flex", gap: "1rem", alignItems: "center", boxShadow: "0 4px 15px rgba(28,58,46,0.05)" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: C.forest, fontSize: "0.88rem", marginBottom: "0.25rem" }}>{msg.listingTitle}</div>
                    <div style={{ color: C.muted, fontSize: "0.82rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{msg.text}</div>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: C.muted, whiteSpace: "nowrap" }}>{new Date(msg.createdAt).toLocaleDateString("de-DE")}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ListingMap({ location }) {
  const [coords, setCoords] = useState(null);
  useEffect(() => {
    if (!location) return;
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`)
      .then((r) => r.json())
      .then((data) => { if (data[0]) setCoords({ lat: data[0].lat, lon: data[0].lon }); })
      .catch(() => {});
  }, [location]);
  if (!coords) return null;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(coords.lon)-0.02},${parseFloat(coords.lat)-0.01},${parseFloat(coords.lon)+0.02},${parseFloat(coords.lat)+0.01}&layer=mapnik&marker=${coords.lat},${coords.lon}`;
  return (
    <div style={{ marginTop: "1rem", borderRadius: 20, overflow: "hidden", border: `1px solid ${C.line}`, height: 200 }}>
      <iframe src={src} style={{ width: "100%", height: "100%", border: "none" }} title="Karte" loading="lazy" />
    </div>
  );
}

function EditListingPage({ listing, onUpdateListing, goTo, currentUser, addToast }) {
  const [formData, setFormData] = useState({
    title: listing?.title || "",
    price: listing?.price || "",
    location: listing?.location || "",
    image: listing?.image || "",
    category: listing?.category || "",
    description: listing?.description || "",
  });
  const [imgError, setImgError] = useState(false);
  const [uploading, setUploading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "image") setImgError(false);
    setFormData((p) => ({ ...p, [name]: value }));
  }

  function setCategory(cat) { setFormData((p) => ({ ...p, category: cat })); }

  const categoryIcons = {
    "Werkzeug": "🔧", "Technik": "💻", "Outdoor & Sport": "⛺", "Foto & Technik": "📷",
    "Party & Events": "🎉", "Musik": "🎸", "Bücher & Uni": "📚", "Transport": "🚲", "Gaming": "🎮", "Sonstiges": "📦"
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.title.trim() || !formData.price.trim() || !formData.location.trim() || !formData.category.trim() || !formData.description.trim()) {
      addToast("Bitte fülle alle Pflichtfelder aus.", "error"); return;
    }
    await onUpdateListing(listing.id, {
      title: formData.title.trim(), price: formData.price.trim(), location: formData.location.trim(),
      image: formData.image.trim() || getFallbackImage(formData.category.trim()),
      category: formData.category.trim(), description: formData.description.trim(),
    });
    goTo("profile");
  }

  if (!listing) return null;

  const labelStyle = { display: "block", marginBottom: "0.45rem", fontSize: "0.85rem", fontWeight: 700, color: C.forest };
  const sectionStyle = { background: "white", borderRadius: 20, padding: "1.5rem", border: `1px solid ${C.line}`, boxShadow: "0 4px 20px rgba(28,58,46,0.05)" };
  const previewImage = (!imgError && formData.image) ? formData.image : getFallbackImage(formData.category || "Sonstiges");

  return (
    <div style={{ minHeight: "100vh", background: C.cream, padding: "3rem 1.5rem 5rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <button onClick={() => goTo("profile")} style={{ background: "white", color: C.forest, padding: "0.6rem 1rem", borderRadius: 12, border: `1px solid ${C.line}`, fontWeight: 600, cursor: "pointer", marginBottom: "2rem" }}>← Zurück zum Profil</button>
        <div style={{ marginBottom: "2rem" }}>
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.18em", textTransform: "uppercase", color: C.sage, fontWeight: 700, marginBottom: "0.4rem" }}>Inserat bearbeiten</p>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: C.forest, margin: 0, letterSpacing: "-0.03em" }}>„{listing.title}" bearbeiten</h1>
        </div>

        <div className="ria-create-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "1.5rem", alignItems: "start" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={sectionStyle}>
              <label style={labelStyle}>Titel <span style={{ color: C.terra }}>*</span></label>
              <input name="title" value={formData.title} onChange={handleChange} onFocus={applyInputFocus} onBlur={resetInputFocus} style={{ ...inputBaseStyle, fontSize: "1.05rem", fontWeight: 600 }} />
            </div>

            <div style={sectionStyle}>
              <label style={labelStyle}>Kategorie <span style={{ color: C.terra }}>*</span></label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {allCategoryNames.map((cat) => {
                  const active = formData.category === cat;
                  return (
                    <button key={cat} type="button" onClick={() => setCategory(cat)} style={{ padding: "0.5rem 0.85rem", borderRadius: 999, border: active ? `2px solid ${C.forest}` : `1px solid ${C.line}`, background: active ? C.forest : "white", color: active ? "white" : C.ink, fontWeight: active ? 700 : 500, fontSize: "0.88rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <span>{categoryIcons[cat]}</span>{cat}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={sectionStyle}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                <div>
                  <label style={labelStyle}>Preis <span style={{ color: C.terra }}>*</span></label>
                  <input name="price" value={formData.price} onChange={handleChange} onFocus={applyInputFocus} onBlur={resetInputFocus} style={{ ...inputBaseStyle, fontWeight: 700 }} />
                </div>
                <div>
                  <label style={labelStyle}>Ort <span style={{ color: C.terra }}>*</span></label>
                  <input name="location" value={formData.location} onChange={handleChange} onFocus={applyInputFocus} onBlur={resetInputFocus} style={inputBaseStyle} />
                </div>
              </div>
            </div>

            <div style={sectionStyle}>
              <label style={labelStyle}>Beschreibung <span style={{ color: C.terra }}>*</span></label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={5} onFocus={applyInputFocus} onBlur={resetInputFocus} style={{ ...inputBaseStyle, resize: "vertical" }} />
            </div>

            <div style={sectionStyle}>
              <label style={labelStyle}>Bild-URL</label>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "0.5rem" }}>
                <label style={{ padding: "0.65rem 1rem", borderRadius: 12, background: C.sageLight, color: C.forest, fontWeight: 700, cursor: "pointer", fontSize: "0.85rem", border: `1px solid ${C.line}` }}>
                  {uploading ? "Lädt..." : "Neues Bild"}
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                    const file = e.target.files?.[0]; if (!file) return;
                    setUploading(true);
                    const path = `${Date.now()}.${file.name.split(".").pop()}`;
                    const { error } = await supabase.storage.from("listing-images").upload(path, file, { upsert: true });
                    if (error) { addToast("Upload fehlgeschlagen: " + error.message, "error"); setUploading(false); return; }
                    const { data: urlData } = supabase.storage.from("listing-images").getPublicUrl(path);
                    setFormData((p) => ({ ...p, image: urlData.publicUrl }));
                    setImgError(false); setUploading(false);
                  }} />
                </label>
                {formData.image && !imgError && <img src={formData.image} alt="" style={{ height: 50, width: 70, objectFit: "cover", borderRadius: 8 }} onError={() => setImgError(true)} />}
              </div>
              <input name="image" value={formData.image} onChange={handleChange} placeholder="https://..." onFocus={applyInputFocus} onBlur={resetInputFocus} style={inputBaseStyle} />
            </div>

            <button type="submit" style={{ background: "linear-gradient(135deg, #163126, #1C3A2E)", color: "white", padding: "1.1rem 1.5rem", borderRadius: 16, border: "none", fontSize: "1.05rem", fontWeight: 800, cursor: "pointer", boxShadow: "0 14px 34px rgba(28,58,46,0.28)" }}>
              Änderungen speichern
            </button>
          </form>

          {/* Preview */}
          <div style={{ position: "sticky", top: "6rem" }}>
            <p style={{ fontSize: "0.75rem", letterSpacing: "0.14em", textTransform: "uppercase", color: C.sage, fontWeight: 700, marginBottom: "0.75rem" }}>Vorschau</p>
            <div style={{ background: "white", borderRadius: 24, overflow: "hidden", border: `1px solid ${C.line}`, boxShadow: C.shadow }}>
              <div style={{ height: 200, background: C.sageLight }}>
                <img src={previewImage} alt="" onError={() => setImgError(true)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
              <div style={{ padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.4rem" }}>
                  <h3 style={{ color: C.forest, margin: 0 }}>{formData.title || <span style={{ color: C.muted, fontStyle: "italic", fontWeight: 400 }}>Titel...</span>}</h3>
                  <span style={{ color: C.terra, fontWeight: 800 }}>{formData.price || "Preis"}</span>
                </div>
                <p style={{ color: C.muted, margin: "0 0 0.5rem", fontSize: "0.85rem" }}>{formData.location || "Ort"}</p>
                <p style={{ color: C.ink, fontSize: "0.88rem", lineHeight: 1.6, margin: 0 }}>{formData.description || <span style={{ color: C.muted, fontStyle: "italic" }}>Beschreibung...</span>}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(initialListings[0]);
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [favorites, setFavorites] = useState(() => { try { return JSON.parse(localStorage.getItem("ria-favorites") || "[]"); } catch { return []; } });
  const [editListing, setEditListing] = useState(null);

  function addToast(text, type = "info") {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }

  useEffect(() => {
    const savedUser = localStorage.getItem("ria-current-user");
    const savedMessages = localStorage.getItem("ria-messages");

    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    if (savedMessages) setMessages(JSON.parse(savedMessages));

    async function loadSessionAndListings() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const sessionUser = {
          id: session.user.id,
          name: session.user.user_metadata?.name || "User",
          email: session.user.email,
        };
        setCurrentUser(sessionUser);
        localStorage.setItem("ria-current-user", JSON.stringify(sessionUser));
      }

      await loadListings();
    }

    loadSessionAndListings();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const sessionUser = {
          id: session.user.id,
          name: session.user.user_metadata?.name || "User",
          email: session.user.email,
        };
        setCurrentUser(sessionUser);
        localStorage.setItem("ria-current-user", JSON.stringify(sessionUser));
      } else {
        setCurrentUser(null);
        localStorage.removeItem("ria-current-user");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const sortedMessages = useMemo(() => [...messages].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [messages]);

  function mapListingFromDb(row) {
    return {
      id: row.id,
      title: row.title,
      price: row.price,
      location: row.location,
      image: row.image,
      category: row.category,
      description: row.description,
      userId: row.user_id,
      ownerName: row.owner_name || "Ria Mitglied",
      rating: 5.0,
      reviews: 0,
      featured: false,
      status: "aktiv",
      createdAt: row.created_at,
    };
  }

  async function loadListings() {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fehler beim Laden der Inserate:", error);
      setListings(initialListings);
      setLoading(false);
      return;
    }

    if (!data || data.length === 0) {
      setListings(initialListings);
      setLoading(false);
      return;
    }

    setListings(data.map(mapListingFromDb));
    setLoading(false);
  }

  async function addListing(newListing) {
    const payload = {
      title: newListing.title,
      price: newListing.price,
      location: newListing.location,
      image: newListing.image,
      category: newListing.category,
      description: newListing.description,
      user_id: newListing.userId,
    };

    const { data, error } = await supabase
      .from("listings")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Fehler beim Speichern des Inserats:", error);
      addToast(`Fehler: ${error.message}`, "error");
      return;
    }

    const insertedListing = mapListingFromDb(data);
    setListings((prev) => [insertedListing, ...prev]);
    setSelectedListing(insertedListing);
  }

  async function deleteListing(id) {
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) {
      addToast("Fehler beim Löschen.", "error");
      return;
    }
    setListings((prev) => prev.filter((l) => l.id !== id));
    addToast("Inserat gelöscht.", "info");
  }

  function toggleFavorite(id) {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      localStorage.setItem("ria-favorites", JSON.stringify(next));
      return next;
    });
  }

  async function updateListing(id, updates) {
    const payload = {
      title: updates.title, price: updates.price, location: updates.location,
      image: updates.image, category: updates.category, description: updates.description,
    };
    const { data, error } = await supabase.from("listings").update(payload).eq("id", id).select().single();
    if (error) { addToast("Fehler beim Speichern: " + error.message, "error"); return; }
    setListings((prev) => prev.map((l) => l.id === id ? { ...l, ...updates } : l));
    addToast("Inserat gespeichert.", "info");
  }

  function openListingDetails(listing) {
    setSelectedListing(listing);
    setCurrentPage("listing-detail");
  }

  function handleLogin(user, isNew = false) {
    setCurrentUser(user);
    localStorage.setItem("ria-current-user", JSON.stringify(user));
    if (isNew) setShowOnboarding(true);
    setCurrentPage("home");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setCurrentUser(null);
    localStorage.removeItem("ria-current-user");
    setCurrentPage("home");
  }

  function startMessageForListing(listing) {
    setSelectedListing(listing);
    if (!currentUser) {
      setCurrentPage("login");
      return;
    }
    setCurrentPage("message-composer");
  }

  function saveMessage(newMessage) {
    setMessages((prev) => {
      const updated = [newMessage, ...prev];
      localStorage.setItem("ria-messages", JSON.stringify(updated));
      return updated;
    });
  }

  function renderPage() {
    if (currentPage === "login") return <LoginPage onLogin={handleLogin} currentUser={currentUser} />;
    if (currentPage === "listings") return <ListingsPage listings={listings} loading={loading} goTo={setCurrentPage} onSelectListing={openListingDetails} currentUser={currentUser} favorites={favorites} toggleFavorite={toggleFavorite} />;
    if (currentPage === "listing-detail") return <ListingDetailPage listing={selectedListing} goTo={setCurrentPage} currentUser={currentUser} onStartMessage={startMessageForListing} allListings={listings} onSelectListing={openListingDetails} favorites={favorites} toggleFavorite={toggleFavorite} addToast={addToast} />;
    if (currentPage === "message-composer") return <MessageComposerPage listing={selectedListing} currentUser={currentUser} goTo={setCurrentPage} onSendMessage={saveMessage} />;
    if (currentPage === "create-listing") return <CreateListingPage onAddListing={addListing} goTo={setCurrentPage} currentUser={currentUser} addToast={addToast} />;
    if (currentPage === "messages") return <MessagesPage messages={sortedMessages} currentUser={currentUser} goTo={setCurrentPage} listings={listings} />;
    if (currentPage === "profile") return <ProfilePage currentUser={currentUser} listings={listings} messages={sortedMessages} goTo={setCurrentPage} onSelectListing={openListingDetails} onDeleteListing={deleteListing} onEditListing={(item) => { setEditListing(item); setCurrentPage("edit-listing"); }} />;
    if (currentPage === "edit-listing") return <EditListingPage listing={editListing} onUpdateListing={updateListing} goTo={setCurrentPage} currentUser={currentUser} addToast={addToast} />;
    return <HomePage goTo={setCurrentPage} listings={listings} loading={loading} />;
  }

  return (
    <div style={{ overflowX: "hidden" }} className={darkMode ? "ria-dark" : ""}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes sway { 0%, 100% { transform: rotate(-6deg); } 50% { transform: rotate(6deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        button:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,0,0,0.07); }
        .hover-card { transition: transform 0.22s ease, box-shadow 0.22s ease; }
        .hover-card:hover { transform: translateY(-3px); box-shadow: 0 24px 60px rgba(28,58,46,0.14); }
        .hover-media img { transition: transform 0.3s ease; }
        .hover-media:hover img { transform: scale(1.05); }
        @media (max-width: 980px) {
          .ria-hero-grid, .ria-grid-4, .ria-grid-3, .ria-grid-2, .ria-detail-grid, .ria-create-grid { grid-template-columns: 1fr !important; }
          .ria-listing-filters { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .ria-topbar { padding: 0.65rem 1rem !important; gap: 0.5rem !important; }
          .ria-topbar-navbtn { padding: 0.55rem 0.75rem !important; font-size: 0.85rem !important; }
          .ria-topbar-logo { min-width: unset !important; }
          .ria-hero-cards { display: none !important; }
          .ria-hero-section { padding: 4rem 1.25rem 3.5rem !important; }
        }
        @keyframes revealUp { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
        .ria-dark { background: #141414 !important; color-scheme: dark; }
        .ria-dark > div { background: #141414; }
        @media (max-width: 860px) {
          .ria-login-left { display: none !important; }
        }
      `}</style>
      <TopBar currentPage={currentPage} goTo={setCurrentPage} currentUser={currentUser} onLogout={handleLogout} darkMode={darkMode} onToggleDark={() => setDarkMode((d) => !d)} />
      {renderPage()}
      <Toaster toasts={toasts} />
      {showOnboarding && <OnboardingModal user={currentUser} onClose={() => setShowOnboarding(false)} goTo={setCurrentPage} />}
      <footer style={{ background: C.forest, color: "rgba(255,255,255,0.6)", padding: "2.5rem 1.5rem", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ marginBottom: "0.6rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.8rem" }}>
          <Logo size={1.4} color="white" />
          <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "1.1rem" }}>—</span>
          <span style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "1.05rem", color: "rgba(255,255,255,0.55)", letterSpacing: "0.04em" }}>rent it all.</span>
        </div>
        <p style={{ margin: "0 0 0.4rem", fontSize: "0.9rem" }}>Nachhaltig mieten & vermieten in deiner Stadt.</p>
        <p style={{ margin: 0, fontSize: "0.78rem", color: "rgba(255,255,255,0.35)" }}>© 2026 Ria · Paderborn</p>
      </footer>
    </div>
  );
}