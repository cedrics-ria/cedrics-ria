import { useEffect, useMemo, useRef, useState } from 'react';
import { C, ADMIN_EMAIL, STORAGE_KEYS } from './constants';
import { supabase } from './supabase';
import { useMessages } from './hooks/useMessages.js';
import { useBookings } from './hooks/useBookings.js';
import { useFavorites } from './hooks/useFavorites.js';
import { useSupportRequests } from './hooks/useSupportRequests.js';
import { mapMessageFromDb } from './lib/mappers.js';
import { urlBase64ToUint8Array } from './lib/vapid.js';

import TopBar from './components/TopBar';
import BottomNav from './components/BottomNav';
import Toaster from './components/Toaster';
import OnboardingModal from './components/OnboardingModal';
import AppRouter from './components/AppRouter';
import AppFooter from './components/AppFooter';

// ── Map raw DB row → app listing shape ─────────────────────────────────────
function mapListing(row) {
  return {
    id: row.id,
    title: row.title,
    price: row.price,
    location: row.location,
    image: row.image,
    category: row.category,
    description: row.description,
    userId: row.user_id,
    ownerName: row.owner_name || 'Ria Mitglied',
    images: row.images || [],
    rating: 0,
    reviews: 0,
    featured: false,
    status: 'aktiv',
    isAvailable: row.is_available !== false,
    createdAt: row.created_at,
    kaution: row.kaution || '',
    paymentMethods: row.payment_methods || [],
    plz: row.plz || '',
    views: row.views || 0,
  };
}

export default function App() {
  // ── Routing ──────────────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    window.history.replaceState({ page: 'home' }, '');
    function handlePop(e) { window.scrollTo({ top: 0, behavior: 'instant' }); setCurrentPage(e.state?.page || 'home'); }
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  function navigate(page) {
    window.scrollTo({ top: 0, behavior: 'instant' });
    window.history.pushState({ page }, '');
    setCurrentPage(page);
  }

  // ── Core state ───────────────────────────────────────────────────────────
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allReviews, setAllReviews] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [editListing, setEditListing] = useState(null);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [listingsInitCategory, setListingsInitCategory] = useState('');
  const [listingsInitSearch, setListingsInitSearch] = useState('');
  const [handledBookings, setHandledBookings] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.HANDLED_BOOKINGS) || '{}'); }
    catch { return {}; }
  });
  const [, setLastMessagesCheck] = useState(() => {
    try { return new Date(localStorage.getItem(STORAGE_KEYS.LAST_MSG_CHECK) || 0); }
    catch { return new Date(0); }
  });
  const [hiddenThreads, setHiddenThreads] = useState(new Set());

  const pendingListingIdRef = useRef(null);

  // ── Hooks ─────────────────────────────────────────────────────────────────
  const { messages, setMessages, loadMessages } = useMessages();
  const { bookings, setBookings, loadBookings } = useBookings();
  const { favorites, setFavorites, loadFavorites, toggleFavorite: toggleFavHook } = useFavorites();
  const { supportRequests, setSupportRequests, loadSupportRequests, markSupportRequestRead } =
    useSupportRequests();

  // ── Computed ──────────────────────────────────────────────────────────────
  const isAdmin = currentUser?.email === ADMIN_EMAIL || profile?.is_admin === true;

  const unreadCount = useMemo(() => {
    if (!currentUser) return 0;
    return messages.filter(
      (m) => m.toUserId === currentUser.id && !m.read && !hiddenThreads.has(String(m.listingId))
    ).length;
  }, [messages, currentUser, hiddenThreads]);

  const unreadSupportCount = useMemo(
    () => supportRequests.filter((r) => !r.read).length,
    [supportRequests]
  );

  const enrichedListings = useMemo(() => {
    const map = {};
    allReviews.forEach((r) => {
      if (!map[r.listing_id]) map[r.listing_id] = { sum: 0, count: 0 };
      map[r.listing_id].sum += r.rating;
      map[r.listing_id].count++;
    });
    return listings.map((l) => {
      const key = String(l.id);
      if (!map[key]) return { ...l, rating: 0, reviews: 0 };
      return { ...l, rating: map[key].sum / map[key].count, reviews: map[key].count };
    });
  }, [listings, allReviews]);

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [messages]
  );

  // ── Toast helper ─────────────────────────────────────────────────────────
  function addToast(text, type = 'info') {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }

  function markMessagesRead() {
    const now = new Date();
    setLastMessagesCheck(now);
    localStorage.setItem(STORAGE_KEYS.LAST_MSG_CHECK, now.toISOString());
  }

  // ── Auth + initial load ──────────────────────────────────────────────────
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (savedUser) setCurrentUser(JSON.parse(savedUser));

    async function init() {
      const params = new URLSearchParams(window.location.search);
      const inseratId = params.get('inserat');
      if (inseratId) pendingListingIdRef.current = inseratId;

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const u = buildSessionUser(session.user);
        setCurrentUser(u);
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(u));
        loadMessages(u.id);
        loadProfile(u.id);
        loadFavorites(u.id);
        loadBookings(u.id);
        if (u.email === ADMIN_EMAIL) loadSupportRequests();
      }
      await loadListings();
      loadAllReviews();
    }

    void init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((authEvent, session) => {
      if (authEvent === 'PASSWORD_RECOVERY') { setCurrentPage('reset-password'); return; }
      if (session?.user) {
        const u = buildSessionUser(session.user);
        setCurrentUser(u);
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(u));
        loadMessages(u.id);
        loadProfile(u.id);
        loadFavorites(u.id);
        loadBookings(u.id);
        if (u.email === ADMIN_EMAIL) loadSupportRequests();
        try {
          setHiddenThreads(new Set(JSON.parse(localStorage.getItem(STORAGE_KEYS.hiddenThreads(u.id)) || '[]')));
        } catch { setHiddenThreads(new Set()); }
      } else {
        setCurrentUser(null);
        setMessages([]);
        setFavorites([]);
        setProfile(null);
        setBookings([]);
        setSupportRequests([]);
        setHiddenThreads(new Set());
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Push notifications ───────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    async function setupPush() {
      try {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;
        const reg = await navigator.serviceWorker.ready;
        if (await reg.pushManager.getSubscription()) return;
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: /** @type {any} */ (urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY)),
        });
        await supabase.from('push_subscriptions').upsert(
          { user_id: currentUser.id, subscription: sub.toJSON(), updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        );
      } catch (err) {
        if (import.meta.env.DEV) console.warn('[Push] Setup fehlgeschlagen:', err);
      }
    }
    setupPush();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  // ── Realtime: support requests (admin only) ──────────────────────────────
  useEffect(() => {
    if (!isAdmin) return;
    const ch = supabase
      .channel('support-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_requests' }, (p) => {
        setSupportRequests((prev) =>
          prev.find((r) => r.id === p.new.id) ? prev : [p.new, ...prev]
        );
        addToast(`Neue Support-Anfrage von ${p.new.name}`, 'info');
      })
      .subscribe();
    return () => supabase.removeChannel(ch);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  // ── Realtime: messages ───────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser?.id) return;
    const userId = currentUser.id;
    const channel = supabase
      .channel('messages:' + userId)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `to_user_id=eq.${userId}` }, (payload) => {
        const msg = mapMessageFromDb(payload.new);
        setMessages((prev) => (prev.find((m) => m.id === msg.id) ? prev : [msg, ...prev]));
        addToast('Neue Nachricht', 'info');
        if (Notification?.permission === 'granted') {
          try { new Notification('ria – Neue Nachricht', { body: msg.text.slice(0, 80), icon: '/favicon.ico' }); }
          catch { /* ignore notification errors */ }
        }
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  // ── Data loaders ─────────────────────────────────────────────────────────
  function buildSessionUser(user) {
    return {
      id: user.id,
      name: user.user_metadata?.name || 'User',
      email: user.email,
      emailConfirmed: !!user.email_confirmed_at,
    };
  }

  async function loadListings() {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      addToast('Inserate konnten nicht geladen werden.', 'error');
      setLoading(false);
      return;
    }
    setListings((data || []).map(mapListing));
    setLoading(false);
    if (pendingListingIdRef.current) {
      const target = (data || []).map(mapListing).find(l => String(l.id) === pendingListingIdRef.current);
      pendingListingIdRef.current = null;
      if (target) {
        setSelectedListing(target);
        window.history.replaceState({ page: 'listing-detail' }, '');
        setCurrentPage('listing-detail');
      }
    }
  }

  async function loadAllReviews() {
    const { data, error } = await supabase.from('reviews').select('listing_id, rating');
    if (error) {
      if (import.meta.env.DEV) console.warn('[Reviews] Laden fehlgeschlagen:', error.message);
      return;
    }
    if (data) setAllReviews(data);
  }

  async function loadProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
  }

  function handleReviewAdded(listingId, rating) {
    setAllReviews((prev) => [...prev, { listing_id: String(listingId), rating }]);
  }

  // ── Listing actions ───────────────────────────────────────────────────────
  async function addListing(newListing) {
    const payload = {
      title: newListing.title, price: newListing.price, location: newListing.location,
      image: newListing.image, images: newListing.images || [], category: newListing.category,
      description: newListing.description, user_id: newListing.userId,
      owner_name: newListing.ownerName || currentUser?.name || 'Ria Mitglied',
      is_available: true, kaution: newListing.kaution || null,
      payment_methods: newListing.paymentMethods || [], plz: newListing.plz || null,
    };
    const { data, error } = await supabase.from('listings').insert(payload).select().single();
    if (error) { console.error('[addListing]', error); addToast('Inserat konnte nicht gespeichert werden. Bitte versuche es erneut.', 'error'); return false; }
    const inserted = mapListing(data);
    setListings((prev) => [inserted, ...prev]);
    setSelectedListing(inserted);
    return true;
  }

  async function updateListing(id, updates) {
    if (!currentUser) { addToast('Nicht angemeldet.', 'error'); return false; }
    const payload = {
      title: updates.title, price: updates.price, location: updates.location,
      image: updates.image, category: updates.category, description: updates.description,
      kaution: updates.kaution || null, payment_methods: updates.paymentMethods || [],
      plz: updates.plz || null,
    };
    // Admins can edit any listing; regular users only their own (enforced in DB query)
    let query = supabase.from('listings').update(payload).eq('id', id);
    if (!isAdmin) query = query.eq('user_id', currentUser.id);
    const { error } = await query.select().single();
    if (error) { console.error('[updateListing]', error); addToast('Änderungen konnten nicht gespeichert werden. Bitte versuche es erneut.', 'error'); return false; }
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
    addToast('Inserat gespeichert.', 'info');
    return true;
  }

  async function deleteListing(id) {
    if (!currentUser) return;
    // Admins can delete any listing; regular users only their own (enforced in DB query)
    let query = supabase.from('listings').delete().eq('id', id);
    if (!isAdmin) query = query.eq('user_id', currentUser.id);
    const { error } = await query;
    if (error) { console.error('[deleteListing]', error); addToast('Fehler beim Löschen.', 'error'); return; }
    setListings((prev) => prev.filter((l) => l.id !== id));
    addToast('Inserat gelöscht.', 'info');
  }

  async function toggleAvailability(id, isAvailable) {
    const { error } = await supabase.from('listings').update({ is_available: isAvailable }).eq('id', id);
    if (error) { console.error('[toggleAvailability]', error); addToast('Verfügbarkeit konnte nicht geändert werden.', 'error'); return; }
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, isAvailable } : l)));
    addToast(isAvailable ? 'Inserat wieder verfügbar ✓' : 'Als vergeben markiert.', 'info');
  }

  // ── User actions ──────────────────────────────────────────────────────────
  async function toggleFavorite(id) {
    const strId = String(id);
    if (!currentUser) {
      setFavorites((prev) => {
        const next = prev.includes(strId) ? prev.filter((f) => f !== strId) : [...prev, strId];
        localStorage.setItem('ria-favorites', JSON.stringify(next));
        return next;
      });
      return;
    }
    await toggleFavHook(currentUser.id, strId);
  }

  async function updateProfile(updates) {
    // Whitelist: only allow safe user-controlled fields, never is_admin / is_banned
    const safeUpdates = {
      ...(updates.name      !== undefined && { name:       String(updates.name).trim().slice(0, 100) }),
      ...(updates.phone     !== undefined && { phone:      String(updates.phone).trim().slice(0, 30) }),
      ...(updates.bio       !== undefined && { bio:        String(updates.bio).trim().slice(0, 500) }),
      ...(updates.avatar_url !== undefined && { avatar_url: String(updates.avatar_url).slice(0, 500) }),
    };
    const { error } = await supabase.from('profiles').upsert({
      id: currentUser.id, name: currentUser.name, ...safeUpdates, updated_at: new Date().toISOString(),
    });
    if (error) { console.error('[updateProfile]', error); addToast('Profil konnte nicht gespeichert werden. Bitte versuche es erneut.', 'error'); return; }
    setProfile((prev) => ({ ...prev, ...safeUpdates }));
    addToast('Profil gespeichert.', 'info');
  }

  async function banUser(userId, banned) {
    if (!isAdmin) { addToast('Keine Berechtigung.', 'error'); return; }
    const { error } = await supabase.from('profiles').update({ is_banned: banned }).eq('id', userId);
    if (error) { console.error('[banUser]', error); addToast('Aktion konnte nicht durchgeführt werden.', 'error'); return; }
    addToast(banned ? 'Nutzer gesperrt.' : 'Sperre aufgehoben.', 'info');
  }

  // ── Message / booking actions ─────────────────────────────────────────────
  async function saveMessage(newMessage) {
    if (!currentUser) return false;
    if (newMessage.toUserId === currentUser.id) return false; // can't message yourself
    const { data, error } = await supabase.from('messages').insert({
      listing_id: newMessage.listingId, listing_title: newMessage.listingTitle,
      from_user_id: currentUser.id, from_name: currentUser.name, from_email: currentUser.email,
      to_user_id: newMessage.toUserId, text: newMessage.text,
    }).select().single();
    if (error) { console.error('[saveMessage]', error); addToast('Nachricht konnte nicht gesendet werden. Bitte versuche es erneut.', 'error'); return false; }
    setMessages((prev) => [mapMessageFromDb(data), ...prev]);
    // Fire-and-forget email notification
    fetch('/api/send-message-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`,
      },
      body: JSON.stringify({
        record: {
          to_user_id: newMessage.toUserId,
          from_name: currentUser.name,
          text: newMessage.text,
          listing_title: newMessage.listingTitle,
        },
      }),
    }).catch(() => {});
    return true;
  }

  async function bookListing(listingId, listingTitle, ownerId, startDate, endDate) {
    if (!currentUser) return;
    const { error } = await supabase.from('bookings').insert({
      listing_id: String(listingId), listing_title: listingTitle,
      requester_id: currentUser.id, requester_name: currentUser.name,
      owner_id: ownerId, start_date: startDate, end_date: endDate, status: 'pending',
    });
    if (error) { console.error('[bookListing]', error); addToast('Buchungsanfrage konnte nicht gesendet werden. Bitte versuche es erneut.', 'error'); return; }
    const fmt = (d) => d.split('-').reverse().join('.');
    await saveMessage({
      listingId: String(listingId), listingTitle, toUserId: ownerId,
      text: `Buchungsanfrage: ${listingTitle}\n\nZeitraum: ${fmt(startDate)} – ${fmt(endDate)}\n\nHallo, ich würde gerne "${listingTitle}" für diesen Zeitraum buchen. Bitte gib mir Bescheid, ob das passt!`,
    });
    loadBookings(currentUser.id);
    addToast('Buchungsanfrage gesendet ✓', 'info');
  }

  async function acceptBookingRecord(bookingId) {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking || booking.owner_id !== currentUser?.id) { addToast('Keine Berechtigung.', 'error'); return; }
    const { error } = await supabase.from('bookings').update({ status: 'accepted' })
      .eq('id', bookingId).eq('owner_id', currentUser.id);
    if (error) { console.error('[acceptBookingRecord]', error); addToast('Buchung konnte nicht angenommen werden.', 'error'); return; }
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: 'accepted' } : b)));
    addToast('Buchung angenommen ✓', 'info');
  }

  async function declineBookingRecord(bookingId) {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking || booking.owner_id !== currentUser?.id) { addToast('Keine Berechtigung.', 'error'); return; }
    const { error } = await supabase.from('bookings').update({ status: 'declined' })
      .eq('id', bookingId).eq('owner_id', currentUser.id);
    if (error) { console.error('[declineBookingRecord]', error); addToast('Buchung konnte nicht abgelehnt werden.', 'error'); return; }
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: 'declined' } : b)));
    addToast('Buchung abgelehnt.', 'info');
  }

  async function acceptBooking(msg) {
    if (!currentUser) return;
    await saveMessage({ listingId: msg.listingId, listingTitle: msg.listingTitle, toUserId: msg.fromUserId, text: '✓ Buchungsanfrage angenommen! Melde dich gerne für Details zur Übergabe.' });
    const updated = { ...handledBookings, [msg.id]: 'accepted' };
    setHandledBookings(updated);
    localStorage.setItem(STORAGE_KEYS.HANDLED_BOOKINGS, JSON.stringify(updated));
    addToast('Buchung angenommen ✓', 'info');
  }

  async function declineBooking(msg) {
    if (!currentUser) return;
    await saveMessage({ listingId: msg.listingId, listingTitle: msg.listingTitle, toUserId: msg.fromUserId, text: 'Leider kann ich die Buchungsanfrage gerade nicht annehmen. Schau gerne nach anderen Inseraten auf ria!' });
    const updated = { ...handledBookings, [msg.id]: 'declined' };
    setHandledBookings(updated);
    localStorage.setItem(STORAGE_KEYS.HANDLED_BOOKINGS, JSON.stringify(updated));
    addToast('Buchung abgelehnt.', 'info');
  }

  // ── Navigation helpers ────────────────────────────────────────────────────
  function openListingDetails(listing) { setSelectedListing(listing); navigate('listing-detail'); }
  function goToListingsWithFilter(category) { setListingsInitCategory(category); setListingsInitSearch(''); navigate('listings'); }
  function goToListingsWithSearch(search) { setListingsInitSearch(search); setListingsInitCategory(''); navigate('listings'); }

  function startMessageForListing(listing) {
    if (!currentUser) { setSelectedListing(listing); navigate('login'); return; }
    if (listing.userId === currentUser.id) { addToast('Das ist dein eigenes Inserat.', 'info'); return; }
    setSelectedListing(listing);
    navigate('message-composer');
  }

  function handleLogin(user, isNew = false) {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    loadMessages(user.id); loadProfile(user.id); loadFavorites(user.id); loadBookings(user.id);
    if (user.email === ADMIN_EMAIL) loadSupportRequests();
    if (isNew) setShowOnboarding(true);
    setCurrentPage('home');
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setCurrentUser(null); setProfile(null); setFavorites([]); setMessages([]);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    setCurrentPage('home');
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ overflowX: 'hidden' }}>
      <a href="#main-content" className="skip-link">Zum Hauptinhalt springen</a>
      <TopBar
        currentPage={currentPage}
        goTo={navigate}
        currentUser={currentUser}
        profile={profile}
        onLogout={handleLogout}
        unreadCount={unreadCount}
        onOpenMessages={() => { markMessagesRead(); navigate('messages'); }}
        unreadSupportCount={unreadSupportCount}
      />
      <main id="main-content" className="ria-page-pad">
        <AppRouter
          currentPage={currentPage}
          navigate={navigate}
          setCurrentPage={setCurrentPage}
          currentUser={currentUser}
          profile={profile}
          enrichedListings={enrichedListings}
          loading={loading}
          selectedListing={selectedListing}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          messages={sortedMessages}
          setMessages={setMessages}
          hiddenThreads={hiddenThreads}
          setHiddenThreads={setHiddenThreads}
          bookings={bookings}
          supportRequests={supportRequests}
          handledBookings={handledBookings}
          editListing={editListing}
          selectedOwner={selectedOwner}
          listingsInitCategory={listingsInitCategory}
          listingsInitSearch={listingsInitSearch}
          addToast={addToast}
          onLogin={handleLogin}
          onSelectListing={openListingDetails}
          onStartMessage={startMessageForListing}
          onAddListing={addListing}
          onUpdateListing={updateListing}
          onDeleteListing={deleteListing}
          onToggleAvailability={toggleAvailability}
          onBook={bookListing}
          onSendMessage={saveMessage}
          onMarkMessagesRead={markMessagesRead}
          onReviewAdded={handleReviewAdded}
          onAcceptBooking={acceptBooking}
          onDeclineBooking={declineBooking}
          onAcceptBookingRecord={acceptBookingRecord}
          onDeclineBookingRecord={declineBookingRecord}
          onUpdateProfile={updateProfile}
          onEditListing={(item) => { setEditListing(item); navigate('edit-listing'); }}
          onViewOwner={(owner) => { setSelectedOwner(owner); navigate('owner-profile'); }}
          onMarkSupportRead={markSupportRequestRead}
          onBanUser={banUser}
          onCategoryClick={goToListingsWithFilter}
          onSearch={goToListingsWithSearch}
        />
      </main>
      <BottomNav
        currentPage={currentPage}
        goTo={navigate}
        currentUser={currentUser}
        unreadCount={unreadCount}
        onOpenMessages={() => { markMessagesRead(); navigate('messages'); }}
      />
      <Toaster toasts={toasts} />
      {showOnboarding && (
        <OnboardingModal user={currentUser} onClose={() => setShowOnboarding(false)} goTo={setCurrentPage} />
      )}
      <AppFooter navigate={navigate} currentUser={currentUser} profile={profile} isAdmin={isAdmin} />
    </div>
  );
}
