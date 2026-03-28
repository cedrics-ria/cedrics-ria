import { C } from '../constants';

const sections = [
  [
    '1. Verantwortlicher',
    `Verantwortlicher im Sinne der DSGVO:

Cedric Renner
Piepenturmweg 5a
33100 Paderborn
Deutschland
E-Mail: hallo@ria-rentitall.de

ria wird als privates, nicht-gewerbliches Projekt betrieben.`,
  ],
  [
    '2. Erhobene Daten',
    `Bei Registrierung und Nutzung von ria erheben wir folgende Daten:

• E-Mail-Adresse (Konto, Kommunikation)
• Name (öffentliches Profil)
• Profilbild (optional, von dir hochgeladen)
• Inserate (Titel, Beschreibung, Ort, Preis, Fotos)
• Nachrichten zwischen Nutzern
• Buchungsanfragen (Zeitraum, Inseratreferenz)
• Push-Benachrichtigungs-Token (optional, nur bei Zustimmung im Browser)
• Digitale Mietverträge (optional): Mietgegenstand, Zeitraum, Preis, Kaution, Zustandsbeschreibung, Anmerkungen sowie Zeitstempel der Unterzeichnung beider Parteien
• Technische Daten: IP-Adresse, Browser-Typ, Zugriffszeiten (via Supabase)`,
  ],
  [
    '3. Zweck der Datenverarbeitung',
    `Deine Daten werden ausschließlich zu folgenden Zwecken verarbeitet:

• Bereitstellung und Betrieb der Plattform
• Verwaltung deines Nutzerkontos
• Kommunikation zwischen Nutzern (Nachrichten, Buchungsanfragen)
• Versand von Benachrichtigungs-E-Mails bei neuen Nachrichten
• Push-Benachrichtigungen (nur mit ausdrücklicher Browser-Erlaubnis)
• Erstellung und Speicherung digitaler Mietverträge zwischen Nutzern (nur auf Wunsch beider Parteien)
• Verbesserung der Plattform

Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse). Push-Benachrichtigungen: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung). Digitale Mietverträge: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung zwischen den beteiligten Nutzern).`,
  ],
  [
    '4. Auftragsverarbeiter & Dienstleister',
    `Deine Daten werden nicht verkauft. Wir nutzen folgende Dienstleister:

Supabase Inc. (USA)
Datenbank, Authentifizierung, Datei-Speicherung.
Datenschutz: supabase.com/privacy
Übermittlung in Drittland auf Basis von Standardvertragsklauseln (SCC).

Vercel Inc. (USA)
Hosting, Serverless Functions, Web Analytics.
Vercel Analytics erfasst anonymisierte Nutzungsdaten (Seitenaufrufe, Gerätetyp, Land) ohne Cookies und ohne persönliche Identifikation.
Datenschutz: vercel.com/docs/analytics/privacy-policy

Resend Inc. (USA)
Transaktionaler E-Mail-Versand (Benachrichtigungen bei neuen Nachrichten).
Dabei werden Empfänger-E-Mail und eine Nachrichtenvorschau übermittelt.
Datenschutz: resend.com/privacy

Web Push (Browserbenachrichtigungen)
Push-Tokens werden in unserer Datenbank gespeichert und dienen ausschließlich dem Versand von Benachrichtigungen. Sie werden bei Kontolöschung oder Abmeldung entfernt.`,
  ],
  [
    '5. Speicherdauer',
    `Wir speichern deine Daten solange, wie dein Konto aktiv ist. Nach Kontolöschung werden personenbezogene Daten innerhalb von 30 Tagen gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen. Push-Tokens werden sofort bei Abmeldung entfernt.

Digitale Mietverträge werden für die Dauer der Konten beider beteiligten Parteien gespeichert. Da Mietverträge als rechtsverbindliche Dokumente dienen können, behalten wir uns vor, diese auch nach Kontolöschung für einen Zeitraum von bis zu 3 Jahren aufzubewahren, sofern ein berechtigtes Interesse besteht (z. B. zur Beweissicherung bei Streitigkeiten).`,
  ],
  [
    '6. Deine Rechte (DSGVO)',
    `Du hast jederzeit folgende Rechte:

• Auskunft über gespeicherte Daten (Art. 15 DSGVO)
• Berichtigung unrichtiger Daten (Art. 16 DSGVO)
• Löschung deiner Daten ("Recht auf Vergessenwerden", Art. 17 DSGVO)
• Einschränkung der Verarbeitung (Art. 18 DSGVO)
• Datenübertragbarkeit (Art. 20 DSGVO)
• Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)
• Widerruf einer Einwilligung (z. B. Push-Benachrichtigungen) jederzeit

Anfragen an: hallo@ria-rentitall.de

Beschwerderecht bei der Aufsichtsbehörde:
Landesbeauftragte für Datenschutz und Informationsfreiheit NRW
ldi.nrw.de`,
  ],
  [
    '7. Cookies & lokale Speicherung',
    `ria setzt keine Tracking- oder Werbe-Cookies ein. Wir nutzen den lokalen Browser-Speicher (localStorage) ausschließlich für technische Zwecke:

• Login-Status (Sitzungsverwaltung)
• Favoriten-Liste
• Zuletzt gelesene Nachrichten (Zeitstempel)
• Buchungsbestätigungen (lokal gecacht)

Da kein Tracking stattfindet, ist ein Cookie-Banner nicht erforderlich.`,
  ],
  [
    '8. Push-Benachrichtigungen',
    `Push-Benachrichtigungen sind vollständig optional. Der Browser fragt vor der Aktivierung ausdrücklich nach deiner Erlaubnis. Du kannst diese Erlaubnis jederzeit in den Browser-Einstellungen widerrufen. Dein Push-Token wird bei Widerruf oder Kontolöschung aus unserer Datenbank gelöscht.`,
  ],
  [
    '9. Nutzer-generierte Inhalte',
    `Inserate, Profilbilder und Nachrichten, die du auf ria veröffentlichst, sind für andere Nutzer sichtbar. Bitte teile keine sensiblen personenbezogenen Daten in Inseraten oder Nachrichten. ria ist nicht verantwortlich für Inhalte, die Nutzer selbst einstellen.`,
  ],
  [
    '10. Minderjährige',
    `ria richtet sich ausschließlich an Nutzer ab 18 Jahren. Wir erheben wissentlich keine Daten von Personen unter 18 Jahren. Bitte wende dich an hallo@ria-rentitall.de, wenn du vermutest, dass ein minderjähriger Nutzer ein Konto erstellt hat.`,
  ],
  [
    '11. Änderungen dieser Erklärung',
    `Wir behalten uns vor, diese Datenschutzerklärung anzupassen, wenn sich rechtliche Anforderungen oder unsere Dienste ändern. Bei wesentlichen Änderungen werden registrierte Nutzer per E-Mail informiert. Die jeweils aktuelle Version ist auf dieser Seite abrufbar.

Stand: März 2026`,
  ],
  [
    '12. Kontakt bei Datenschutzfragen',
    `Cedric Renner
E-Mail: hallo@ria-rentitall.de
Antwortzeit: in der Regel innerhalb von 7 Werktagen`,
  ],
];

export default function DatenschutzPage({ goTo }) {
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
          Datenschutzerklärung
        </h1>
        <p style={{ color: C.muted, fontSize: '0.88rem', marginBottom: '2rem' }}>
          Gemäß DSGVO, BDSG &amp; DDG · Stand: März 2026
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sections.map(([title, text]) => (
            <div
              key={title}
              style={{
                background: 'white',
                borderRadius: 20,
                padding: '1.75rem 2rem',
                border: `1px solid ${C.line}`,
                boxShadow: C.shadow,
              }}
            >
              <h2 style={{ color: C.forest, margin: '0 0 0.85rem', fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
                {title}
              </h2>
              <p style={{ margin: 0, color: C.muted, lineHeight: 1.8, fontSize: '0.93rem', whiteSpace: 'pre-line' }}>
                {text}
              </p>
            </div>
          ))}
        </div>

        {/* NRW Aufsichtsbehörde Link */}
        <div style={{ marginTop: '1.5rem', padding: '1.25rem 1.5rem', background: C.sageLight, borderRadius: 16, fontSize: '0.85rem', color: C.forest }}>
          <strong>Zuständige Aufsichtsbehörde:</strong>{' '}
          Landesbeauftragte für Datenschutz und Informationsfreiheit NRW —{' '}
          <a href="https://www.ldi.nrw.de" target="_blank" rel="noopener noreferrer" style={{ color: C.terra }}>
            ldi.nrw.de
          </a>
        </div>
      </div>
    </div>
  );
}
