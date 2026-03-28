import { C } from '../constants';

export default function AGBPage({ goTo }) {
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
        <p
          style={{
            fontSize: '0.75rem',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: C.sage,
            fontWeight: 700,
            marginBottom: '0.5rem',
          }}
        >
          Rechtliches
        </p>
        <h1
          style={{
            color: C.forest,
            fontSize: '2.4rem',
            marginTop: 0,
            marginBottom: '2rem',
            letterSpacing: '-0.03em',
          }}
        >
          Allgemeine Geschäftsbedingungen
        </h1>
        <div
          style={{
            background: 'white',
            borderRadius: 20,
            padding: '2rem',
            border: `1px solid ${C.line}`,
            boxShadow: C.shadow,
            lineHeight: 1.8,
            color: C.ink,
            fontSize: '0.95rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {[
            [
              '§ 1 Geltungsbereich',
              [
                'Diese AGB gelten für die Nutzung der Plattform ria (ria-rentitall.de). Mit der Registrierung akzeptiert der Nutzer diese Bedingungen.',
              ],
            ],
            [
              '§ 2 Leistungsbeschreibung',
              [
                'ria stellt eine Online-Plattform bereit, über die Privatpersonen Gegenstände untereinander verleihen und mieten können. ria ist kein Vertragspartner der einzelnen Miet-Transaktionen.',
              ],
            ],
            [
              '§ 3 Registrierung & Mindestalter',
              [
                'Die Nutzung erfordert eine Registrierung mit gültiger E-Mail-Adresse. Die Plattform richtet sich ausschließlich an Personen ab 18 Jahren. Jede Person darf nur ein Konto anlegen. Die Zugangsdaten sind vertraulich zu behandeln. ria behält sich vor, Konten bei Verdacht auf Missbrauch oder Falschangaben zu sperren.',
              ],
            ],
            [
              '§ 4 Inserate & verbotene Inhalte',
              [
                'Nutzer sind verantwortlich für die Richtigkeit und Vollständigkeit ihrer Inserate. ria behält sich vor, Inserate ohne Angabe von Gründen zu entfernen.',
                'Folgende Gegenstände und Inhalte sind ausdrücklich verboten:',
                '• Waffen, Munition, Sprengstoff oder Kampfmittel jeglicher Art\n• Betäubungsmittel und illegale Substanzen\n• Gestohlene oder aus illegalen Quellen stammende Gegenstände\n• Gegenstände, deren Vermietung einer behördlichen Genehmigung bedarf, ohne dass diese vorliegt\n• Pornografische oder jugendgefährdende Inhalte\n• Gegenstände oder Dienstleistungen, die gegen geltendes Recht verstoßen\n• Persönliche Daten Dritter ohne deren Einwilligung',
                'Nutzer, die verbotene Inhalte einstellen, haften für alle daraus entstehenden Schäden. ria erstattet bei Bedarf Anzeige bei den zuständigen Behörden.',
              ],
            ],
            [
              '§ 5 Digitaler Mietvertrag',
              [
                'ria stellt Nutzern optional eine Funktion zur Erstellung eines digitalen Mietvertrags zur Verfügung. Dieser Vertrag wird ausschließlich zwischen Verleiher und Mieter geschlossen. ria ist nicht Vertragspartei.',
                'Der digitale Mietvertrag erfüllt die Anforderungen der Textform gemäß § 126b BGB. Beide Parteien bestätigen den Vertragsabschluss durch eine aktive Handlung (Erstellen bzw. Unterzeichnen) innerhalb der Plattform. Datum und Uhrzeit der jeweiligen Bestätigung werden mit Zeitstempel gespeichert.',
                'Der Inhalt des Vertrags (Mietgegenstand, Zeitraum, Preis, Kaution, Zustand, Anmerkungen) sowie die Bestätigungs-Zeitstempel werden in der Datenbank von ria gespeichert und sind ausschließlich für die beiden beteiligten Vertragsparteien einsehbar.',
                'ria übernimmt keine Haftung für die rechtliche Wirksamkeit, Vollständigkeit oder Durchsetzbarkeit von Verträgen, die über die Plattform erstellt werden. Nutzer sind selbst verantwortlich, die Vertragsdetails vor Unterzeichnung zu prüfen.',
              ],
            ],
            [
              '§ 6 Haftungsausschluss',
              [
                'ria ist ausschließlich eine Vermittlungsplattform und wird nicht Vertragspartei der zwischen Nutzern geschlossenen Mietverträge. Sämtliche Vereinbarungen über Mietbedingungen, Übergabe, Rückgabe und etwaige Schäden werden ausschließlich zwischen Verleiher und Mieter getroffen.',
                'Für Schäden an Gegenständen, Personen oder Dritten, die im Rahmen eines Mietverhältnisses zwischen Nutzern entstehen, übernimmt ria keinerlei Haftung. Dies gilt insbesondere für:',
                '• Beschädigungen, Verlust oder Diebstahl gemieteter Gegenstände\n• Personen- oder Sachschäden, die durch die Nutzung gemieteter Gegenstände entstehen\n• Schäden durch falsche, unvollständige oder irreführende Angaben in Inseraten\n• Ausfall oder Nichterfüllung vereinbarter Leistungen',
                'Jeder Nutzer handelt bei der Nutzung der Plattform sowie bei allen darüber zustande kommenden Mietverhältnissen auf eigenes Risiko und in eigener Verantwortung. Verleiher und Mieter sind selbst dafür verantwortlich, den Zustand eines Gegenstands vor der Übergabe zu prüfen, etwaige Schäden zu dokumentieren und bei Bedarf geeignete Absicherungen (z. B. durch Kaution oder Versicherung) zu treffen.',
                'Die Haftung von ria ist zudem auf Vorsatz und grobe Fahrlässigkeit beschränkt. Eine Haftung für leichte Fahrlässigkeit ist – soweit gesetzlich zulässig – ausgeschlossen.',
              ],
            ],
            [
              '§ 7 Datenschutz',
              [
                'Die Verarbeitung personenbezogener Daten erfolgt gemäß unserer Datenschutzerklärung und der DSGVO.',
              ],
            ],
            [
              '§ 8 Kündigung & Kontolöschung',
              [
                'Nutzer können ihr Konto jederzeit durch Kontaktaufnahme unter hallo@ria-rentitall.de löschen lassen. Mit der Kontolöschung werden alle personenbezogenen Daten innerhalb von 30 Tagen gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.',
                'ria behält sich vor, Nutzerkonten bei Verstößen gegen diese AGB fristlos zu sperren oder zu löschen.',
              ],
            ],
            [
              '§ 9 Änderungen der AGB',
              [
                'ria behält sich vor, diese AGB zu ändern. Über wesentliche Änderungen werden Nutzer mindestens 30 Tage vor Inkrafttreten per E-Mail informiert. Wird der Nutzung nach Ablauf der Frist nicht widersprochen, gelten die neuen AGB als akzeptiert. Das Widerspruchsrecht bleibt unberührt.',
              ],
            ],
            [
              '§ 10 Anwendbares Recht & Gerichtsstand',
              [
                'Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand für Streitigkeiten mit Unternehmern ist Paderborn. Für Verbraucher gelten die gesetzlichen Zuständigkeitsregelungen.',
              ],
            ],
            [
              '§ 11 Salvatorische Klausel',
              [
                'Sollten einzelne Bestimmungen dieser AGB ganz oder teilweise unwirksam sein oder werden, berührt dies die Wirksamkeit der übrigen Bestimmungen nicht. Anstelle der unwirksamen Bestimmung gilt eine wirksame Regelung, die dem wirtschaftlichen Zweck der unwirksamen Klausel am nächsten kommt.',
              ],
            ],
          ].map(([title, paragraphs]) => (
            <div key={title}>
              <h3 style={{ color: C.forest, margin: '0 0 0.5rem', fontSize: '1rem' }}>{title}</h3>
              {paragraphs.map((p, i) => (
                <p key={i} style={{ margin: '0 0 0.6rem', color: C.muted, whiteSpace: 'pre-line' }}>
                  {p}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
