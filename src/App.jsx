import { useEffect, useMemo, useState } from 'react';
import { C, initialListings, categoryImages } from './constants';
import { supabase } from './supabase';

import TopBar from './components/TopBar';
import BottomNav from './components/BottomNav';
import Toaster from './components/Toaster';
import OnboardingModal from './components/OnboardingModal';
import Logo from './components/Logo';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ListingsPage from './pages/ListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import MessageComposerPage from './pages/MessageComposerPage';
import CreateListingPage from './pages/CreateListingPage';
import EditListingPage from './pages/EditListingPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import OwnerProfilePage from './pages/OwnerProfilePage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ImpressumPage from './pages/ImpressumPage';
import AGBPage from './pages/AGBPage';
import DatenschutzPage from './pages/DatenschutzPage';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(initialListings[0]);
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [profile, setProfile] = useState(null);
  const [editListing, setEditListing] = useState(null);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [handledBookings, setHandledBookings] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ria-handled-bookings") || "{}"); } catch { return {}; }
  });
  const [listingsInitCategory, setListingsInitCategory] = useState("");
  const [listingsInitSearch, setListingsInitSearch] = useState("");
  const [lastMessagesCheck, setLastMessagesCheck] = useState(() => {
    try { return new Date(localStorage.getItem("ria-last-msg-check") || 0); } catch { return new Date(0); }
  });

  const unreadCount = useMemo(() => {
    if (!currentUser) return 0;
    return messages.filter((m) => m.toUserId === currentUser.id && new Date(m.createdAt) > lastMessagesCheck).length;
  }, [messages, currentUser, lastMessagesCheck]);

  // Enrich listings with real review data
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

  function markMessagesRead() {
    const now = new Date();
    setLastMessagesCheck(now);
    localStorage.setItem("ria-last-msg-check", now.toISOString());
  }

  function addToast(text, type = "info") {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }

  useEffect(() => {
    const savedUser = localStorage.getItem("ria-current-user");
    if (savedUser) setCurrentUser(JSON.parse(savedUser));

    async function loadSessionAndListings() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const sessionUser = {
          id: session.user.id,
          name: session.user.user_metadata?.name || "User",
          email: session.user.email,
          emailConfirmed: !!session.user.email_confirmed_at,
        };
        setCurrentUser(sessionUser);
        localStorage.setItem("ria-current-user", JSON.stringify(sessionUser));
        loadMessages(session.user.id);
        loadProfile(session.user.id);
        loadFavorites(session.user.id);
      }

      await loadListings();
      loadAllReviews();
    }

    loadSessionAndListings();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === "PASSWORD_RECOVERY") {
        setCurrentPage("reset-password");
        return;
      }
      if (session?.user) {
        const sessionUser = {
          id: session.user.id,
          name: session.user.user_metadata?.name || "User",
          email: session.user.email,
          emailConfirmed: !!session.user.email_confirmed_at,
        };
        setCurrentUser(sessionUser);
        localStorage.setItem("ria-current-user", JSON.stringify(sessionUser));
        loadMessages(session.user.id);
        loadProfile(session.user.id);
        loadFavorites(session.user.id);
      } else {
        setCurrentUser(null);
        setMessages([]);
        setFavorites([]);
        setProfile(null);
        localStorage.removeItem("ria-current-user");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Supabase Realtime — neue Nachrichten sofort anzeigen
  useEffect(() => {
    if (!currentUser) return;
    const channel = supabase
      .channel("messages-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const msg = mapMessageFromDb(payload.new);
        if (msg.toUserId !== currentUser.id && msg.fromUserId !== currentUser.id) return;
        setMessages((prev) => {
          if (prev.find((m) => m.id === msg.id)) return prev;
          return [msg, ...prev];
        });
        if (msg.toUserId === currentUser.id) {
          addToast(`Neue Nachricht von ${msg.fromName}`, "info");
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            try {
              new Notification("ria – Neue Nachricht", {
                body: `${msg.fromName}: ${msg.text.slice(0, 80)}`,
                icon: "/favicon.ico",
              });
            } catch (_) {}
          }
        }
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [currentUser?.id]);

  const sortedMessages = useMemo(() => [...messages].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [messages]);

  function mapMessageFromDb(row) {
    return {
      id: row.id,
      listingId: row.listing_id,
      listingTitle: row.listing_title,
      fromUserId: row.from_user_id,
      fromName: row.from_name,
      fromEmail: row.from_email,
      toUserId: row.to_user_id,
      text: row.text,
      createdAt: row.created_at,
    };
  }

  function mapListingFromDb(row) {
    return {
      id: row.id,
      title: row.title,
      price: row.price,
      location: row.location,
      image: row.image,
      category: row.category,
      description: row.description,
      userId: row.user_id,
      ownerName: row.owner_name || "Ria Mitglied",
      images: row.images || [],
      rating: 0,
      reviews: 0,
      featured: false,
      status: "aktiv",
      isAvailable: row.is_available !== false,
      createdAt: row.created_at,
    };
  }

  async function loadListings() {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      addToast("Inserate konnten nicht geladen werden.", "error");
      setListings(initialListings);
      setLoading(false);
      return;
    }

    const realListings = data ? data.map(mapListingFromDb) : [];
    // Always show demo listings as a base so the app never looks empty
    const merged = [...realListings, ...initialListings.filter((d) => !realListings.some((r) => r.id === d.id))];
    setListings(merged);
    setLoading(false);
  }

  async function loadAllReviews() {
    const { data } = await supabase.from("reviews").select("listing_id, rating");
    if (data) setAllReviews(data);
  }

  function handleReviewAdded(listingId, rating) {
    setAllReviews((prev) => [...prev, { listing_id: String(listingId), rating }]);
  }


  async function loadProfile(userId) {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (data) setProfile(data);
  }

  async function loadFavorites(userId) {
    const { data, error } = await supabase.from("favorites").select("listing_id").eq("user_id", userId);
    if (error) {
      // favorites table might not exist yet — load from localStorage as fallback
      try { const saved = JSON.parse(localStorage.getItem("ria-favorites") || "[]"); setFavorites(saved); } catch { /* ignore */ }
      return;
    }
    if (data) setFavorites(data.map((f) => String(f.listing_id)));
  }

  async function loadMessages(userId) {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) {
      addToast("Nachrichten konnten nicht geladen werden.", "error");
      return;
    }
    setMessages(data.map(mapMessageFromDb));
  }

  async function seedDemoListings() {
    if (!currentUser) return;
    const seeds = [
      { title: "Bohrmaschine Bosch", price: "5 € / Tag", location: "Paderborn", category: "Werkzeug", description: "Kräftige Bohrmaschine mit Koffer und Zubehör. Ideal für Heimwerker-Projekte.", image: categoryImages.Werkzeug },
      { title: "Beamer Full HD", price: "8 € / Tag", location: "Paderborn", category: "Technik", description: "Heller Full-HD Beamer, perfekt für Filmabende oder Präsentationen. HDMI-Kabel inklusive.", image: categoryImages.Technik },
      { title: "Zelt für 4 Personen", price: "12 € / Tag", location: "Paderborn", category: "Outdoor & Sport", description: "Geräumiges 4-Personen-Zelt, wasserdicht und schnell aufgebaut. Heringe und Gestänge vollständig.", image: categoryImages["Outdoor & Sport"] },
      { title: "DSLR Kamera Canon EOS", price: "18 € / Tag", location: "Paderborn", category: "Foto & Technik", description: "Canon EOS mit 18–55mm Kit-Objektiv. Für Fotos und Videos bis 4K. Speicherkarte inklusive.", image: categoryImages["Foto & Technik"] },
      { title: "Lastenfahrrad", price: "10 € / Tag", location: "Paderborn", category: "Transport", description: "Stabiles Lastenrad mit großer Ladefläche vorne. Bis 80 kg Zuladung, perfekt für Umzüge oder Einkäufe.", image: categoryImages.Transport },
      { title: "Gitarre Akustik", price: "6 € / Tag", location: "Paderborn", category: "Musik", description: "Schöne Westerngitarre in gutem Zustand. Koffer und Pick dabei.", image: categoryImages.Musik },
      { title: "Party-Lichtanlage", price: "15 € / Tag", location: "Paderborn", category: "Party & Events", description: "LED-Beleuchtung mit Stroboskop, Nebelmaschine und Lautsprecher. Komplettes Party-Set.", image: categoryImages["Party & Events"] },
      { title: "Gaming-Stuhl", price: "4 € / Tag", location: "Paderborn", category: "Gaming", description: "Ergonomischer Gaming-Stuhl mit verstellbarer Rückenlehne und Armlehnen.", image: categoryImages.Gaming },
    ];
    const payloads = seeds.map((s) => ({ ...s, user_id: currentUser.id, owner_name: currentUser.name, is_available: true }));
    const { data, error } = await supabase.from("listings").insert(payloads).select();
    if (error) { addToast("Fehler: " + error.message, "error"); return; }
    setListings((prev) => [...(data || []).map(mapListingFromDb), ...prev]);
    addToast(`${seeds.length} Demo-Inserate erstellt ✓`, "info");
  }

  async function addListing(newListing) {
    const payload = {
      title: newListing.title,
      price: newListing.price,
      location: newListing.location,
      image: newListing.image,
      images: newListing.images || [],
      category: newListing.category,
      description: newListing.description,
      user_id: newListing.userId,
      owner_name: newListing.ownerName || currentUser?.name || "Ria Mitglied",
      is_available: true,
    };

    const { data, error } = await supabase
      .from("listings")
      .insert(payload)
      .select()
      .single();

    if (error) {
      addToast(`Inserat konnte nicht gespeichert werden: ${error.message}`, "error");
      return;
    }

    const insertedListing = mapListingFromDb(data);
    setListings((prev) => [insertedListing, ...prev]);
    setSelectedListing(insertedListing);
  }

  async function toggleAvailability(id, isAvailable) {
    const { error } = await supabase.from("listings").update({ is_available: isAvailable }).eq("id", id);
    if (error) { addToast("Fehler: " + error.message, "error"); return; }
    setListings((prev) => prev.map((l) => l.id === id ? { ...l, isAvailable } : l));
    addToast(isAvailable ? "Inserat wieder verfügbar ✓" : "Als vergeben markiert.", "info");
  }

  async function deleteListing(id) {
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) {
      addToast("Fehler beim Löschen.", "error");
      return;
    }
    setListings((prev) => prev.filter((l) => l.id !== id));
    addToast("Inserat gelöscht.", "info");
  }

  async function toggleFavorite(id) {
    const strId = String(id);
    if (!currentUser) {
      setFavorites((prev) => {
        const next = prev.includes(strId) ? prev.filter((f) => f !== strId) : [...prev, strId];
        localStorage.setItem("ria-favorites", JSON.stringify(next));
        return next;
      });
      return;
    }
    const isFav = favorites.includes(strId);
    if (isFav) {
      await supabase.from("favorites").delete().eq("user_id", currentUser.id).eq("listing_id", strId);
      setFavorites((prev) => prev.filter((f) => f !== strId));
    } else {
      await supabase.from("favorites").insert({ user_id: currentUser.id, listing_id: strId });
      setFavorites((prev) => [...prev, strId]);
    }
  }

  async function updateProfile(updates) {
    const { error } = await supabase.from("profiles").upsert({
      id: currentUser.id,
      name: currentUser.name,
      ...updates,
      updated_at: new Date().toISOString(),
    });
    if (error) { addToast("Fehler: " + error.message, "error"); return; }
    setProfile((prev) => ({ ...prev, ...updates }));
    addToast("Profil gespeichert.", "info");
  }

  async function updateListing(id, updates) {
    const payload = {
      title: updates.title, price: updates.price, location: updates.location,
      image: updates.image, category: updates.category, description: updates.description,
    };
    const { data, error } = await supabase.from("listings").update(payload).eq("id", id).select().single();
    if (error) { addToast("Fehler beim Speichern: " + error.message, "error"); return; }
    setListings((prev) => prev.map((l) => l.id === id ? { ...l, ...updates } : l));
    addToast("Inserat gespeichert.", "info");
  }

  async function acceptBooking(msg) {
    if (!currentUser) return;
    await saveMessage({
      listingId: msg.listingId,
      listingTitle: msg.listingTitle,
      toUserId: msg.fromUserId,
      text: `✓ Buchungsanfrage angenommen! Melde dich gerne für Details zur Übergabe.`,
    });
    const updated = { ...handledBookings, [msg.id]: "accepted" };
    setHandledBookings(updated);
    localStorage.setItem("ria-handled-bookings", JSON.stringify(updated));
    addToast("Buchung angenommen ✓", "info");
  }

  async function declineBooking(msg) {
    if (!currentUser) return;
    await saveMessage({
      listingId: msg.listingId,
      listingTitle: msg.listingTitle,
      toUserId: msg.fromUserId,
      text: `Leider kann ich die Buchungsanfrage gerade nicht annehmen. Schau gerne nach anderen Inseraten auf ria!`,
    });
    const updated = { ...handledBookings, [msg.id]: "declined" };
    setHandledBookings(updated);
    localStorage.setItem("ria-handled-bookings", JSON.stringify(updated));
    addToast("Buchung abgelehnt.", "info");
  }

  function openListingDetails(listing) {
    setSelectedListing(listing);
    setCurrentPage("listing-detail");
  }

  function handleLogin(user, isNew = false) {
    setCurrentUser(user);
    localStorage.setItem("ria-current-user", JSON.stringify(user));
    loadMessages(user.id);
    loadProfile(user.id);
    loadFavorites(user.id);
    if (isNew) setShowOnboarding(true);
    setCurrentPage("home");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setProfile(null);
    setFavorites([]);
    setMessages([]);
    localStorage.removeItem("ria-current-user");
    setCurrentPage("home");
  }

  function startMessageForListing(listing) {
    if (!currentUser) {
      setSelectedListing(listing);
      setCurrentPage("login");
      return;
    }
    if (listing.userId === "demo") {
      addToast("Das ist ein Demo-Inserat. Erstell dein eigenes, um echte Anfragen zu erhalten!", "info");
      setCurrentPage("create-listing");
      return;
    }
    if (listing.userId === currentUser.id) {
      addToast("Das ist dein eigenes Inserat.", "info");
      return;
    }
    setSelectedListing(listing);
    setCurrentPage("message-composer");
  }

  async function saveMessage(newMessage) {
    const { data, error } = await supabase
      .from("messages")
      .insert({
        listing_id: newMessage.listingId,
        listing_title: newMessage.listingTitle,
        from_user_id: currentUser.id,
        from_name: currentUser.name,
        from_email: currentUser.email,
        to_user_id: newMessage.toUserId,
        text: newMessage.text,
      })
      .select()
      .single();

    if (error) {
      addToast("Fehler beim Senden: " + error.message, "error");
      return false;
    }

    setMessages((prev) => [mapMessageFromDb(data), ...prev]);
    return true;
  }

  function goToListingsWithFilter(category) {
    setListingsInitCategory(category);
    setListingsInitSearch("");
    setCurrentPage("listings");
  }

  function goToListingsWithSearch(search) {
    setListingsInitSearch(search);
    setListingsInitCategory("");
    setCurrentPage("listings");
  }

  function renderPage() {
    if (currentPage === "login") return <LoginPage onLogin={handleLogin} currentUser={currentUser} />;
    if (currentPage === "listings") return <ListingsPage listings={enrichedListings} loading={loading} goTo={setCurrentPage} onSelectListing={openListingDetails} currentUser={currentUser} favorites={favorites} toggleFavorite={toggleFavorite} initCategory={listingsInitCategory} initSearch={listingsInitSearch} />;
    if (currentPage === "listing-detail") return <ListingDetailPage listing={enrichedListings.find((l) => l.id === selectedListing?.id) || selectedListing} goTo={setCurrentPage} currentUser={currentUser} onStartMessage={startMessageForListing} allListings={enrichedListings} onSelectListing={openListingDetails} favorites={favorites} toggleFavorite={toggleFavorite} addToast={addToast} onEditListing={(item) => { setEditListing(item); setCurrentPage("edit-listing"); }} onDeleteListing={(id) => { deleteListing(id); setCurrentPage("listings"); }} onReviewAdded={handleReviewAdded} onToggleAvailability={toggleAvailability} onViewOwner={(owner) => { setSelectedOwner(owner); setCurrentPage("owner-profile"); }} />;
    if (currentPage === "owner-profile") return <OwnerProfilePage owner={selectedOwner} listings={enrichedListings} goTo={setCurrentPage} onSelectListing={openListingDetails} />;
    if (currentPage === "message-composer") return <MessageComposerPage listing={selectedListing} currentUser={currentUser} goTo={setCurrentPage} onSendMessage={saveMessage} />;
    if (currentPage === "create-listing") {
      if (!currentUser) { setCurrentPage("login"); return null; }
      return <CreateListingPage onAddListing={addListing} goTo={setCurrentPage} currentUser={currentUser} addToast={addToast} />;
    }
    if (currentPage === "messages") return <MessagesPage messages={sortedMessages} currentUser={currentUser} goTo={setCurrentPage} listings={enrichedListings} onSendMessage={saveMessage} onOpen={markMessagesRead} />;
    if (currentPage === "profile") return <ProfilePage currentUser={currentUser} profile={profile} listings={enrichedListings} messages={sortedMessages} favorites={favorites} goTo={setCurrentPage} onSelectListing={openListingDetails} onDeleteListing={deleteListing} onEditListing={(item) => { setEditListing(item); setCurrentPage("edit-listing"); }} onUpdateProfile={updateProfile} onAcceptBooking={acceptBooking} onDeclineBooking={declineBooking} handledBookings={handledBookings} />;
    if (currentPage === "edit-listing") return <EditListingPage listing={editListing} onUpdateListing={updateListing} goTo={setCurrentPage} currentUser={currentUser} addToast={addToast} />;
    if (currentPage === "reset-password") return <ResetPasswordPage onDone={() => { setCurrentPage("home"); }} />;
    if (currentPage === "impressum") return <ImpressumPage goTo={setCurrentPage} />;
    if (currentPage === "agb") return <AGBPage goTo={setCurrentPage} />;
    if (currentPage === "datenschutz") return <DatenschutzPage goTo={setCurrentPage} />;
    return <HomePage goTo={setCurrentPage} listings={enrichedListings} loading={loading} currentUser={currentUser} onSeedDemo={seedDemoListings} onCategoryClick={goToListingsWithFilter} onSearch={goToListingsWithSearch} />;
  }

  return (
    <div style={{ overflowX: "hidden" }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes sway { 0%, 100% { transform: rotate(-6deg); } 50% { transform: rotate(6deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        button:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,0,0,0.07); }
        .hover-card { transition: transform 0.22s ease, box-shadow 0.22s ease; }
        .hover-card:hover { transform: translateY(-3px); box-shadow: 0 24px 60px rgba(28,58,46,0.14); }
        .hover-media img { transition: transform 0.3s ease; }
        .hover-media:hover img { transform: scale(1.05); }
        @media (max-width: 980px) {
          .ria-hero-grid, .ria-grid-4, .ria-grid-3, .ria-grid-2, .ria-detail-grid, .ria-create-grid { grid-template-columns: 1fr !important; }
          .ria-listing-filters { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .ria-topbar { padding: 0.65rem 1rem !important; gap: 0.5rem !important; }
          .ria-topbar-navbtn { padding: 0.55rem 0.75rem !important; font-size: 0.85rem !important; }
          .ria-topbar-logo { min-width: unset !important; }
          .ria-hero-cards { display: none !important; }
          .ria-hero-section { padding: 4rem 1.25rem 3.5rem !important; }
        }
        @keyframes revealUp { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 860px) {
          .ria-login-left { display: none !important; }
        }
        .avatar-overlay { opacity: 0 !important; }
        label:hover .avatar-overlay { opacity: 1 !important; }
        .ria-bottom-nav { display: none; }
        @media (max-width: 640px) {
          .ria-bottom-nav { display: block !important; }
          .ria-topbar-nav-group { display: none !important; }
          .ria-topbar-user { display: none !important; }
          .ria-page-pad { padding-bottom: 6.5rem !important; }
          /* Mobile: einzelne Spalten erzwingen */
          .ria-detail-grid, .ria-create-grid { grid-template-columns: 1fr !important; }
          /* Mobile: Abstände verkleinern */
          h1 { font-size: clamp(1.6rem, 8vw, 3rem) !important; }
          /* Verhindert horizontales Scrollen */
          img { max-width: 100%; }
          /* Nachrichten Seite kompakter */
          .ria-msg-thread-header { padding: 1rem !important; }
          /* Touch targets größer */
          button { min-height: 40px; }
        }
        /* Scrollbar verschönern */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(28,58,46,0.18); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(28,58,46,0.35); }
        /* Input Autofill-Hintergrund unterdrücken */
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 1000px white inset !important; }
        /* ── Accessibility ── */
        /* Skip-Link */
        .skip-link { position: absolute; top: -100px; left: 1rem; z-index: 10000; background: #1C3A2E; color: white; padding: 0.6rem 1.2rem; border-radius: 10px; font-weight: 700; font-size: 0.9rem; text-decoration: none; transition: top 0.15s ease; }
        .skip-link:focus { top: 0.75rem; outline: 2px solid #C8A96B; outline-offset: 3px; }
        /* Focus-Ringe für Tastatur-Navigation */
        *:focus { outline: none; }
        *:focus-visible { outline: 2px solid #1C3A2E; outline-offset: 3px; border-radius: 4px; }
        /* Screen-reader-only Hilfsklasse */
        .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
        /* Reduzierte Bewegung respektieren */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
      <a href="#main-content" className="skip-link">Zum Hauptinhalt springen</a>
      <TopBar currentPage={currentPage} goTo={setCurrentPage} currentUser={currentUser} profile={profile} onLogout={handleLogout} unreadCount={unreadCount} onOpenMessages={() => { markMessagesRead(); setCurrentPage("messages"); }} />
      <main id="main-content" className="ria-page-pad">
        {renderPage()}
      </main>
      <BottomNav currentPage={currentPage} goTo={setCurrentPage} currentUser={currentUser} unreadCount={unreadCount} onOpenMessages={() => { markMessagesRead(); setCurrentPage("messages"); }} />
      <Toaster toasts={toasts} />
      {showOnboarding && <OnboardingModal user={currentUser} onClose={() => setShowOnboarding(false)} goTo={setCurrentPage} />}
      <footer style={{ background: C.forest, color: "rgba(255,255,255,0.6)", padding: "2.5rem 1.5rem", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ marginBottom: "0.6rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.8rem" }}>
          <Logo size={1.4} color="white" />
          <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "1.1rem" }}>—</span>
          <span style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "1.05rem", color: "rgba(255,255,255,0.55)", letterSpacing: "0.04em" }}>rent it all.</span>
        </div>
        <p style={{ margin: "0 0 0.75rem", fontSize: "0.9rem" }}>Nachhaltig mieten & vermieten in deiner Stadt.</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginBottom: "0.75rem" }}>
          <button onClick={() => setCurrentPage("agb")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.45)", cursor: "pointer", fontSize: "0.82rem", padding: 0 }}>AGB</button>
          <button onClick={() => setCurrentPage("impressum")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.45)", cursor: "pointer", fontSize: "0.82rem", padding: 0 }}>Impressum</button>
          <button onClick={() => setCurrentPage("datenschutz")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.45)", cursor: "pointer", fontSize: "0.82rem", padding: 0 }}>Datenschutz</button>
        </div>
        <p style={{ margin: 0, fontSize: "0.78rem", color: "rgba(255,255,255,0.35)" }}>© 2026 ria · Paderborn</p>
      </footer>
    </div>
  );
}
