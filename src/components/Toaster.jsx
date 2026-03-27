import { C } from '../constants';

export default function Toaster({ toasts }) {
  return (
    <div role="status" aria-live="polite" aria-atomic="false" style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 9999, display: "flex", flexDirection: "column", gap: "0.75rem", pointerEvents: "none" }}>
      {toasts.map((t) => (
        <div key={t.id} role={t.type === "error" ? "alert" : undefined} aria-live={t.type === "error" ? "assertive" : undefined} style={{ background: t.type === "error" ? C.terra : C.forest, color: "white", padding: "0.9rem 1.25rem", borderRadius: 14, fontSize: "0.95rem", fontWeight: 600, boxShadow: "0 12px 30px rgba(0,0,0,0.18)", animation: "fadeUp 0.3s ease both", maxWidth: 340 }}>
          {t.text}
        </div>
      ))}
    </div>
  );
}
