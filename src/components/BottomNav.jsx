import { C } from '../constants';

export default function BottomNav({ currentPage, goTo, currentUser, unreadCount, onOpenMessages }) {
  const ic = (active, paths) => (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={active ? "white" : "rgba(255,255,255,0.42)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{paths}</svg>
  );
  const tabs = [
    { id: "home", label: "Home", icon: (a) => ic(a, <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></>) },
    { id: "listings", label: "Suchen", icon: (a) => ic(a, <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></>) },
    { id: "create-listing", label: "Erstellen", icon: (a) => ic(a, <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></>) },
    { id: "messages", label: "Postfach", icon: (a) => ic(a, <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>) },
    { id: currentUser ? "profile" : "login", label: currentUser ? "Profil" : "Login", icon: (a) => ic(a, <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>) },
  ];
  return (
    <nav className="ria-bottom-nav" aria-label="Mobile Navigation" style={{ position: "fixed", bottom: "0.85rem", left: "0.75rem", right: "0.75rem", zIndex: 900, background: "linear-gradient(135deg, #163126 0%, #1C3A2E 100%)", borderRadius: 22, boxShadow: "0 16px 48px rgba(28,58,46,0.5), 0 4px 16px rgba(0,0,0,0.18)" }}>
      <div style={{ display: "flex", padding: "0.35rem 0.2rem" }}>
        {tabs.map((tab) => {
          const isActive = currentPage === tab.id;
          const isMsgs = tab.id === "messages";
          return (
            <button key={tab.id} onClick={() => isMsgs ? onOpenMessages() : goTo(tab.id)} aria-current={isActive && !isMsgs ? "page" : undefined} aria-label={isMsgs && unreadCount > 0 ? `${tab.label} (${unreadCount} ungelesen)` : tab.label} style={{ flex: 1, padding: "0.3rem 0.15rem 0.25rem", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem", position: "relative", WebkitTapHighlightColor: "transparent" }}>
              <div style={{ width: 42, height: 34, borderRadius: 12, background: isActive ? "rgba(255,255,255,0.13)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", transition: "background 0.2s ease" }}>
                {tab.icon(isActive)}
                {isMsgs && unreadCount > 0 && (
                  <div style={{ position: "absolute", top: 2, right: 4, minWidth: 14, height: 14, borderRadius: 999, background: C.terra, color: "white", fontSize: "0.52rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px", border: "1.5px solid #1C3A2E" }}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </div>
                )}
              </div>
              <span style={{ fontSize: "0.56rem", fontWeight: isActive ? 700 : 400, color: isActive ? C.terra : "rgba(255,255,255,0.42)", letterSpacing: "0.01em", transition: "color 0.2s ease" }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
