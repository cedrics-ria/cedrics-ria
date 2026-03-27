import { C } from '../constants';

export default function AGBPage({ goTo }) {
  return (
    <div style={{ minHeight: "100vh", background: C.cream, padding: "4rem 1.5rem" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <button onClick={() => goTo("home")} style={{ background: "white", color: C.forest, padding: "0.7rem 1.1rem", borderRadius: 12, border: `1px solid ${C.line}`, fontWeight: 600, cursor: "pointer", marginBottom: "2rem" }}>← Zurück</button>
        <p style={{ fontSize: "0.75rem", letterSpacing: "0.16em", textTransform: "uppercase", color: C.sage, fontWeight: 700, marginBottom: "0.5rem" }}>Rechtliches</p>
        <h1 style={{ color: C.forest, fontSize: "2.4rem", marginTop: 0, marginBottom: "2rem", letterSpacing: "-0.03em" }}>Allgemeine Geschäftsbedingungen</h1>
        <div style={{ background: "white", borderRadius: 20, padding: "2rem", border: `1px solid ${C.line}`, boxShadow: C.shadow, lineHeight: 1.8, color: C.ink, fontSize: "0.95rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[
            ["§ 1 Geltungsbereich", "Diese AGB gelten für die Nutzung der Plattform ria (ria-app.de). Mit der Registrierung akzeptiert der Nutzer diese Bedingungen."],
            ["§ 2 Leistungsbeschreibung", "ria stellt eine Online-Plattform bereit, über die Privatpersonen Gegenstände untereinander verleihen und mieten können. ria ist kein Vertragspartner der einzelnen Miet-Transaktionen."],
            ["§ 3 Registrierung", "Die Nutzung erfordert eine Registrierung mit gültiger E-Mail-Adresse. Jede Person darf nur ein Konto anlegen. Die Zugangsdaten sind vertraulich zu behandeln."],
            ["§ 4 Inserate", "Nutzer sind verantwortlich für die Richtigkeit ihrer Inserate. Illegale oder gefährliche Gegenstände dürfen nicht eingestellt werden. ria behält sich vor, Inserate ohne Angabe von Gründen zu entfernen."],
            ["§ 5 Haftung", "ria haftet nicht für Schäden, die im Rahmen von Mietgeschäften zwischen Nutzern entstehen. Nutzer handeln auf eigenes Risiko."],
            ["§ 6 Datenschutz", "Die Verarbeitung personenbezogener Daten erfolgt gemäß unserer Datenschutzerklärung und der DSGVO."],
            ["§ 7 Änderungen", "ria behält sich vor, diese AGB jederzeit zu ändern. Nutzer werden über wesentliche Änderungen per E-Mail informiert."],
          ].map(([title, text]) => (
            <div key={title}>
              <h3 style={{ color: C.forest, margin: "0 0 0.4rem", fontSize: "1rem" }}>{title}</h3>
              <p style={{ margin: 0, color: C.muted }}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
