import { useEffect, useState } from 'react';
import { C } from '../constants';
import { supabase } from '../supabase';
import AnalyticsChart from '../components/AnalyticsChart';

function StatCard({ label, value, color }) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: 16,
        padding: '1.25rem 1.5rem',
        border: `1px solid ${C.line}`,
        boxShadow: '0 4px 16px rgba(28,58,46,0.06)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: '2.2rem',
          fontWeight: 900,
          color: color || C.forest,
          lineHeight: 1,
          marginBottom: '0.35rem',
        }}
      >
        {value ?? '—'}
      </div>
      <div
        style={{
          fontSize: '0.8rem',
          color: C.muted,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default function AdminPage({
  currentUser,
  profile,
  goTo,
  addToast,
  listings,
  onDeleteListing,
  onMarkSupportRead,
  onBanUser,
  onViewOwner,
}) {
  const isAdmin = currentUser?.email === 'cedric.s.renner@gmail.com' || profile?.is_admin === true;

  const [stats, setStats] = useState({
    listings: null,
    users: null,
    messages: null,
    support: null,
    transactions: null,
  });
  const [supportRequests, setSupportRequests] = useState([]);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [expandedSupport, setExpandedSupport] = useState(null);
  const [expandedReport, setExpandedReport] = useState(null);
  const [listingSearch, setListingSearch] = useState('');
  const [loadingSupport, setLoadingSupport] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [activeSection, setActiveSection] = useState('stats');
  const [deletingId, setDeletingId] = useState(null);
  const [banningId, setBanningId] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  async function loadStats() {
    try {
      const [listingsRes, usersRes, messagesRes, supportRes, transactionsRes] = await Promise.all([
        supabase.from('listings').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('messages').select('id', { count: 'exact', head: true }),
        supabase.from('support_requests').select('id', { count: 'exact', head: true }),
        supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
      ]);
      setStats({
        listings: listingsRes.count ?? 0,
        users: usersRes.count ?? 0,
        messages: messagesRes.count ?? 0,
        support: supportRes.count ?? 0,
        transactions: transactionsRes.count ?? 0,
      });
    } catch {
      // Stats dashboard remains visible with previous values on network error
    }
  }

  async function loadAnalytics() {
    setLoadingAnalytics(true);
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ label: d.toLocaleString('de-DE', { month: 'short', year: '2-digit' }), year: d.getFullYear(), month: d.getMonth() });
    }
    const cutoff = new Date(months[0].year, months[0].month, 1).toISOString();

    try {
      const [allProfilesRes, listingsRes, bookingsRes] = await Promise.all([
        supabase.from('profiles').select('created_at'),          // ALL — for cumulative
        supabase.from('listings').select('created_at').gte('created_at', cutoff),
        supabase.from('bookings').select('completed_at').eq('status', 'completed').gte('completed_at', cutoff),
      ]);

      const allProfiles = allProfilesRes.data || [];

      // Cumulative user count per month (all users up to & incl. that month)
      const memberData = months.map((m) => {
        const endOfMonth = new Date(m.year, m.month + 1, 0, 23, 59, 59, 999);
        const total = allProfiles.filter(p => p.created_at && new Date(p.created_at) <= endOfMonth).length;
        const newCount = allProfiles.filter(p => {
          if (!p.created_at) return false;
          const d = new Date(p.created_at);
          return d.getFullYear() === m.year && d.getMonth() === m.month;
        }).length;
        return { label: m.label, value: total, new: newCount };
      });

      // If no profiles have created_at, fall back to total in current month
      if (memberData.every(d => d.value === 0) && allProfiles.length > 0) {
        memberData[memberData.length - 1].value = allProfiles.length;
        memberData[memberData.length - 1].new = allProfiles.length;
      }

      function bucket(rows, field) {
        return months.map(m => {
          const count = (rows || []).filter(r => {
            const val = r[field];
            if (!val) return false;
            const d = new Date(val);
            return d.getFullYear() === m.year && d.getMonth() === m.month;
          }).length;
          return { label: m.label, value: count, new: count };
        });
      }

      setAnalyticsData({
        members: memberData,
        listings: bucket(listingsRes.data, 'created_at'),
        transactions: bucket(bookingsRes.data, 'completed_at'),
      });
    } finally {
      setLoadingAnalytics(false);
    }
  }

  async function loadSupportRequests() {
    setLoadingSupport(true);
    const { data } = await supabase
      .from('support_requests')
      .select('*')
      .order('created_at', { ascending: false });
    setSupportRequests(data || []);
    setLoadingSupport(false);
  }

  async function loadReports() {
    setLoadingReports(true);
    const { data } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });
    setReports(data || []);
    setLoadingReports(false);
  }

  async function loadUsers() {
    setLoadingUsers(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('updated_at', { ascending: false });
    setUsers(data || []);
    setLoadingUsers(false);
  }

  useEffect(() => {
    if (!isAdmin) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadStats();
    loadSupportRequests();
    loadReports();
    loadUsers();
  }, [isAdmin]);

  async function markReportHandled(id, status) {
    const { error } = await supabase.from('reports').update({ status }).eq('id', id);
    if (error) {
      addToast('Fehler: ' + error.message, 'error');
      return;
    }
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    addToast(status === 'resolved' ? 'Als erledigt markiert ✓' : 'Status aktualisiert.', 'info');
  }

  async function markSupportRead(id) {
    const { error } = await supabase.from('support_requests').update({ read: true }).eq('id', id);
    if (error) {
      addToast('Fehler: ' + error.message, 'error');
      return;
    }
    setSupportRequests((prev) => prev.map((r) => (r.id === id ? { ...r, read: true } : r)));
    if (onMarkSupportRead) onMarkSupportRead(id);
    addToast('Als gelesen markiert ✓', 'info');
  }

  async function toggleAdminUser(userId, currentVal) {
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: !currentVal })
      .eq('id', userId);
    if (error) {
      addToast('Fehler: ' + error.message, 'error');
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_admin: !currentVal } : u)));
    addToast(!currentVal ? 'Admin-Rechte vergeben ✓' : 'Admin-Rechte entzogen.', 'info');
  }

  async function handleBanUser(userId, currentBanned) {
    setBanningId(userId);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_banned: !currentBanned } : u))
    );
    if (onBanUser) await onBanUser(userId, !currentBanned);
    setBanningId(null);
  }

  async function handleDeleteListing(id) {
    setDeletingId(id);
    if (onDeleteListing) await onDeleteListing(id);
    setDeletingId(null);
  }

  // Secondary guard after all hooks — prevents rendering admin UI for non-admins
  if (!isAdmin) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: C.muted }}>Keine Berechtigung.</p>
      </div>
    );
  }

  const filteredListings = listings.filter((l) => {
    if (!listingSearch.trim()) return true;
    const q = listingSearch.toLowerCase();
    return (
      l.title?.toLowerCase().includes(q) ||
      l.ownerName?.toLowerCase().includes(q) ||
      l.category?.toLowerCase().includes(q)
    );
  });

  const fmtDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const navBtnStyle = (section) => ({
    padding: '0.6rem 1.1rem',
    borderRadius: 10,
    border: 'none',
    background: activeSection === section ? C.forest : 'transparent',
    color: activeSection === section ? 'white' : C.muted,
    fontWeight: activeSection === section ? 700 : 500,
    cursor: 'pointer',
    fontSize: '0.88rem',
    transition: 'all 0.15s ease',
  });

  if (!currentUser) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: C.cream,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <div style={{ textAlign: 'center', color: C.muted }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
          <h2 style={{ color: C.forest }}>Kein Zugriff</h2>
          <p>Bitte melde dich an.</p>
          <button
            onClick={() => goTo('login')}
            style={{
              marginTop: '1rem',
              padding: '0.8rem 1.5rem',
              borderRadius: 12,
              border: 'none',
              background: C.forest,
              color: 'white',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Zum Login
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: C.cream,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <div style={{ textAlign: 'center', color: C.muted }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</div>
          <h2 style={{ color: C.terra }}>Kein Zugriff</h2>
          <p style={{ marginBottom: '1.5rem' }}>Du hast keine Admin-Berechtigung.</p>
          <button
            onClick={() => goTo('home')}
            style={{
              padding: '0.8rem 1.5rem',
              borderRadius: 12,
              border: 'none',
              background: C.forest,
              color: 'white',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Zurück zur Startseite
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: C.cream }}>
      {/* Header */}
      <div
        style={{
          background: C.forest,
          padding: '2rem 1.5rem 1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span
                  style={{
                    fontFamily: 'Georgia, serif',
                    fontStyle: 'italic',
                    fontSize: '1.6rem',
                    fontWeight: 900,
                    color: 'white',
                    letterSpacing: '-0.03em',
                  }}
                >
                  ria
                </span>
                <span
                  style={{
                    background: 'rgba(255,255,255,0.12)',
                    color: 'rgba(255,255,255,0.8)',
                    padding: '0.2rem 0.65rem',
                    borderRadius: 999,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  Admin
                </span>
              </div>
              <p
                style={{
                  color: 'rgba(255,255,255,0.5)',
                  margin: '0.25rem 0 0',
                  fontSize: '0.82rem',
                }}
              >
                Willkommen, {currentUser.name}
              </p>
            </div>
            <button
              onClick={() => goTo('home')}
              style={{
                padding: '0.6rem 1.1rem',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'transparent',
                color: 'rgba(255,255,255,0.7)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              ← Zurück zur App
            </button>
          </div>

          {/* Section nav */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {[
              ['stats', 'Übersicht'],
              ['support', `Support (${supportRequests.filter((r) => !r.read).length} neu)`],
              ['reports', `Meldungen (${reports.filter((r) => r.status === 'open').length} offen)`],
              ['listings', `Inserate (${listings.length})`],
              ['users', `Nutzer (${users.length})`],
              ['analyse', 'Analyse'],
            ].map(([key, label]) => (
              <button key={key} onClick={() => { setActiveSection(key); if (key === 'analyse' && !analyticsData) loadAnalytics(); }} style={navBtnStyle(key)}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        {/* Stats */}
        {activeSection === 'stats' && (
          <div>
            <h2
              style={{
                color: C.forest,
                margin: '0 0 1.5rem',
                fontSize: '1.5rem',
                letterSpacing: '-0.02em',
              }}
            >
              Dashboard-Übersicht
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem',
              }}
            >
              <StatCard label="Inserate" value={stats.listings} color={C.forest} />
              <StatCard label="Nutzer" value={stats.users} color="#7A9E7E" />
              <StatCard label="Nachrichten" value={stats.messages} color={C.terra} />
              <StatCard label="Support-Anfragen" value={stats.support} color="#C8A96B" />
              <StatCard label="Transaktionen" value={stats.transactions} color={C.terra} />
            </div>
            <p style={{ color: C.muted, fontSize: '0.85rem' }}>
              Wähle oben einen Bereich aus, um Details zu sehen.
            </p>
          </div>
        )}

        {/* Support requests */}
        {activeSection === 'support' && (
          <div>
            <h2
              style={{
                color: C.forest,
                margin: '0 0 1.5rem',
                fontSize: '1.5rem',
                letterSpacing: '-0.02em',
              }}
            >
              Support-Anfragen
            </h2>
            {loadingSupport ? (
              <div style={{ color: C.muted, padding: '2rem 0', textAlign: 'center' }}>
                Wird geladen…
              </div>
            ) : supportRequests.length === 0 ? (
              <div
                style={{
                  background: 'white',
                  borderRadius: 16,
                  padding: '2.5rem',
                  textAlign: 'center',
                  color: C.muted,
                  border: `1px solid ${C.line}`,
                }}
              >
                Keine Support-Anfragen vorhanden.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {supportRequests.map((req) => (
                  <div
                    key={req.id}
                    style={{
                      background: 'white',
                      borderRadius: 18,
                      border: `1px solid ${req.read ? C.line : C.sage}`,
                      boxShadow: '0 4px 16px rgba(28,58,46,0.06)',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ padding: '1.25rem 1.5rem' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: '1rem',
                          flexWrap: 'wrap',
                          marginBottom: '0.6rem',
                        }}
                      >
                        <div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.6rem',
                              flexWrap: 'wrap',
                              marginBottom: '0.2rem',
                            }}
                          >
                            <span style={{ fontWeight: 700, color: C.forest, fontSize: '0.95rem' }}>
                              {req.name}
                            </span>
                            <span style={{ color: C.muted, fontSize: '0.82rem' }}>{req.email}</span>
                            {!req.read && (
                              <span
                                style={{
                                  background: C.sage,
                                  color: 'white',
                                  padding: '0.12rem 0.5rem',
                                  borderRadius: 999,
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                }}
                              >
                                NEU
                              </span>
                            )}
                          </div>
                          {req.subject && (
                            <div
                              style={{
                                fontWeight: 600,
                                color: C.ink,
                                fontSize: '0.9rem',
                                marginBottom: '0.15rem',
                              }}
                            >
                              {req.subject}
                            </div>
                          )}
                          <div style={{ fontSize: '0.75rem', color: C.muted }}>
                            {fmtDate(req.created_at)}
                          </div>
                        </div>
                        {!req.read && (
                          <button
                            onClick={() => markSupportRead(req.id)}
                            style={{
                              padding: '0.5rem 0.9rem',
                              borderRadius: 10,
                              border: `1px solid ${C.line}`,
                              background: 'white',
                              color: C.forest,
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              flexShrink: 0,
                            }}
                          >
                            Als gelesen markieren
                          </button>
                        )}
                      </div>
                      <div>
                        <p
                          style={{ margin: 0, color: C.ink, fontSize: '0.88rem', lineHeight: 1.65 }}
                        >
                          {expandedSupport === req.id
                            ? req.message
                            : req.message?.slice(0, 180) + (req.message?.length > 180 ? '…' : '')}
                        </p>
                        {req.message?.length > 180 && (
                          <button
                            onClick={() =>
                              setExpandedSupport(expandedSupport === req.id ? null : req.id)
                            }
                            style={{
                              background: 'none',
                              border: 'none',
                              color: C.sage,
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontSize: '0.82rem',
                              marginTop: '0.4rem',
                              padding: 0,
                            }}
                          >
                            {expandedSupport === req.id ? 'Weniger anzeigen ▲' : 'Mehr anzeigen ▼'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reports */}
        {activeSection === 'reports' && (
          <div>
            <h2
              style={{
                color: C.forest,
                margin: '0 0 1.5rem',
                fontSize: '1.5rem',
                letterSpacing: '-0.02em',
              }}
            >
              Meldungen
            </h2>
            {loadingReports ? (
              <div style={{ color: C.muted, padding: '2rem 0', textAlign: 'center' }}>
                Wird geladen…
              </div>
            ) : reports.length === 0 ? (
              <div
                style={{
                  background: 'white',
                  borderRadius: 16,
                  padding: '2.5rem',
                  textAlign: 'center',
                  color: C.muted,
                  border: `1px solid ${C.line}`,
                }}
              >
                Keine Meldungen vorhanden.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {reports.map((rep) => (
                  <div
                    key={rep.id}
                    style={{
                      background: 'white',
                      borderRadius: 18,
                      border: `1px solid ${rep.status === 'open' ? C.terra : C.line}`,
                      boxShadow: '0 4px 16px rgba(28,58,46,0.06)',
                      overflow: 'hidden',
                      opacity: rep.status === 'resolved' ? 0.65 : 1,
                    }}
                  >
                    <div style={{ padding: '1.25rem 1.5rem' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: '1rem',
                          flexWrap: 'wrap',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              flexWrap: 'wrap',
                              marginBottom: '0.25rem',
                            }}
                          >
                            {rep.status === 'open' && (
                              <span
                                style={{
                                  background: C.terra,
                                  color: 'white',
                                  padding: '0.12rem 0.5rem',
                                  borderRadius: 999,
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                }}
                              >
                                OFFEN
                              </span>
                            )}
                            {rep.status === 'reviewed' && (
                              <span
                                style={{
                                  background: '#C8A96B',
                                  color: 'white',
                                  padding: '0.12rem 0.5rem',
                                  borderRadius: 999,
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                }}
                              >
                                GEPRÜFT
                              </span>
                            )}
                            {rep.status === 'resolved' && (
                              <span
                                style={{
                                  background: C.sage,
                                  color: 'white',
                                  padding: '0.12rem 0.5rem',
                                  borderRadius: 999,
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                }}
                              >
                                ERLEDIGT
                              </span>
                            )}
                            <span
                              style={{
                                background: 'rgba(196,113,74,0.1)',
                                color: C.terra,
                                padding: '0.12rem 0.6rem',
                                borderRadius: 999,
                                fontSize: '0.75rem',
                                fontWeight: 700,
                              }}
                            >
                              {rep.reason}
                            </span>
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              gap: '0.75rem',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                            }}
                          >
                            <span style={{ fontWeight: 700, color: C.forest, fontSize: '0.9rem' }}>
                              Gemeldet:{' '}
                              <span style={{ color: C.terra }}>
                                {rep.reported_user_name || 'Unbekannt'}
                              </span>
                            </span>
                            {rep.listing_title && (
                              <span style={{ color: C.muted, fontSize: '0.82rem' }}>
                                · {rep.listing_title}
                              </span>
                            )}
                          </div>
                          <div
                            style={{ color: C.muted, fontSize: '0.75rem', marginTop: '0.15rem' }}
                          >
                            Gemeldet von: {rep.reporter_name} · {fmtDate(rep.created_at)}
                          </div>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            gap: '0.5rem',
                            flexWrap: 'wrap',
                            flexShrink: 0,
                          }}
                        >
                          {rep.status === 'open' && (
                            <button
                              onClick={() => markReportHandled(rep.id, 'reviewed')}
                              style={{
                                padding: '0.45rem 0.85rem',
                                borderRadius: 10,
                                border: `1px solid ${C.line}`,
                                background: 'white',
                                color: C.forest,
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontSize: '0.78rem',
                              }}
                            >
                              Geprüft
                            </button>
                          )}
                          {rep.status !== 'resolved' && (
                            <button
                              onClick={() => markReportHandled(rep.id, 'resolved')}
                              style={{
                                padding: '0.45rem 0.85rem',
                                borderRadius: 10,
                                border: 'none',
                                background: C.sageLight,
                                color: C.forest,
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontSize: '0.78rem',
                              }}
                            >
                              Erledigt ✓
                            </button>
                          )}
                          {rep.reported_user_id && (
                            <button
                              onClick={() => {
                                const u = users.find((u) => u.id === rep.reported_user_id);
                                handleBanUser(rep.reported_user_id, !!u?.is_banned);
                              }}
                              style={{
                                padding: '0.45rem 0.85rem',
                                borderRadius: 10,
                                border: `1px solid rgba(196,113,74,0.35)`,
                                background: 'rgba(196,113,74,0.08)',
                                color: C.terra,
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontSize: '0.78rem',
                              }}
                            >
                              {users.find((u) => u.id === rep.reported_user_id)?.is_banned
                                ? 'Entsperren'
                                : 'Sperren'}
                            </button>
                          )}
                        </div>
                      </div>
                      {rep.message && (
                        <div>
                          <p
                            style={{
                              margin: 0,
                              color: C.ink,
                              fontSize: '0.88rem',
                              lineHeight: 1.65,
                            }}
                          >
                            {expandedReport === rep.id
                              ? rep.message
                              : rep.message.slice(0, 180) + (rep.message.length > 180 ? '…' : '')}
                          </p>
                          {rep.message.length > 180 && (
                            <button
                              onClick={() =>
                                setExpandedReport(expandedReport === rep.id ? null : rep.id)
                              }
                              style={{
                                background: 'none',
                                border: 'none',
                                color: C.sage,
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontSize: '0.82rem',
                                marginTop: '0.4rem',
                                padding: 0,
                              }}
                            >
                              {expandedReport === rep.id ? 'Weniger ▲' : 'Mehr anzeigen ▼'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Listings management */}
        {activeSection === 'listings' && (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <h2
                style={{ color: C.forest, margin: 0, fontSize: '1.5rem', letterSpacing: '-0.02em' }}
              >
                Inserate verwalten
              </h2>
              <input
                type="text"
                placeholder="Suche nach Titel, Besitzer, Kategorie…"
                value={listingSearch}
                onChange={(e) => setListingSearch(e.target.value)}
                style={{
                  padding: '0.7rem 1rem',
                  borderRadius: 12,
                  border: `1px solid ${C.line}`,
                  fontSize: '0.9rem',
                  background: 'white',
                  color: C.ink,
                  outline: 'none',
                  minWidth: 260,
                }}
              />
            </div>
            {filteredListings.length === 0 ? (
              <div
                style={{
                  background: 'white',
                  borderRadius: 16,
                  padding: '2.5rem',
                  textAlign: 'center',
                  color: C.muted,
                  border: `1px solid ${C.line}`,
                }}
              >
                Keine Inserate gefunden.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {filteredListings.map((listing) => (
                  <div
                    key={listing.id}
                    style={{
                      background: 'white',
                      borderRadius: 16,
                      border: `1px solid ${C.line}`,
                      boxShadow: '0 2px 10px rgba(28,58,46,0.04)',
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    {listing.image && (
                      <img
                        src={listing.image}
                        alt=""
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 10,
                          objectFit: 'cover',
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          color: C.forest,
                          fontSize: '0.95rem',
                          marginBottom: '0.15rem',
                        }}
                      >
                        {listing.title}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span
                          style={{
                            background: C.sageLight,
                            color: C.forest,
                            padding: '0.15rem 0.55rem',
                            borderRadius: 999,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                          }}
                        >
                          {listing.category}
                        </span>
                        <span style={{ color: C.muted, fontSize: '0.78rem' }}>
                          {listing.ownerName}
                        </span>
                        <span style={{ color: C.muted, fontSize: '0.78rem' }}>
                          {fmtDate(listing.createdAt)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteListing(listing.id)}
                      disabled={deletingId === listing.id || listing.userId === 'demo'}
                      style={{
                        padding: '0.55rem 1rem',
                        borderRadius: 10,
                        border: `1px solid rgba(196,113,74,0.3)`,
                        background: 'rgba(196,113,74,0.07)',
                        color: listing.userId === 'demo' ? C.muted : C.terra,
                        fontWeight: 700,
                        cursor: listing.userId === 'demo' ? 'not-allowed' : 'pointer',
                        fontSize: '0.82rem',
                        opacity: deletingId === listing.id ? 0.6 : 1,
                        flexShrink: 0,
                      }}
                      title={
                        listing.userId === 'demo'
                          ? 'Demo-Inserate können nicht gelöscht werden'
                          : 'Inserat löschen'
                      }
                    >
                      {deletingId === listing.id ? 'Löscht…' : 'Löschen'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users management */}
        {activeSection === 'users' && (
          <div>
            <h2 style={{ color: C.forest, margin: '0 0 1.5rem', fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
              Nutzer ({users.length})
            </h2>
            {loadingUsers ? (
              <div style={{ color: C.muted, padding: '2rem 0', textAlign: 'center' }}>Wird geladen…</div>
            ) : users.length === 0 ? (
              <div style={{ background: 'white', borderRadius: 16, padding: '2.5rem', textAlign: 'center', color: C.muted, border: `1px solid ${C.line}` }}>
                Keine Nutzer gefunden.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {users.map((user) => {
                  const userListings = listings.filter((l) => l.userId === user.id);
                  return (
                    <div
                      key={user.id}
                      style={{ background: 'white', borderRadius: 16, border: `1px solid ${C.line}`, boxShadow: '0 2px 10px rgba(28,58,46,0.04)', padding: '1rem 1.25rem' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        {/* Avatar */}
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #163126, #1C3A2E)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0, overflow: 'hidden' }}>
                          {user.avatar_url
                            ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : (user.name || '?').charAt(0).toUpperCase()
                          }
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 160 }}>
                          <div style={{ fontWeight: 700, color: C.forest, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                            {user.name || '(kein Name)'}
                            {user.is_admin && (
                              <span style={{ background: C.forest, color: 'white', padding: '0.1rem 0.45rem', borderRadius: 999, fontSize: '0.62rem', fontWeight: 800 }}>ADMIN</span>
                            )}
                            {user.is_banned && (
                              <span style={{ background: C.terra, color: 'white', padding: '0.1rem 0.45rem', borderRadius: 999, fontSize: '0.62rem', fontWeight: 800 }}>GESPERRT</span>
                            )}
                          </div>
                          <div style={{ color: C.muted, fontSize: '0.78rem', marginTop: '0.1rem' }}>
                            {userListings.length} Inserat{userListings.length !== 1 ? 'e' : ''}
                            {user.location && ` · ${user.location}`}
                          </div>
                        </div>

                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, flexWrap: 'wrap' }}>
                          {/* Profil ansehen */}
                          <button
                            onClick={() => { if (onViewOwner) onViewOwner(user); }}
                            style={{ padding: '0.55rem 1rem', borderRadius: 10, border: `1px solid ${C.line}`, background: C.sageLight, color: C.forest, fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
                          >
                            Profil ansehen
                          </button>
                          {/* Admin toggle */}
                          <button
                            onClick={() => toggleAdminUser(user.id, !!user.is_admin)}
                            disabled={user.id === currentUser?.id}
                            style={{ padding: '0.55rem 1rem', borderRadius: 10, border: `1px solid ${user.is_admin ? 'rgba(196,113,74,0.3)' : C.line}`, background: user.is_admin ? 'rgba(196,113,74,0.07)' : 'white', color: user.is_admin ? C.terra : C.muted, fontWeight: 700, cursor: user.id === currentUser?.id ? 'not-allowed' : 'pointer', fontSize: '0.8rem', opacity: user.id === currentUser?.id ? 0.4 : 1 }}
                          >
                            {user.is_admin ? 'Admin weg' : 'Admin'}
                          </button>
                          {/* Ban toggle */}
                          <button
                            onClick={() => handleBanUser(user.id, !!user.is_banned)}
                            disabled={user.id === currentUser?.id || banningId === user.id}
                            style={{ padding: '0.55rem 1rem', borderRadius: 10, border: `1px solid ${user.is_banned ? C.line : 'rgba(196,113,74,0.35)'}`, background: user.is_banned ? C.sageLight : 'rgba(196,113,74,0.08)', color: user.is_banned ? C.forest : C.terra, fontWeight: 700, cursor: user.id === currentUser?.id ? 'not-allowed' : 'pointer', fontSize: '0.8rem', opacity: user.id === currentUser?.id || banningId === user.id ? 0.4 : 1 }}
                          >
                            {banningId === user.id ? '…' : user.is_banned ? 'Entsperren' : 'Sperren'}
                          </button>
                        </div>
                      </div>

                      {/* Inserate des Nutzers */}
                      {userListings.length > 0 && (
                        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: `1px solid ${C.line}`, display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {userListings.map((l) => (
                            <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: C.cream, borderRadius: 10, padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                              <span style={{ color: C.forest, fontWeight: 600 }}>{l.title}</span>
                              <span style={{ color: C.muted }}>{l.price}</span>
                              <button
                                onClick={() => handleDeleteListing(l.id)}
                                disabled={deletingId === l.id}
                                style={{ background: 'none', border: 'none', color: C.terra, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, padding: '0 0.2rem' }}
                              >
                                {deletingId === l.id ? '…' : '✕'}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Analytics */}
        {activeSection === 'analyse' && (
          <div>
            <h2 style={{ color: C.forest, margin: '0 0 1.5rem', fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
              Wachstums-Analyse
            </h2>
            <p style={{ color: C.muted, fontSize: '0.85rem', marginBottom: '1.5rem' }}>Letzte 6 Monate</p>
            {loadingAnalytics ? (
              <div style={{ color: C.muted, padding: '2rem 0', textAlign: 'center' }}>Wird geladen…</div>
            ) : analyticsData ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
                <AnalyticsChart data={analyticsData.members} title="Neue Mitglieder" color={C.forest} />
                <AnalyticsChart data={analyticsData.listings} title="Neue Inserate" color={C.sage} />
                <AnalyticsChart data={analyticsData.transactions} title="Abgeschlossene Transaktionen" color={C.terra} />
              </div>
            ) : (
              <div style={{ color: C.muted, padding: '2rem 0', textAlign: 'center' }}>Klicke auf "Analyse" um die Daten zu laden.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
