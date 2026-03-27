import { C } from '../constants';

export default function VerifiedBadge({ small = false }) {
  return (
    <span title="Verifiziertes Konto" style={{ display: "inline-flex", alignItems: "center", gap: "0.2rem", background: "rgba(28,58,46,0.10)", color: C.forest, borderRadius: 999, padding: small ? "0.12rem 0.45rem" : "0.2rem 0.6rem", fontSize: small ? "0.63rem" : "0.72rem", fontWeight: 700, letterSpacing: "0.02em", verticalAlign: "middle" }}>
      <svg width={small ? 8 : 9} height={small ? 8 : 9} viewBox="0 0 10 10"><polyline points="1.5,5.5 4,8 8.5,2" stroke={C.forest} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
      {!small && "Verifiziert"}
    </span>
  );
}
