import { useEffect, useMemo, useState, useCallback } from 'react';
import { ADMIN_EMAIL, STORAGE_KEYS } from './constants';
import { supabase } from './supabase';
import { useMessages } from './hooks/useMessages.js';
import { useBookings } from './hooks/useBookings.js';
import { useFavorites } from './hooks/useFavorites.js';
import { useSupportRequests } from './hooks/useSupportRequests.js';
import { useAuthSync } from './hooks/useAuthSync.js';
import { useListingActions } from './hooks/useListingActions.js';
import { useMessageBookingActions } from './hooks/useMessageBookingActions.js';
import { mapMessageFromDb } from './lib/mappers.js';
import { urlBase64ToUint8Array } from './lib/vapid.js';

import TopBar from './components/TopBar';
import BottomNav from './components/BottomNav';
import Toaster from './components/Toaster';
import OnboardingModal from './components/OnboardingModal';
import AppRouter from './components/AppRouter';
import AppFooter from './components/AppFooter';

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

  // ── UI state ─────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [editListing, setEditListing] = useState(null);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [listingsInitCategory, setListingsInitCategory] = useState('');
  const [listingsInitSearch, setListingsInitSearch] = useState('');
  const [, setLastMessagesCheck] = useState(() => {
    try { return new Date(localStorage.getItem(STORAGE_KEYS.LAST_MSG_CHECK) || 0); }
    catch { return new Date(0); }
  });

  // ── Toast helper ─────────────────────────────────────────────────────────
  const addToast = useCallback((text, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  // ── Data hooks ────────────────────────────────────────────────────────────
  const { messages, setMessages, hasMoreMessages, loadMessages, loadMoreMessages } = useMessages();
  const { bookings, setBookings, loadBookings } = useBookings();
  const { favorites, setFavorites, loadFavorites, toggleFavorite: toggleFavHook } = useFavorites();
  const { supportRequests, setSupportRequests, loadSupportRequests, markSupportRequestRead } = useSupportRequests();

  // ── Auth ──────────────────────────────────────────────────────────────────
  const {
    currentUser, profile, setProfile,
    showOnboarding, setShowOnboarding,
    hiddenThreads, setHiddenThreads,
    handleLogin, handleLogout, isAdmin,
  } = useAuthSync({
    onUserReady: useCallback((user) => {
      loadMessages(user.id);
      loadFavorites(user.id);
      loadBookings(user.id);
      if (user.email === ADMIN_EMAIL) loadSupportRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
    onUserGone: useCallback(() => {
      setMessages([]);
      setFavorites([]);
      setBookings([]);
      setSupportRequests([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
    setCurrentPage,
  });

  // ── Listing actions ───────────────────────────────────────────────────────
  const {
    listings, setListings, loading, enrichedListings,
    handleReviewAdded, addListing, updateListing, deleteListing, toggleAvailability,
  } = useListingActions({
    currentUser, isAdmin, addToast,
    onPendingListing: (listing) => {
      setSelectedListing(listing);
      window.history.replaceState({ page: 'listing-detail' }, '');
      setCurrentPage('listing-detail');
    },
  });

  // ── Message + booking actions ─────────────────────────────────────────────
  const {
    handledBookings, saveMessage, bookListing,
    acceptBooking, declineBooking,
    acceptBookingRecord, declineBookingRecord, confirmReturn,
  } = useMessageBookingActions({ currentUser, addToast, setMessages, bookings, setBookings, loadBookings });

  // ── Computed ──────────────────────────────────────────────────────────────
  const unreadCount = useMemo(() => {
    if (!currentUser) return 0;
    return messages.filter((m) => {
      if (m.toUserId !== currentUser.id || m.read) return false;
      const threadKey = `${String(m.listingId)}::${String(m.fromUserId)}`;
      return !hiddenThreads.has(threadKey);
    }).length;
  }, [messages, currentUser, hiddenThreads]);

  const unreadSupportCount = useMemo(
    () => supportRequests.filter((r) => !r.read).length,
    [supportRequests]
  );

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [messages]
  );

  function markMessagesRead() {
    const now = new Date();
    setLastMessagesCheck(now);
    localStorage.setItem(STORAGE_KEYS.LAST_MSG_CHECK, now.toISOString());
  }

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
  // currentUser?.id is the only reactive value here
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  // ── Realtime: support requests (admin only) ──────────────────────────────
  useEffect(() => {
    if (!isAdmin) return;
    const ch = supabase
      .channel('support-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_requests' }, (p) => {
        setSupportRequests((prev) => prev.find((r) => r.id === p.new.id) ? prev : [p.new, ...prev]);
        addToast(`Neue Support-Anfrage von ${p.new.name}`, 'info');
      })
      .subscribe((status, err) => { if (err) console.error('[Realtime] support-live:', err); });
    return () => supabase.removeChannel(ch);
  }, [isAdmin, addToast]);

  // ── Realtime: messages ───────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser?.id) return;
    const userId = currentUser.id;
    const channel = supabase
      .channel('messages:' + userId)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `to_user_id=eq.${userId}` }, (payload) => {
        const msg = mapMessageFromDb(payload.new);
        setMessages((prev) => prev.find((m) => m.id === msg.id) ? prev : [msg, ...prev]);
        addToast('Neue Nachricht', 'info');
        if (Notification?.permission === 'granted') {
          try { new Notification('ria – Neue Nachricht', { body: msg.text.slice(0, 80), icon: '/favicon.ico' }); }
          catch { /* ignore */ }
        }
      })
      .subscribe((status, err) => { if (err) console.error('[Realtime] messages:', err); });
    return () => supabase.removeChannel(channel);
  }, [currentUser?.id, addToast]);

  // ── User actions ──────────────────────────────────────────────────────────
  async function toggleFavorite(id) {
    const strId = String(id);
    if (!currentUser) {
      setFavorites((prev) => {
        const next = prev.includes(strId) ? prev.filter((f) => f !== strId) : [...prev, strId];
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(next));
        return next;
      });
      return;
    }
    await toggleFavHook(currentUser.id, strId);
  }

  async function updateProfile(updates) {
    const safeUpdates = {
      ...(updates.name      !== undefined && { name:       String(updates.name).trim().slice(0, 100) }),
      ...(updates.phone     !== undefined && { phone:      String(updates.phone).trim().slice(0, 30) }),
      ...(updates.bio       !== undefined && { bio:        String(updates.bio).trim().slice(0, 500) }),
      ...(updates.location  !== undefined && { location:   String(updates.location).trim().slice(0, 100) }),
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ overflowX: 'hidden' }}>
      <a href="#main-content" className="skip-link">Zum Hauptinhalt springen</a>
      <TopBar
        currentPage={currentPage} goTo={navigate} currentUser={currentUser} profile={profile}
        onLogout={handleLogout} unreadCount={unreadCount}
        onOpenMessages={() => { markMessagesRead(); navigate('messages'); }}
        unreadSupportCount={unreadSupportCount}
      />
      <main id="main-content" className="ria-page-pad">
        <AppRouter
          currentPage={currentPage} navigate={navigate} currentUser={currentUser} profile={profile}
          enrichedListings={enrichedListings} loading={loading} selectedListing={selectedListing}
          favorites={favorites} toggleFavorite={toggleFavorite}
          messages={sortedMessages} setMessages={setMessages}
          hiddenThreads={hiddenThreads} setHiddenThreads={setHiddenThreads}
          bookings={bookings} supportRequests={supportRequests} handledBookings={handledBookings}
          editListing={editListing} selectedOwner={selectedOwner}
          listingsInitCategory={listingsInitCategory} listingsInitSearch={listingsInitSearch}
          addToast={addToast} onLogin={handleLogin}
          hasMoreMessages={hasMoreMessages}
          onLoadMoreMessages={() => currentUser && loadMoreMessages(currentUser.id)}
          onSelectListing={openListingDetails} onStartMessage={startMessageForListing}
          onAddListing={async (l) => { const inserted = await addListing(l); if (inserted) setSelectedListing(inserted); return !!inserted; }}
          onUpdateListing={updateListing} onDeleteListing={deleteListing}
          onToggleAvailability={toggleAvailability} onBook={bookListing}
          onSendMessage={saveMessage} onMarkMessagesRead={markMessagesRead}
          onReviewAdded={handleReviewAdded}
          onAcceptBooking={acceptBooking} onDeclineBooking={declineBooking}
          onAcceptBookingRecord={acceptBookingRecord} onDeclineBookingRecord={declineBookingRecord}
          onConfirmReturn={confirmReturn} onUpdateProfile={updateProfile}
          onEditListing={(item) => { setEditListing(item); navigate('edit-listing'); }}
          onViewOwner={(owner) => { setSelectedOwner(owner); navigate('owner-profile'); }}
          onMarkSupportRead={markSupportRequestRead} onBanUser={banUser}
          onCategoryClick={goToListingsWithFilter} onSearch={goToListingsWithSearch}
          onLogout={handleLogout}
        />
      </main>
      <BottomNav
        currentPage={currentPage} goTo={navigate} currentUser={currentUser}
        unreadCount={unreadCount} onOpenMessages={() => { markMessagesRead(); navigate('messages'); }}
      />
      <Toaster toasts={toasts} />
      {showOnboarding && (
        <OnboardingModal user={currentUser} onClose={() => setShowOnboarding(false)} goTo={setCurrentPage} />
      )}
      <AppFooter navigate={navigate} currentUser={currentUser} profile={profile} isAdmin={isAdmin} />
    </div>
  );
}
