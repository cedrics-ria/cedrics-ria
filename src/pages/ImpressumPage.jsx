import { C } from '../constants';

export default function ImpressumPage({ goTo }) {
  return (
    <div style={{ minHeight: "100vh", background: C.cream, padding: "4rem 1.5rem" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <button onClick={() => goTo("home")} style={{ background: "white", color: C.forest, padding: "0.7rem 1.1rem", borderRadius: 12, border: `1px solid ${C.line}`, fontWeight: 600, cursor: "pointer", marginBottom: "2rem" }}>← Zurück</button>
        <p style={{ fontSize: "0.75rem", letterSpacing: "0.16em", textTransform: "uppercase", color: C.sage, fontWeight: 700, marginBottom: "0.5rem" }}>Rechtliches</p>
        <h1 style={{ color: C.forest, fontSize: "2.4rem", marginTop: 0, marginBottom: "2rem", letterSpacing: "-0.03em" }}>Impressum</h1>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          <div style={{ background: "white", borderRadius: 20, padding: "1.75rem 2rem", border: `1px solid ${C.line}`, boxShadow: C.shadow, lineHeight: 1.8, color: C.ink, fontSize: "0.95rem" }}>
            <h2 style={{ color: C.forest, margin: "0 0 0.85rem", fontSize: "1.05rem" }}>Angaben gemäß § 5 TMG</h2>
            <p style={{ margin: 0, color: C.muted }}>
              <strong style={{ color: C.forest }}>ria – rent it all</strong><br />
              Cedric Renner<br />
              Piepenturmweg 5a<br />
              33100 Paderborn<br />
              Deutschland
            </p>
          </div>

          <div style={{ background: "white", borderRadius: 20, padding: "1.75rem 2rem", border: `1px solid ${C.line}`, boxShadow: C.shadow, lineHeight: 1.8, color: C.ink, fontSize: "0.95rem" }}>
            <h2 style={{ color: C.forest, margin: "0 0 0.85rem", fontSize: "1.05rem" }}>Kontakt</h2>
            <p style={{ margin: 0, color: C.muted }}>
              E-Mail: <a href="mailto:hallo@ria-app.de" style={{ color: C.terra }}>hallo@ria-app.de</a>
            </p>
          </div>

          <div style={{ background: "white", borderRadius: 20, padding: "1.75rem 2rem", border: `1px solid ${C.line}`, boxShadow: C.shadow, lineHeight: 1.8, color: C.ink, fontSize: "0.95rem" }}>
            <h2 style={{ color: C.forest, margin: "0 0 0.85rem", fontSize: "1.05rem" }}>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <p style={{ margin: 0, color: C.muted }}>
              Cedric Renner<br />
              Piepenturmweg 5a, 33100 Paderborn
            </p>
          </div>

          <div style={{ background: "white", borderRadius: 20, padding: "1.75rem 2rem", border: `1px solid ${C.line}`, boxShadow: C.shadow, lineHeight: 1.8, color: C.ink, fontSize: "0.95rem" }}>
            <h2 style={{ color: C.forest, margin: "0 0 0.85rem", fontSize: "1.05rem" }}>Haftungsausschluss</h2>
            <p style={{ margin: 0, color: C.muted }}>
              ria ist eine Plattform, die Privatpersonen ermöglicht, Gegenstände zu verleihen und zu mieten.
              Für die Inhalte der Inserate sind ausschließlich die jeweiligen Anbieter verantwortlich.
              ria übernimmt keine Haftung für die Richtigkeit, Vollständigkeit oder Aktualität der
              eingestellten Inhalte. Für externe Links übernehmen wir keine Verantwortung —
              zum Zeitpunkt der Verlinkung waren keine Rechtsverstöße erkennbar.
            </p>
          </div>

          <div style={{ background: "white", borderRadius: 20, padding: "1.75rem 2rem", border: `1px solid ${C.line}`, boxShadow: C.shadow, lineHeight: 1.8, color: C.ink, fontSize: "0.95rem" }}>
            <h2 style={{ color: C.forest, margin: "0 0 0.85rem", fontSize: "1.05rem" }}>Streitschlichtung</h2>
            <p style={{ margin: 0, color: C.muted }}>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
              <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" style={{ color: C.terra }}>
                https://ec.europa.eu/consumers/odr/
              </a>
              <br /><br />
              Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
