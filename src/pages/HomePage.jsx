import { C, categories, steps } from '../constants';
import { getFallbackImage } from '../styles';
import { smartImageUrl } from '../lib/getImageUrl.js';
import Logo from '../components/Logo';
import AnimatedCounter from '../components/AnimatedCounter';
import RatingStars from '../components/RatingStars';
import ListingCard from '../components/ListingCard';

export default function HomePage({
  goTo,
  listings,
  currentUser,
  onCategoryClick,
  onSearch,
  onSelectListing,
}) {
  const featuredListings = (() => {
    const f = listings.filter((item) => item.featured).slice(0, 3);
    return f.length > 0 ? f : listings.slice(0, 3);
  })();

  return (
    <div style={{ background: C.cream, minHeight: '100vh' }}>
      <section
        className="ria-hero-section"
        style={{
          background: 'linear-gradient(135deg, #173126 0%, #1C3A2E 48%, #244536 100%)',
          color: 'white',
          padding: '6rem 1.5rem 5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at top right, rgba(200,169,107,0.18), transparent 28%), radial-gradient(circle at bottom left, rgba(122,158,126,0.16), transparent 24%)',
            pointerEvents: 'none',
          }}
        />
        <div
          className="ria-hero-grid"
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '3rem',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ marginBottom: '1.5rem', animation: 'fadeUp 0.6s ease both' }}>
              <Logo size={2.6} color="white" />
              <div
                style={{
                  marginTop: '0.05rem',
                  fontSize: '0.9rem',
                  fontStyle: 'italic',
                  fontFamily: 'Georgia, serif',
                  color: 'rgba(255,255,255,0.42)',
                  letterSpacing: '0.08em',
                }}
              >
                rent it all.
              </div>
            </div>
            <div
              style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.16)',
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.82)',
                fontSize: '0.78rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                marginBottom: '1.25rem',
                animation: 'fadeUp 0.7s 0.1s both',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              Lokal. Nachhaltig. Günstig.
            </div>
            <h1
              style={{
                fontSize: 'clamp(2rem, 8vw, 5.4rem)',
                lineHeight: 1.02,
                margin: 0,
                marginBottom: '1rem',
                animation: 'fadeUp 0.8s 0.2s both',
                letterSpacing: '-0.04em',
                textWrap: 'balance',
              }}
            >
              Miete lokal –<br />
              von Mensch zu Mensch.
            </h1>
            <p
              style={{
                maxWidth: 720,
                fontSize: '1.12rem',
                lineHeight: 1.8,
                color: 'rgba(255,255,255,0.76)',
                marginBottom: '2.2rem',
                animation: 'fadeUp 0.9s 0.3s both',
              }}
            >
              Verleihe, was du nicht brauchst. Miete, was du kurz brauchst. Direkt, günstig,
              nachhaltig.
            </p>
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                animation: 'fadeUp 1s 0.4s both',
              }}
            >
              <button
                onClick={() => goTo('listings')}
                style={{
                  background: C.terra,
                  color: 'white',
                  padding: '1rem 1.5rem',
                  borderRadius: 14,
                  border: 'none',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 14px 30px rgba(196,113,74,0.35)',
                }}
              >
                Jetzt entdecken
              </button>
              <button
                onClick={() => goTo('create-listing')}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: 'white',
                  padding: '1rem 1.5rem',
                  borderRadius: 14,
                  border: '1px solid rgba(255,255,255,0.18)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backdropFilter: 'blur(6px)',
                }}
              >
                Inserat erstellen
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const v = e.target.elements.hs.value.trim();
                if (v && onSearch) onSearch(v);
                else if (v) goTo('listings');
              }}
              style={{
                marginTop: '1.75rem',
                display: 'flex',
                background: 'rgba(255,255,255,0.10)',
                backdropFilter: 'blur(12px)',
                borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.18)',
                overflow: 'hidden',
                maxWidth: 460,
                animation: 'fadeUp 1s 0.5s both',
              }}
            >
              <svg
                style={{ margin: '0 0 0 1rem', alignSelf: 'center', flexShrink: 0, opacity: 0.55 }}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                name="hs"
                placeholder="Bohrmaschine, Zelt, Kamera…"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  padding: '0.9rem 0.85rem',
                  color: 'white',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  background: C.terra,
                  border: 'none',
                  padding: '0.9rem 1.25rem',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  flexShrink: 0,
                  transition: 'background 0.2s',
                }}
              >
                Suchen
              </button>
            </form>
          </div>
          <div
            className="ria-hero-cards"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              animation: 'fadeUp 0.8s 0.3s both',
            }}
          >
            {listings.slice(0, 2).map((item, i) => (
              <div
                key={item.id}
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 20,
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'center',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                  transform: i === 1 ? 'translateX(1.5rem) rotate(1deg)' : 'rotate(-1deg)',
                }}
              >
                <img
                  src={smartImageUrl(item.image, { width: 128, quality: 80 })}
                  alt={item.title}
                  loading="lazy"
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 12,
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ color: 'white', fontWeight: 700, marginBottom: '0.2rem' }}>
                    {item.title}
                  </div>
                  <div
                    style={{
                      color: C.terra,
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      marginBottom: '0.2rem',
                    }}
                  >
                    {item.price}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem' }}>
                    {item.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '3rem 1.5rem 1rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'end',
              gap: '1rem',
              flexWrap: 'wrap',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <p
                style={{
                  fontSize: '0.78rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: C.sage,
                  fontWeight: 700,
                  marginBottom: '0.75rem',
                }}
              >
                Beliebt in deiner Nähe
              </p>
              <h2
                style={{ fontSize: '2.1rem', color: C.forest, margin: 0, letterSpacing: '-0.03em' }}
              >
                {listings.length > 0
                  ? `${listings.length} Inserate in deiner Nähe`
                  : 'Beliebte Inserate'}
              </h2>
            </div>
            <button
              onClick={() => goTo('listings')}
              style={{
                background: 'white',
                color: C.forest,
                border: `1px solid ${C.line}`,
                borderRadius: 999,
                padding: '0.8rem 1rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Alles ansehen
            </button>
          </div>
          <div
            className="ria-grid-3"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: '1rem',
            }}
          >
            {featuredListings.map((item) => (
              <ListingCard
                key={item.id}
                listing={item}
                onSelect={onSelectListing}
              />
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem 1.5rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p
            style={{
              fontSize: '0.78rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: C.sage,
              fontWeight: 700,
              marginBottom: '0.75rem',
            }}
          >
            So einfach geht's
          </p>
          <h2
            style={{
              fontSize: '2.35rem',
              color: C.forest,
              marginTop: 0,
              marginBottom: '2rem',
              letterSpacing: '-0.03em',
            }}
          >
            In drei Schritten mieten oder vermieten.
          </h2>
          <div
            className="ria-grid-3"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: '1rem',
            }}
          >
            {steps.map((step) => (
              <div
                key={step.num}
                className="hover-card"
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  borderRadius: 24,
                  padding: '1.6rem',
                  boxShadow: C.shadow,
                  border: `1px solid ${C.line}`,
                }}
              >
                <div
                  style={{
                    fontSize: '2.2rem',
                    color: C.gold,
                    fontWeight: 800,
                    marginBottom: '0.75rem',
                  }}
                >
                  {step.num}
                </div>
                <h3 style={{ color: C.forest, marginTop: 0, marginBottom: '0.5rem' }}>
                  {step.title}
                </h3>
                <p style={{ color: C.muted, lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sicherheit & Vertrauen */}
      <section style={{ padding: '4rem 1.5rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p
            style={{
              fontSize: '0.78rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: C.sage,
              fontWeight: 700,
              marginBottom: '0.75rem',
            }}
          >
            Dein Schutz
          </p>
          <h2
            style={{
              fontSize: '2.35rem',
              color: C.forest,
              marginTop: 0,
              marginBottom: '2rem',
              letterSpacing: '-0.03em',
            }}
          >
            Sicher mieten — von Anfang an.
          </h2>
          <div
            className="ria-grid-3"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: '1rem',
            }}
          >
            {[
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.forest} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                ),
                title: 'Direkt kommunizieren',
                desc: 'Kläre alle Details direkt per Chat mit dem Verleiher — transparent, schnell und ohne Umwege.',
                bg: 'white',
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.forest} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                ),
                title: 'Digitaler Mietvertrag',
                desc: 'Schütze dich mit einem rechtssicheren Online-Vertrag (§126b BGB). Beide Parteien unterzeichnen direkt im Chat — mit Zeitstempel.',
                bg: C.sageLight,
                highlight: true,
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.forest} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                ),
                title: 'Verifikation & Bewertungen',
                desc: 'Nutzerbewertungen und verifizierte Profile geben dir Sicherheit — du weißt, mit wem du es zu tun hast.',
                bg: 'white',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="hover-card"
                style={{
                  background: item.bg,
                  border: item.highlight ? `1.5px solid ${C.sage}` : `1px solid ${C.line}`,
                  borderRadius: 24,
                  padding: '1.75rem',
                  boxShadow: item.highlight ? `0 4px 24px rgba(122,158,126,0.13)` : C.shadow,
                  position: 'relative',
                }}
              >
                {item.highlight && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      background: C.forest,
                      color: 'white',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.55rem',
                      borderRadius: 999,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    NEU
                  </div>
                )}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: 'rgba(28,58,46,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  {item.icon}
                </div>
                <h3 style={{ color: C.forest, marginTop: 0, marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                  {item.title}
                </h3>
                <p style={{ color: C.muted, lineHeight: 1.65, margin: 0, fontSize: '0.93rem' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: '#EAF0EB', padding: '5.5rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              marginBottom: '0.75rem',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C12 2 4 6 4 13c0 4.4 3.6 8 8 8s8-3.6 8-8c0-7-8-11-8-11z"
                fill={C.sage}
              />
              <path d="M12 21V11" stroke={C.forest} strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <p
              style={{
                fontSize: '0.78rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: C.sage,
                fontWeight: 700,
                margin: 0,
              }}
            >
              Gut für die Welt
            </p>
          </div>
          <h2
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: C.forest,
              marginTop: 0,
              marginBottom: '0.75rem',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}
          >
            Teilen ist das Nachhaltigste,
            <br />
            was du heute tun kannst.
          </h2>
          <p
            style={{
              color: C.muted,
              lineHeight: 1.7,
              maxWidth: 580,
              marginBottom: '3rem',
              fontSize: '1.05rem',
            }}
          >
            Statt einmal kaufen und jahrelang verstauben lassen — einfach mieten, nutzen,
            zurückgeben. Gut für deinen Geldbeutel und den Planeten.
          </p>

          <div
            style={{
              background: 'linear-gradient(135deg, #173126 0%, #1C3A2E 100%)',
              borderRadius: 28,
              padding: '3rem 2.5rem',
              marginBottom: '2rem',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 260,
                height: 260,
                borderRadius: '50%',
                background: 'rgba(122,158,126,0.08)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: -70,
                left: -30,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'rgba(200,169,107,0.07)',
                pointerEvents: 'none',
              }}
            />
            <div
              className="ria-grid-3"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: '2.5rem',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {[
                {
                  to: 15,
                  suffix: ' Min',
                  label: 'Wird eine Bohrmaschine in ihrem Leben durchschnittlich genutzt.',
                },
                {
                  to: 80,
                  suffix: '%',
                  label: 'Aller Haushaltsgeräte werden weniger als einmal pro Monat benutzt.',
                },
                {
                  to: 50,
                  prefix: '−',
                  suffix: ' kg',
                  label: 'CO₂ sparst du, wenn du mietest statt neu zu kaufen.',
                },
              ].map((s) => (
                <div key={s.suffix}>
                  <div
                    style={{
                      fontSize: '3.2rem',
                      fontWeight: 800,
                      color: 'white',
                      lineHeight: 1,
                      marginBottom: '0.6rem',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    <AnimatedCounter to={s.to} suffix={s.suffix} prefix={s.prefix || ''} />
                  </div>
                  <div
                    style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, fontSize: '0.92rem' }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="ria-grid-2"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                background: 'rgba(196,113,74,0.07)',
                border: '1px solid rgba(196,113,74,0.18)',
                borderRadius: 24,
                padding: '2rem',
              }}
            >
              <div
                style={{
                  fontSize: '0.78rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: C.terra,
                  fontWeight: 700,
                  marginBottom: '1.25rem',
                }}
              >
                Kaufen
              </div>
              {[
                ['€89–150', 'Kaufpreis für eine Bohrmaschine'],
                ['25 kg CO₂', 'Durch Produktion & Transport'],
                ['15 Min / Jahr', 'Tatsächliche Nutzungsdauer'],
                ['Jahre im Keller', 'Danach verstaubt sie'],
              ].map(([val, label]) => (
                <div
                  key={val}
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'start',
                    marginBottom: '0.9rem',
                  }}
                >
                  <span
                    style={{
                      color: C.terra,
                      fontWeight: 800,
                      minWidth: '5.5rem',
                      fontSize: '0.93rem',
                    }}
                  >
                    {val}
                  </span>
                  <span style={{ color: C.muted, fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <div
              style={{
                background: 'white',
                border: `1px solid rgba(28,58,46,0.12)`,
                borderRadius: 24,
                padding: '2rem',
                boxShadow: C.shadow,
              }}
            >
              <div
                style={{
                  fontSize: '0.78rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: C.sage,
                  fontWeight: 700,
                  marginBottom: '1.25rem',
                }}
              >
                Bei ria mieten
              </div>
              {[
                ['€3–8 / Tag', "Nur zahlen, wenn du's brauchst"],
                ['~0.1 kg CO₂', 'Kein Neukauf nötig'],
                ['Wann du willst', 'Flexibel & spontan'],
                ['Für den Nächsten', 'Das Gerät bleibt im Umlauf'],
              ].map(([val, label]) => (
                <div
                  key={val}
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'start',
                    marginBottom: '0.9rem',
                  }}
                >
                  <span
                    style={{
                      color: C.forest,
                      fontWeight: 800,
                      minWidth: '5.5rem',
                      fontSize: '0.93rem',
                    }}
                  >
                    {val}
                  </span>
                  <span style={{ color: C.muted, fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="ria-grid-3"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: '1rem',
            }}
          >
            {[
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2C12 2 4 6 4 13c0 4.4 3.6 8 8 8s8-3.6 8-8c0-7-8-11-8-11z"
                      fill={C.sage}
                    />
                    <path d="M12 21V11" stroke={C.forest} strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                ),
                title: 'Weniger Produktion',
                desc: 'Jedes gemietete Produkt verhindert einen Neukauf — und damit Emissionen durch Herstellung, Verpackung und Transport.',
                bg: 'white',
              },
              {
                icon: (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={C.forest}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="1 4 1 10 7 10" />
                    <polyline points="23 20 23 14 17 14" />
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
                  </svg>
                ),
                title: 'Kreislaufwirtschaft',
                desc: 'Dinge bleiben länger in Nutzung. Statt im Müll landet das Gerät beim Nächsten, der es braucht.',
                bg: C.sageLight,
              },
              {
                icon: (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={C.forest}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  >
                    <circle cx="9" cy="7" r="3" />
                    <circle cx="17" cy="7" r="3" />
                    <path d="M3 21v-1a6 6 0 0 1 6-6h6a6 6 0 0 1 6 6v1" />
                  </svg>
                ),
                title: 'Lokale Community',
                desc: 'Ria verbindet Nachbarn, Studis und Locals direkt — ohne Umwege, von Mensch zu Mensch in deiner Stadt.',
                bg: 'white',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="hover-card"
                style={{
                  background: item.bg,
                  border: `1px solid ${C.line}`,
                  borderRadius: 24,
                  padding: '1.75rem',
                  boxShadow: C.shadow,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: C.sageLight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  {item.icon}
                </div>
                <h3
                  style={{
                    color: C.forest,
                    marginTop: 0,
                    marginBottom: '0.5rem',
                    fontSize: '1.1rem',
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ color: C.muted, lineHeight: 1.65, margin: 0, fontSize: '0.93rem' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '2rem 1.5rem 4rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p
            style={{
              fontSize: '0.78rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: C.sage,
              fontWeight: 700,
              marginBottom: '0.75rem',
            }}
          >
            Kategorien
          </p>
          <h2
            style={{
              fontSize: '2.35rem',
              color: C.forest,
              marginTop: 0,
              marginBottom: '1.5rem',
              letterSpacing: '-0.03em',
            }}
          >
            Alles – wirklich alles.
          </h2>
          <div
            className="ria-grid-4"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: '1rem',
            }}
          >
            {categories.map((category) => (
              <div
                key={category.name}
                className="hover-media"
                onClick={() =>
                  onCategoryClick ? onCategoryClick(category.name) : goTo('listings')
                }
                style={{
                  borderRadius: 24,
                  overflow: 'hidden',
                  position: 'relative',
                  minHeight: 210,
                  animation: 'fadeUp 0.6s ease both',
                  boxShadow: C.shadow,
                  border: `1px solid ${C.line}`,
                  cursor: 'pointer',
                }}
              >
                <img
                  src={category.img}
                  alt={category.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    position: 'absolute',
                    inset: 0,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(to top, rgba(16,33,26,0.92) 0%, rgba(28,58,46,0.22) 58%, rgba(28,58,46,0.08) 100%)',
                  }}
                />
                <div
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    minHeight: 210,
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: '1.35rem',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.05rem',
                  }}
                >
                  {category.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
