import { useState } from 'react';
import { C, ADMIN_EMAIL } from '../constants';
import Logo from './Logo';
import NavButton from './NavButton';

export default function TopBar({
  currentPage,
  goTo,
  currentUser,
  profile,
  onLogout,
  unreadCount,
  onOpenMessages,
  unreadSupportCount,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuItemStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    padding: '0.65rem 1rem',
    borderRadius: 10,
    fontSize: '0.93rem',
    fontWeight: 600,
    color: C.forest,
    cursor: 'pointer',
  };
  return (
    <div
      className="ria-topbar"
      role="banner"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 300,
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(18px)',
        borderBottom: `1px solid ${C.line}`,
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.8rem',
        boxShadow: '0 8px 30px rgba(28,58,46,0.06)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div
          className="ria-topbar-logo"
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <Logo size={1.6} color={C.forest} />
        </div>
        <nav
          aria-label="Hauptnavigation"
          className="ria-topbar-nav-group"
          style={{ display: 'flex', gap: '0.5rem' }}
        >
          <NavButton
            label="Home"
            active={currentPage === 'home'}
            onClick={() => goTo('home')}
            aria-current={currentPage === 'home' ? 'page' : undefined}
          />
          <NavButton
            label="Inserate"
            active={currentPage === 'listings'}
            onClick={() => goTo('listings')}
            aria-current={currentPage === 'listings' ? 'page' : undefined}
          />
        </nav>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <div className="ria-topbar-user">
          {!currentUser ? (
            <button
              onClick={() => goTo('login')}
              style={{
                background: 'linear-gradient(135deg, #163126, #1C3A2E)',
                color: 'white',
                border: 'none',
                borderRadius: 999,
                padding: '0.8rem 1.3rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(28,58,46,0.22)',
                letterSpacing: '-0.01em',
              }}
            >
              Einloggen →
            </button>
          ) : (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-expanded={menuOpen}
                aria-haspopup="true"
                aria-label="Benutzermenü"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: menuOpen ? C.sageLight : 'rgba(255,255,255,0.72)',
                  border: `1px solid ${C.line}`,
                  borderRadius: 999,
                  padding: '0.45rem 0.9rem 0.45rem 0.45rem',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #163126, #1C3A2E)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      overflow: 'hidden',
                    }}
                  >
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      currentUser.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: -3,
                        right: -3,
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: C.terra,
                        border: '2px solid white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.55rem',
                        color: 'white',
                        fontWeight: 800,
                      }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: C.forest }}>
                  {currentUser.name}
                </span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    color: C.muted,
                    display: 'inline-block',
                    transform: menuOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  ▾
                </span>
              </button>
              {menuOpen && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 398 }}
                    onClick={() => setMenuOpen(false)}
                  />
                  <div
                    role="menu"
                    aria-label="Benutzermenü"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 0.6rem)',
                      right: 0,
                      background: 'white',
                      borderRadius: 18,
                      border: `1px solid ${C.line}`,
                      boxShadow: '0 20px 50px rgba(28,58,46,0.14)',
                      padding: '0.5rem',
                      minWidth: 220,
                      zIndex: 399,
                      animation: 'fadeUp 0.2s ease both',
                    }}
                  >
                    <button
                      role="menuitem"
                      style={menuItemStyle}
                      onClick={() => {
                        goTo('create-listing');
                        setMenuOpen(false);
                      }}
                    >
                      <span>Inserat erstellen</span>
                    </button>
                    <button
                      role="menuitem"
                      style={menuItemStyle}
                      onClick={() => {
                        onOpenMessages();
                        setMenuOpen(false);
                      }}
                    >
                      <span>Nachrichten</span>
                      {unreadCount > 0 && (
                        <span
                          aria-label={`${unreadCount} ungelesene Nachrichten`}
                          style={{
                            background: C.terra,
                            color: 'white',
                            borderRadius: 999,
                            padding: '0.1rem 0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                          }}
                        >
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    <button
                      role="menuitem"
                      style={menuItemStyle}
                      onClick={() => {
                        goTo('profile');
                        setMenuOpen(false);
                      }}
                    >
                      <span>Profil</span>
                    </button>
                    {(currentUser?.email === ADMIN_EMAIL || profile?.is_admin) && (
                      <button
                        role="menuitem"
                        style={menuItemStyle}
                        onClick={() => {
                          goTo('admin');
                          setMenuOpen(false);
                        }}
                      >
                        <span>Admin</span>
                        {unreadSupportCount > 0 && (
                          <span
                            style={{
                              background: C.terra,
                              color: 'white',
                              borderRadius: 999,
                              padding: '0.1rem 0.5rem',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                            }}
                          >
                            {unreadSupportCount}
                          </span>
                        )}
                      </button>
                    )}
                    <div
                      role="separator"
                      style={{ borderTop: `1px solid ${C.line}`, margin: '0.4rem 0' }}
                    />
                    <button
                      role="menuitem"
                      style={{ ...menuItemStyle, color: C.terra }}
                      onClick={() => {
                        onLogout();
                        setMenuOpen(false);
                      }}
                    >
                      Ausloggen
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
