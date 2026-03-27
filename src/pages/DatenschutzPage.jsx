import { C } from '../constants';

export default function DatenschutzPage({ goTo }) {
  const sections = [
    ["1. Verantwortlicher", "Verantwortlicher im Sinne der DSGVO ist:\n\nCedric Renner\nPiepenturmweg 5a\n33100 Paderborn\nDeutschland\nE-Mail: hallo@ria-app.de"],
    ["2. Welche Daten wir erheben", "Bei der Registrierung und Nutzung von ria erheben wir folgende personenbezogenen Daten:\n\n• E-Mail-Adresse (für Konto und Kommunikation)\n• Name (für dein öffentliches Profil)\n• Profilbild (optional, von dir hochgeladen)\n• Inserate, die du erstellst (Titel, Beschreibung, Ort, Preis, Bilder)\n• Nachrichten, die du über die Plattform sendest\n• Technische Daten: IP-Adresse, Browser-Typ, Zugriffszeiten (via Supabase)"],
    ["3. Zweck der Datenverarbeitung", "Wir verarbeiten deine Daten ausschließlich zu folgenden Zwecken:\n\n• Bereitstellung und Betrieb der Plattform\n• Verwaltung deines Nutzerkontos\n• Kommunikation zwischen Nutzern über das Nachrichtensystem\n• Verbesserung der Plattform\n\nRechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)."],
    ["4. Datenweitergabe", "Deine Daten werden nicht an Dritte verkauft. Wir nutzen folgende Dienstleister:\n\n• Supabase Inc. (USA) – Datenbank, Authentifizierung und Datei-Speicherung. Datenverarbeitung erfolgt gemäß Supabase-Datenschutzrichtlinie (supabase.com/privacy). Es besteht ein Auftragsverarbeitungsvertrag.\n• Unsplash (nur Demo-Bilder) – keine personenbezogenen Daten übermittelt.\n\nEine Übermittlung in Drittländer erfolgt nur mit geeigneten Schutzmaßnahmen (Standardvertragsklauseln der EU)."],
    ["5. Speicherdauer", "Wir speichern deine Daten solange, wie dein Konto aktiv ist. Nach Kontolöschung werden deine personenbezogenen Daten innerhalb von 30 Tagen gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten bestehen."],
    ["6. Deine Rechte", "Du hast jederzeit folgende Rechte:\n\n• Auskunft über gespeicherte Daten (Art. 15 DSGVO)\n• Berichtigung unrichtiger Daten (Art. 16 DSGVO)\n• Löschung deiner Daten (Art. 17 DSGVO)\n• Einschränkung der Verarbeitung (Art. 18 DSGVO)\n• Datenübertragbarkeit (Art. 20 DSGVO)\n• Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)\n\nZur Ausübung deiner Rechte wende dich an: hallo@ria-app.de\n\nDu hast außerdem das Recht, dich bei der zuständigen Datenschutzbehörde zu beschweren (Landesbeauftragte für Datenschutz und Informationsfreiheit NRW)."],
    ["7. Cookies und lokale Speicherung", "ria setzt keine Tracking-Cookies ein. Wir verwenden den lokalen Browser-Speicher (localStorage) ausschließlich für technische Zwecke:\n\n• Sitzungsverwaltung (Login-Status)\n• Benutzereinstellungen (z. B. Favoriten)\n\nEs werden keine Werbe- oder Analyse-Cookies gesetzt. Ein Cookie-Banner ist daher nicht erforderlich."],
    ["8. Minderjährige", "ria richtet sich an Nutzer ab 18 Jahren. Wir erheben wissentlich keine Daten von Personen unter 18 Jahren."],
    ["9. Änderungen dieser Datenschutzerklärung", "Wir behalten uns vor, diese Datenschutzerklärung anzupassen, wenn sich rechtliche Anforderungen oder unsere Dienste ändern. Die jeweils aktuelle Version ist auf dieser Seite abrufbar. Stand: März 2026."],
    ["10. Kontakt", "Bei Fragen zum Datenschutz:\n\nCedric Renner\nE-Mail: hallo@ria-app.de"],
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.cream, padding: "4rem 1.5rem" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <button onClick={() => goTo("home")} style={{ background: "white", color: C.forest, padding: "0.7rem 1.1rem", borderRadius: 12, border: `1px solid ${C.line}`, fontWeight: 600, cursor: "pointer", marginBottom: "2rem" }}>← Zurück</button>
        <p style={{ fontSize: "0.75rem", letterSpacing: "0.16em", textTransform: "uppercase", color: C.sage, fontWeight: 700, marginBottom: "0.5rem" }}>Rechtliches</p>
        <h1 style={{ color: C.forest, fontSize: "2.4rem", marginTop: 0, marginBottom: "0.5rem", letterSpacing: "-0.03em" }}>Datenschutzerklärung</h1>
        <p style={{ color: C.muted, fontSize: "0.9rem", marginBottom: "2rem" }}>Gemäß DSGVO, BDSG und TMG · Stand: März 2026</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {sections.map(([title, text]) => (
            <div key={title} style={{ background: "white", borderRadius: 20, padding: "1.75rem 2rem", border: `1px solid ${C.line}`, boxShadow: C.shadow }}>
              <h2 style={{ color: C.forest, margin: "0 0 0.85rem", fontSize: "1.05rem", letterSpacing: "-0.01em" }}>{title}</h2>
              <p style={{ margin: 0, color: C.muted, lineHeight: 1.8, fontSize: "0.93rem", whiteSpace: "pre-line" }}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
