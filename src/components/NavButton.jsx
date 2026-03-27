import { C } from '../constants';

export default function NavButton({ label, active, onClick, "aria-current": ariaCurrent }) {
  return (
    <button
      className="ria-topbar-navbtn"
      onClick={onClick}
      aria-current={ariaCurrent}
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
