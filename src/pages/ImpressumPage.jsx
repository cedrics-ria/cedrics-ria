import { C } from '../constants';

const cardStyle = {
  background: 'white',
  borderRadius: 20,
  padding: '1.75rem 2rem',
  border: `1px solid ${C.line}`,
  boxShadow: C.shadow,
  lineHeight: 1.8,
  color: C.ink,
  fontSize: '0.95rem',
};

const h2Style = {
  color: C.forest,
  margin: '0 0 0.85rem',
  fontSize: '1.05rem',
  letterSpacing: '-0.01em',
};

const mutedText = { margin: 0, color: C.muted, lineHeight: 1.8 };

export default function ImpressumPage({ goTo }) {
  return (
    <div style={{ minHeight: '100vh', background: C.cream, padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <button
          onClick={() => goTo('home')}
          style={{
            background: 'white',
            color: C.forest,
            padding: '0.7rem 1.1rem',
            borderRadius: 12,
            border: `1px solid ${C.line}`,
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '2rem',
          }}
        >
          ← Zurück
        </button>

        <p style={{ fontSize: '0.75rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: C.sage, fontWeight: 700, marginBottom: '0.5rem' }}>
          Rechtliches
        </p>
        <h1 style={{ color: C.forest, fontSize: '2.4rem', marginTop: 0, marginBottom: '0.4rem', letterSpacing: '-0.03em' }}>
          Impressum
        </h1>
        <p style={{ color: C.muted, fontSize: '0.88rem', marginBottom: '2rem' }}>
          Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz) · Stand: März 2026
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          <div style={cardStyle}>
            <h2 style={h2Style}>Anbieter &amp; Verantwortlicher</h2>
            <p style={mutedText}>
              <strong style={{ color: C.forest }}>ria – rent it all</strong><br />
              Cedric Renner<br />
              Piepenturmweg 5a<br />
              33100 Paderborn<br />
              Deutschland
            </p>
          </div>

          <div style={cardStyle}>
            <h2 style={h2Style}>Kontakt</h2>
            <p style={mutedText}>
              E-Mail:{' '}
              <a href="mailto:ria.rentitall@web.de" style={{ color: C.terra }}>
                ria.rentitall@web.de
              </a>
              <br />
              Website:{' '}
              <a href="https://ria-rentitall.de" style={{ color: C.terra }}>
                ria-rentitall.de
              </a>
            </p>
          </div>

          <div style={cardStyle}>
            <h2 style={h2Style}>Umsatzsteuer</h2>
            <p style={mutedText}>
              ria wird als privates, nicht-gewerbliches Projekt betrieben. Eine
              Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG liegt nicht vor. Es gilt die
              Kleinunternehmerregelung nach § 19 UStG.
            </p>
          </div>

          <div style={cardStyle}>
            <h2 style={h2Style}>Inhaltlich verantwortlich gemäß § 18 Abs. 2 MStV</h2>
            <p style={mutedText}>
              Cedric Renner<br />
              Piepenturmweg 5a, 33100 Paderborn
            </p>
          </div>

          <div style={cardStyle}>
            <h2 style={h2Style}>Haftung für Inhalte (§ 7 DDG)</h2>
            <p style={mutedText}>
              ria ist eine Plattform, die Privatpersonen ermöglicht, Gegenstände zu verleihen und
              zu mieten. Für die Inhalte der Inserate sind ausschließlich die jeweiligen Anbieter
              verantwortlich. ria übernimmt keine Haftung für Richtigkeit, Vollständigkeit oder
              Aktualität der eingestellten Inhalte. Bei Bekanntwerden von Rechtsverstößen werden
              entsprechende Inhalte unverzüglich entfernt.
            </p>
          </div>

          <div style={cardStyle}>
            <h2 style={h2Style}>Haftung für Links (§ 8–10 DDG)</h2>
            <p style={mutedText}>
              Unser Angebot enthält Links zu externen Webseiten. Für deren Inhalte übernehmen wir
              keine Verantwortung, da wir keinen Einfluss auf diese haben. Zum Zeitpunkt der
              Verlinkung waren keine Rechtsverstöße erkennbar.
            </p>
          </div>

          <div style={cardStyle}>
            <h2 style={h2Style}>Urheberrecht</h2>
            <p style={mutedText}>
              Die durch uns erstellten Inhalte unterliegen dem deutschen Urheberrecht. Nutzer, die
              eigene Inhalte (Fotos, Texte) hochladen, bestätigen, dass sie die erforderlichen
              Rechte daran besitzen, und räumen ria eine nicht-exklusive Lizenz zur Darstellung auf
              der Plattform ein.
            </p>
          </div>

          <div style={cardStyle}>
            <h2 style={h2Style}>Online-Streitbeilegung</h2>
            <p style={mutedText}>
              Die EU-Kommission stellt eine Plattform zur Online-Streitbeilegung bereit:{' '}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: C.terra }}
              >
                ec.europa.eu/consumers/odr
              </a>
              <br /><br />
              Wir sind nicht verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen, da ria als privates, nicht-gewerbliches
              Projekt betrieben wird (§ 36 VSBG).
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
