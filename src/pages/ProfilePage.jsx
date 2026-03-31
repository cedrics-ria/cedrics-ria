import { useEffect, useRef, useState } from 'react';
import { C } from '../constants';
import { inputBaseStyle, primaryButtonStyle, applyInputFocus, resetInputFocus } from '../styles';
import EmptyState from '../components/EmptyState';
import VerifiedBadge from '../components/VerifiedBadge';
import ReviewModal from '../components/ReviewModal';
import { supabase } from '../supabase';
import { smartImageUrl } from '../lib/getImageUrl';
import { compressImage } from '../lib/compressImage';

export default function ProfilePage({
  currentUser,
  profile,
  listings,
  messages,
  favorites,
  goTo,
  onSelectListing,
  onDeleteListing,
  onEditListing,
  onUpdateProfile,
  addToast,
  bookings,
  onAcceptBookingRecord,
  onDeclineBookingRecord,
  onConfirmReturn,
  onLogout,
}) {
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ bio: '', location: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('listings');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [listingFilter, setListingFilter] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [accountDeleteConfirm, setAccountDeleteConfirm] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (profile)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfileForm({
        bio: profile.bio || '',
        location: profile.location || '',
        phone: profile.phone || '',
      });
  }, [profile]);

  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', background: C.cream, padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <EmptyState
            title="Noch kein Profil aktiv"
            text="Melde dich an oder registriere dich, damit du dein Profil, deine Inserate und Nachrichten sehen kannst."
            buttonLabel="Zum Login"
            onClick={() => goTo('login')}
          />
        </div>
      </div>
    );
  }

  const myListings = listings.filter((item) => item.userId === currentUser.id);
  const myMessages = messages.filter(
    (msg) => msg.fromUserId === currentUser.id || msg.toUserId === currentUser.id
  );
  const favListings = listings.filter((item) => favorites.includes(String(item.id)));
  // Bookings from the bookings table — owner view (incoming requests)
  const ownerBookings = (bookings || []).filter((b) => b.owner_id === currentUser.id);
  const pendingOwnerBookings = ownerBookings.filter((b) => b.status === 'pending');
  const ownerBookingsBadge =
    pendingOwnerBookings.length > 0
      ? ` 🔴 ${pendingOwnerBookings.length}`
      : ` (${ownerBookings.length})`;

  // Bookings from the bookings table — renter view (my own requests)
  const renterBookings = (bookings || []).filter((b) => b.requester_id === currentUser.id);
  const pendingRenterBookings = renterBookings.filter((b) => b.status === 'pending');
  const renterBookingsBadge =
    pendingRenterBookings.length > 0
      ? ` 🔴 ${pendingRenterBookings.length}`
      : ` (${renterBookings.length})`;

  async function handleSaveProfile() {
    setSaving(true);
    await onUpdateProfile(profileForm);
    setSaving(false);
    setEditingProfile(false);
  }

  return (
    <div style={{ minHeight: '100vh', background: C.cream, padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Delete confirmation modal */}
        {deleteConfirm && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9000,
              background: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
            }}
          >
            <div
              style={{
                background: 'white',
                borderRadius: 24,
                padding: '2rem',
                maxWidth: 420,
                width: '100%',
                boxShadow: '0 30px 60px rgba(0,0,0,0.2)',
                textAlign: 'center',
              }}
            >
              <h3 style={{ color: C.forest, margin: '0 0 0.75rem', fontSize: '1.3rem' }}>
                Inserat löschen?
              </h3>
              <p style={{ color: C.muted, marginBottom: '1.5rem', lineHeight: 1.6 }}>
                "{deleteConfirm.title}" wird unwiderruflich gelöscht.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  style={{
                    flex: 1,
                    padding: '0.9rem',
                    borderRadius: 12,
                    border: `1px solid ${C.line}`,
                    background: 'white',
                    color: C.forest,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Abbrechen
                </button>
                <button
                  onClick={() => {
                    onDeleteListing(deleteConfirm.id);
                    setDeleteConfirm(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '0.9rem',
                    borderRadius: 12,
                    border: 'none',
                    background: C.terra,
                    color: 'white',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Löschen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Header Card */}
        <div
          style={{
            background: 'white',
            borderRadius: 28,
            padding: '2rem',
            border: `1px solid ${C.line}`,
            boxShadow: C.shadow,
            marginBottom: '2rem',
          }}
        >
          <div
            style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #163126, #1C3A2E)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  fontWeight: 800,
                  boxShadow: '0 8px 24px rgba(28,58,46,0.2)',
                  overflow: 'hidden',
                  position: 'relative',
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
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 3 * 1024 * 1024) {
                    addToast?.('Bild zu groß (max. 3 MB)', 'error');
                    return;
                  }
                  const compressed = await compressImage(file);
                  if (!compressed) {
                    addToast?.('Ungültiger Dateityp. Bitte lade ein JPEG, PNG, GIF oder WebP hoch.', 'error');
                    return;
                  }
                  const fileName = `${currentUser.id}-${Date.now()}.jpg`;
                  setAvatarUploading(true);
                  const { error } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, compressed, { upsert: true });
                  if (error) {
                    setAvatarUploading(false);
                    addToast?.('Upload fehlgeschlagen: ' + error.message, 'error');
                    return;
                  }
                  const publicUrl = supabase.storage.from('avatars').getPublicUrl(fileName).data.publicUrl;
                  await onUpdateProfile({ avatar_url: publicUrl });
                  setAvatarUploading(false);
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.3rem 0.7rem',
                  borderRadius: 8,
                  border: `1px solid ${C.line}`,
                  background: 'white',
                  color: C.forest,
                  cursor: avatarUploading ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  opacity: avatarUploading ? 0.7 : 1,
                  whiteSpace: 'nowrap',
                }}
              >
                {avatarUploading ? 'Wird hochgeladen…' : 'Foto ändern'}
              </button>
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: '1.4rem',
                  color: C.forest,
                  marginBottom: '0.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  flexWrap: 'wrap',
                }}
              >
                {currentUser.name}
                {currentUser.emailConfirmed && <VerifiedBadge />}
                {profile?.phone && <VerifiedBadge variant="phone" />}
              </div>
              <div style={{ color: C.muted, fontSize: '0.88rem', marginBottom: '0.5rem' }}>
                {currentUser.email}
              </div>
              {profile?.location && !editingProfile && (
                <div
                  style={{
                    fontSize: '0.85rem',
                    color: C.muted,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <span>📍</span>
                  {profile.location}
                </div>
              )}
              {profile?.bio && !editingProfile && (
                <p
                  style={{
                    color: C.ink,
                    fontSize: '0.9rem',
                    margin: '0.6rem 0 0',
                    lineHeight: 1.6,
                  }}
                >
                  {profile.bio}
                </p>
              )}
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', gap: '1.75rem' }}>
                {[
                  ['Inserate', myListings.length],
                  ['Nachrichten', myMessages.length],
                  ['Favoriten', favListings.length],
                ].map(([label, val]) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        fontSize: '1.8rem',
                        fontWeight: 800,
                        color: C.forest,
                        lineHeight: 1,
                      }}
                    >
                      {val}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: C.muted, marginTop: '0.2rem' }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setEditingProfile((v) => !v)}
                style={{
                  padding: '0.6rem 1.1rem',
                  borderRadius: 12,
                  border: `1px solid ${C.line}`,
                  background: editingProfile ? C.sageLight : 'white',
                  color: C.forest,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                {editingProfile ? 'Abbrechen' : 'Profil bearbeiten'}
              </button>
            </div>
          </div>
          {editingProfile && (
            <div
              style={{
                marginTop: '1.5rem',
                paddingTop: '1.5rem',
                borderTop: `1px solid ${C.line}`,
                display: 'grid',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: C.forest,
                      marginBottom: '0.4rem',
                    }}
                  >
                    Ort
                  </label>
                  <input
                    value={profileForm.location}
                    onChange={(e) => setProfileForm((p) => ({ ...p, location: e.target.value }))}
                    placeholder="z. B. Paderborn"
                    maxLength={100}
                    onFocus={applyInputFocus}
                    onBlur={resetInputFocus}
                    style={inputBaseStyle}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: C.forest,
                      marginBottom: '0.4rem',
                    }}
                  >
                    Kurz-Bio
                  </label>
                  <input
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))}
                    placeholder="Ein Satz über dich..."
                    maxLength={500}
                    onFocus={applyInputFocus}
                    onBlur={resetInputFocus}
                    style={inputBaseStyle}
                  />
                </div>
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: C.forest,
                    marginBottom: '0.4rem',
                  }}
                >
                  Handynummer
                  <span
                    style={{
                      marginLeft: '0.5rem',
                      fontSize: '0.75rem',
                      color: C.muted,
                      fontWeight: 400,
                    }}
                  >
                    — Zeigt ein Verifikations-Badge auf deinem Profil
                  </span>
                </label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="z. B. +49 176 12345678"
                  maxLength={30}
                  onFocus={applyInputFocus}
                  onBlur={resetInputFocus}
                  style={inputBaseStyle}
                />
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                style={{
                  ...primaryButtonStyle,
                  alignSelf: 'flex-start',
                  padding: '0.75rem 1.5rem',
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? 'Wird gespeichert...' : 'Speichern'}
              </button>
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: `1px solid ${C.line}` }}>
                <button
                  type="button"
                  onClick={onLogout}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1.25rem',
                    borderRadius: 12,
                    border: `1px solid ${C.line}`,
                    background: 'white',
                    color: C.ink,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    marginBottom: '1rem',
                  }}
                >
                  Abmelden
                </button>
              </div>
              <div style={{ paddingTop: '0.5rem', borderTop: `1px solid rgba(196,113,74,0.2)` }}>
                <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem', color: C.muted, fontWeight: 600 }}>Gefahrenzone</p>
                {!accountDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => setAccountDeleteConfirm(true)}
                    style={{
                      padding: '0.6rem 1.1rem',
                      borderRadius: 10,
                      border: `1px solid rgba(196,113,74,0.4)`,
                      background: 'rgba(196,113,74,0.06)',
                      color: C.terra,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                    }}
                  >
                    Konto löschen
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 400 }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: C.terra, lineHeight: 1.6 }}>
                      Bist du sicher? Alle deine Daten werden unwiderruflich gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
                    </p>
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <button
                        type="button"
                        onClick={() => setAccountDeleteConfirm(false)}
                        style={{ flex: 1, padding: '0.7rem', borderRadius: 10, border: `1px solid ${C.line}`, background: 'white', color: C.forest, fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        Abbrechen
                      </button>
                      <button
                        type="button"
                        disabled={deletingAccount}
                        onClick={async () => {
                          setDeletingAccount(true);
                          try {
                            await supabase.from('support_requests').insert({
                              name: currentUser.name,
                              email: currentUser.email,
                              subject: 'Kontolöschung',
                              message: `Bitte lösche mein Konto und alle meine Daten. User-ID: ${currentUser.id}`,
                            });
                          } catch { /* ignore */ }
                          await supabase.auth.signOut();
                        }}
                        style={{ flex: 2, padding: '0.7rem', borderRadius: 10, border: 'none', background: C.terra, color: 'white', fontWeight: 700, cursor: deletingAccount ? 'not-allowed' : 'pointer', fontSize: '0.85rem', opacity: deletingAccount ? 0.7 : 1 }}
                      >
                        {deletingAccount ? 'Wird verarbeitet…' : 'Ja, Konto löschen'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1.75rem',
            background: 'rgba(28,58,46,0.06)',
            borderRadius: 14,
            padding: '0.3rem',
            flexWrap: 'wrap',
          }}
        >
          {[
            ['listings', `Inserate (${myListings.length})`],
            ['buchungen', `Anfragen${ownerBookingsBadge}`],
            ['meine-buchungen', `Meine Buchungen${renterBookingsBadge}`],
            ['favorites', `Favoriten (${favListings.length})`],
            ['messages', `Nachrichten (${myMessages.length})`],
          ].map(([t, label]) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              style={{
                flex: 1,
                padding: '0.65rem 0.5rem',
                borderRadius: 10,
                border: 'none',
                background: activeTab === t ? 'white' : 'transparent',
                color: activeTab === t ? C.forest : C.muted,
                fontWeight: activeTab === t ? 700 : 500,
                cursor: 'pointer',
                fontSize: '0.85rem',
                boxShadow: activeTab === t ? '0 2px 10px rgba(28,58,46,0.1)' : 'none',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab: Meine Inserate */}
        {activeTab === 'listings' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <h2 style={{ color: C.forest, margin: 0, fontSize: '1.4rem' }}>Meine Inserate</h2>
              <button
                onClick={() => goTo('create-listing')}
                style={{
                  ...primaryButtonStyle,
                  padding: '0.7rem 1.2rem',
                  fontSize: '0.9rem',
                  borderRadius: 999,
                }}
              >
                + Neu erstellen
              </button>
            </div>
            {myListings.length > 0 && (() => {
              const cats = [...new Set(myListings.filter(l => l.category).map(l => l.category))];
              if (cats.length < 2) return null;
              return (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  <button
                    onClick={() => setListingFilter('')}
                    style={{
                      padding: '0.35rem 0.85rem',
                      borderRadius: 999,
                      border: `1px solid ${listingFilter === '' ? C.forest : C.line}`,
                      background: listingFilter === '' ? C.forest : 'white',
                      color: listingFilter === '' ? 'white' : C.muted,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Alle
                  </button>
                  {cats.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setListingFilter(cat)}
                      style={{
                        padding: '0.35rem 0.85rem',
                        borderRadius: 999,
                        border: `1px solid ${listingFilter === cat ? C.forest : C.line}`,
                        background: listingFilter === cat ? C.forest : 'white',
                        color: listingFilter === cat ? 'white' : C.muted,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              );
            })()}
            {myListings.length === 0 ? (
              <EmptyState
                title="Noch keine Inserate"
                text="Starte jetzt und verdiene nebenbei — dein erstes Inserat ist in 2 Minuten online."
                buttonLabel="Inserat erstellen"
                onClick={() => goTo('create-listing')}
              />
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '1rem',
                }}
              >
                {myListings.filter(item => !listingFilter || item.category === listingFilter).map((item) => (
                  <div
                    key={item.id}
                    className="hover-card"
                    style={{
                      background: 'white',
                      borderRadius: 20,
                      overflow: 'hidden',
                      border: `1px solid ${C.line}`,
                      boxShadow: C.shadow,
                    }}
                  >
                    <div
                      style={{
                        height: 150,
                        background: C.sageLight,
                        position: 'relative',
                        cursor: 'pointer',
                      }}
                      onClick={() => onSelectListing(item)}
                    >
                      {item.image && (
                        <img
                          src={smartImageUrl(item.image, { width: 400, quality: 75 })}
                          alt={item.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                      )}
                      <div
                        style={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          background: 'rgba(255,255,255,0.93)',
                          color: C.forest,
                          padding: '0.25rem 0.6rem',
                          borderRadius: 999,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        {item.category}
                      </div>
                    </div>
                    <div style={{ padding: '1rem' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start',
                          marginBottom: '0.25rem',
                        }}
                      >
                        <h3
                          style={{
                            color: C.forest,
                            margin: 0,
                            fontSize: '1rem',
                            cursor: 'pointer',
                          }}
                          onClick={() => onSelectListing(item)}
                        >
                          {item.title}
                        </h3>
                        <span style={{ color: C.terra, fontWeight: 800, fontSize: '0.9rem' }}>
                          {item.price}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 0.85rem' }}>
                        <p style={{ color: C.muted, margin: 0, fontSize: '0.82rem' }}>
                          {item.location}
                        </p>
                        <span style={{ color: C.muted, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          👁 {item.views || 0} {item.views === 1 ? 'Aufruf' : 'Aufrufe'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => onEditListing(item)}
                          style={{
                            flex: 1,
                            background: C.sageLight,
                            color: C.forest,
                            border: `1px solid ${C.line}`,
                            borderRadius: 10,
                            padding: '0.55rem',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Bearbeiten
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(item)}
                          style={{
                            flex: 1,
                            background: 'rgba(196,113,74,0.08)',
                            color: C.terra,
                            border: `1px solid rgba(196,113,74,0.2)`,
                            borderRadius: 10,
                            padding: '0.55rem',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Löschen
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Buchungsanfragen (bookings table) */}
        {activeTab === 'buchungen' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <h2 style={{ color: C.forest, margin: 0, fontSize: '1.4rem' }}>Buchungsanfragen</h2>
              {pendingOwnerBookings.length > 0 && (
                <span
                  style={{
                    background: C.terra,
                    color: 'white',
                    borderRadius: 999,
                    padding: '0.2rem 0.75rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                >
                  {pendingOwnerBookings.length} offen
                </span>
              )}
            </div>
            {ownerBookings.length === 0 ? (
              <EmptyState
                title="Keine Buchungsanfragen"
                text="Sobald jemand eine Buchungsanfrage für eines deiner Inserate stellt, erscheint sie hier."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {ownerBookings.map((booking) => {
                  const listing = listings.find((l) => String(l.id) === String(booking.listing_id));
                  const fmtDate = (d) => {
                    if (!d) return '';
                    const [y, m, day] = d.split('-');
                    return `${day}.${m}.${y}`;
                  };
                  const borderColor =
                    booking.status === 'accepted'
                      ? C.sage
                      : booking.status === 'declined'
                        ? 'rgba(196,113,74,0.3)'
                        : C.line;
                  return (
                    <div
                      key={booking.id}
                      style={{
                        background: 'white',
                        borderRadius: 20,
                        border: `1px solid ${borderColor}`,
                        boxShadow: '0 4px 15px rgba(28,58,46,0.06)',
                        overflow: 'hidden',
                      }}
                    >
                      <div style={{ padding: '1.25rem 1.5rem' }}>
                        <div
                          style={{
                            display: 'flex',
                            gap: '1rem',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                          }}
                        >
                          {listing?.image && (
                            <img
                              src={smartImageUrl(listing.image, { width: 400, quality: 75 })}
                              alt=""
                              style={{
                                width: 56,
                                height: 56,
                                borderRadius: 10,
                                objectFit: 'cover',
                                flexShrink: 0,
                              }}
                            />
                          )}
                          <div style={{ flex: 1, minWidth: 160 }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '0.3rem',
                                flexWrap: 'wrap',
                              }}
                            >
                              <span
                                style={{ fontWeight: 700, color: C.forest, fontSize: '0.95rem' }}
                              >
                                {booking.requester_name || 'Unbekannt'}
                              </span>
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
                                {booking.listing_title}
                              </span>
                              {booking.status === 'accepted' && (
                                <span
                                  style={{
                                    background: 'rgba(122,158,126,0.2)',
                                    color: C.forest,
                                    borderRadius: 999,
                                    padding: '0.12rem 0.55rem',
                                    fontSize: '0.7rem',
                                    fontWeight: 800,
                                  }}
                                >
                                  ✓ Angenommen
                                </span>
                              )}
                              {booking.status === 'declined' && (
                                <span
                                  style={{
                                    background: 'rgba(196,113,74,0.12)',
                                    color: C.terra,
                                    borderRadius: 999,
                                    padding: '0.12rem 0.55rem',
                                    fontSize: '0.7rem',
                                    fontWeight: 800,
                                  }}
                                >
                                  ✗ Abgelehnt
                                </span>
                              )}
                              {booking.status === 'pending' && (
                                <span
                                  style={{
                                    background: 'rgba(200,169,107,0.18)',
                                    color: '#8B6B2A',
                                    borderRadius: 999,
                                    padding: '0.12rem 0.55rem',
                                    fontSize: '0.7rem',
                                    fontWeight: 800,
                                  }}
                                >
                                  Ausstehend
                                </span>
                              )}
                            </div>
                            <p
                              style={{
                                margin: '0 0 0.2rem',
                                fontWeight: 700,
                                color: C.forest,
                                fontSize: '0.88rem',
                              }}
                            >
                              Zeitraum: {fmtDate(booking.start_date)} – {fmtDate(booking.end_date)}
                            </p>
                            <p
                              style={{ margin: '0.3rem 0 0', fontSize: '0.75rem', color: C.muted }}
                            >
                              Anfrage vom{' '}
                              {new Date(booking.created_at).toLocaleDateString('de-DE', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                        {booking.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1rem' }}>
                            <button
                              onClick={() =>
                                onAcceptBookingRecord && onAcceptBookingRecord(booking.id)
                              }
                              style={{
                                flex: 1,
                                padding: '0.75rem',
                                borderRadius: 12,
                                border: 'none',
                                background: 'linear-gradient(135deg, #163126, #1C3A2E)',
                                color: 'white',
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontSize: '0.88rem',
                              }}
                            >
                              ✓ Annehmen
                            </button>
                            <button
                              onClick={() =>
                                onDeclineBookingRecord && onDeclineBookingRecord(booking.id)
                              }
                              style={{
                                flex: 1,
                                padding: '0.75rem',
                                borderRadius: 12,
                                border: `1px solid rgba(196,113,74,0.3)`,
                                background: 'rgba(196,113,74,0.07)',
                                color: C.terra,
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontSize: '0.88rem',
                              }}
                            >
                              ✗ Ablehnen
                            </button>
                          </div>
                        )}
                        {/* Return confirmation for accepted bookings */}
                        {booking.status === 'accepted' && onConfirmReturn && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                            {booking.owner_confirmed_return && (
                              <span style={{ fontSize: '0.75rem', color: C.sage, fontWeight: 600 }}>✓ Vermieter bestätigt</span>
                            )}
                            {booking.renter_confirmed_return && (
                              <span style={{ fontSize: '0.75rem', color: C.sage, fontWeight: 600 }}>✓ Mieter bestätigt</span>
                            )}
                            {currentUser.id === booking.owner_id && !booking.owner_confirmed_return && (
                              <button
                                onClick={() => onConfirmReturn(booking.id, 'owner')}
                                style={{ padding: '0.5rem 0.9rem', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${C.forest}, #163126)`, color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
                              >
                                Rückgabe bestätigen
                              </button>
                            )}
                            {currentUser.id === booking.requester_id && !booking.renter_confirmed_return && (
                              <button
                                onClick={() => onConfirmReturn(booking.id, 'renter')}
                                style={{ padding: '0.5rem 0.9rem', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${C.forest}, #163126)`, color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
                              >
                                Rückgabe bestätigen
                              </button>
                            )}
                          </div>
                        )}
                        {/* Completed badge + review button */}
                        {booking.status === 'completed' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                            <span style={{ background: 'rgba(122,158,126,0.15)', color: C.forest, padding: '0.3rem 0.75rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 }}>✅ Abgeschlossen</span>
                            {currentUser.id === booking.requester_id && (
                              <button
                                onClick={() => setReviewBooking(booking)}
                                style={{ padding: '0.5rem 0.9rem', borderRadius: 10, border: `1px solid ${C.gold}`, background: 'rgba(200,169,107,0.08)', color: C.gold, fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
                              >
                                Erfahrung bewerten
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab: Meine Buchungen (renter view — bookings I requested) */}
        {activeTab === 'meine-buchungen' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <h2 style={{ color: C.forest, margin: 0, fontSize: '1.4rem' }}>Meine Buchungen</h2>
              {pendingRenterBookings.length > 0 && (
                <span
                  style={{
                    background: C.gold,
                    color: 'white',
                    borderRadius: 999,
                    padding: '0.2rem 0.75rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                >
                  {pendingRenterBookings.length} ausstehend
                </span>
              )}
            </div>
            {renterBookings.length === 0 ? (
              <EmptyState
                title="Noch keine Buchungen"
                text="Hier siehst du den Status deiner Buchungsanfragen, sobald du etwas angefragt hast."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {renterBookings.map((booking) => {
                  const statusColor =
                    booking.status === 'accepted'
                      ? C.sage
                      : booking.status === 'declined'
                        ? C.terra
                        : C.gold;
                  const statusLabel =
                    booking.status === 'accepted'
                      ? '✓ Angenommen'
                      : booking.status === 'declined'
                        ? '✗ Abgelehnt'
                        : '⏳ Ausstehend';
                  const fmt = (d) => {
                    if (!d) return '';
                    const [y, m, day] = d.split('-');
                    return `${day}.${m}.${y}`;
                  };
                  return (
                    <div
                      key={booking.id}
                      style={{
                        background: 'white',
                        borderRadius: 20,
                        border: `1px solid ${booking.status === 'accepted' ? 'rgba(122,158,126,0.4)' : booking.status === 'declined' ? 'rgba(196,113,74,0.3)' : C.line}`,
                        boxShadow: C.shadow,
                        padding: '1.25rem 1.5rem',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                          marginBottom: '0.5rem',
                        }}
                      >
                        <span style={{ fontWeight: 700, color: C.forest, fontSize: '0.97rem' }}>
                          {booking.listing_title}
                        </span>
                        <span
                          style={{
                            background:
                              booking.status === 'accepted'
                                ? 'rgba(122,158,126,0.15)'
                                : booking.status === 'declined'
                                  ? 'rgba(196,113,74,0.1)'
                                  : 'rgba(200,169,107,0.15)',
                            color: statusColor,
                            borderRadius: 999,
                            padding: '0.2rem 0.7rem',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                          }}
                        >
                          {statusLabel}
                        </span>
                      </div>
                      {booking.start_date && booking.end_date && (
                        <p style={{ margin: '0 0 0.3rem', fontSize: '0.85rem', color: C.muted }}>
                          {fmt(booking.start_date)} – {fmt(booking.end_date)}
                        </p>
                      )}
                      <p style={{ margin: 0, fontSize: '0.75rem', color: C.muted }}>
                        Angefragt am{' '}
                        {new Date(booking.created_at).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                      {/* Return confirmation for accepted bookings */}
                      {booking.status === 'accepted' && onConfirmReturn && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                          {booking.owner_confirmed_return && (
                            <span style={{ fontSize: '0.75rem', color: C.sage, fontWeight: 600 }}>✓ Vermieter bestätigt</span>
                          )}
                          {booking.renter_confirmed_return && (
                            <span style={{ fontSize: '0.75rem', color: C.sage, fontWeight: 600 }}>✓ Mieter bestätigt</span>
                          )}
                          {currentUser.id === booking.owner_id && !booking.owner_confirmed_return && (
                            <button
                              onClick={() => onConfirmReturn(booking.id, 'owner')}
                              style={{ padding: '0.5rem 0.9rem', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${C.forest}, #163126)`, color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
                            >
                              Rückgabe bestätigen
                            </button>
                          )}
                          {currentUser.id === booking.requester_id && !booking.renter_confirmed_return && (
                            <button
                              onClick={() => onConfirmReturn(booking.id, 'renter')}
                              style={{ padding: '0.5rem 0.9rem', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${C.forest}, #163126)`, color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
                            >
                              Rückgabe bestätigen
                            </button>
                          )}
                        </div>
                      )}
                      {/* Completed badge + review button */}
                      {booking.status === 'completed' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                          <span style={{ background: 'rgba(122,158,126,0.15)', color: C.forest, padding: '0.3rem 0.75rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 }}>✅ Abgeschlossen</span>
                          {currentUser.id === booking.requester_id && (
                            <button
                              onClick={() => setReviewBooking(booking)}
                              style={{ padding: '0.5rem 0.9rem', borderRadius: 10, border: `1px solid ${C.gold}`, background: 'rgba(200,169,107,0.08)', color: C.gold, fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
                            >
                              Erfahrung bewerten
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab: Favoriten */}
        {activeTab === 'favorites' && (
          <div>
            <h2 style={{ color: C.forest, margin: '0 0 1.25rem', fontSize: '1.4rem' }}>
              Gespeicherte Inserate
            </h2>
            {favListings.length === 0 ? (
              <EmptyState
                title="Noch keine Favoriten"
                text="Tippe auf das Herz-Symbol bei einem Inserat, um es hier zu speichern."
                buttonLabel="Inserate entdecken"
                onClick={() => goTo('listings')}
              />
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '1rem',
                }}
              >
                {favListings.map((item) => (
                  <div
                    key={item.id}
                    className="hover-card"
                    onClick={() => onSelectListing(item)}
                    style={{
                      background: 'white',
                      borderRadius: 20,
                      overflow: 'hidden',
                      border: `1px solid ${C.line}`,
                      boxShadow: C.shadow,
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ height: 150, background: C.sageLight, position: 'relative' }}>
                      {item.image && (
                        <img
                          src={smartImageUrl(item.image, { width: 400, quality: 75 })}
                          alt={item.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                      )}
                      <div
                        style={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          background: 'rgba(255,255,255,0.93)',
                          color: C.forest,
                          padding: '0.25rem 0.6rem',
                          borderRadius: 999,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        {item.category}
                      </div>
                      <div
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          color: C.terra,
                          fontSize: '1rem',
                        }}
                      >
                        ♥
                      </div>
                    </div>
                    <div style={{ padding: '1rem' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '0.5rem',
                          marginBottom: '0.2rem',
                        }}
                      >
                        <h3 style={{ color: C.forest, margin: 0, fontSize: '1rem' }}>
                          {item.title}
                        </h3>
                        <span
                          style={{
                            color: C.terra,
                            fontWeight: 800,
                            fontSize: '0.9rem',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.price}
                        </span>
                      </div>
                      <p style={{ color: C.muted, margin: 0, fontSize: '0.82rem' }}>
                        {item.ownerName} · {item.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Nachrichten */}
        {activeTab === 'messages' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <h2 style={{ color: C.forest, margin: 0, fontSize: '1.4rem' }}>Nachrichten</h2>
              <button
                onClick={() => goTo('messages')}
                style={{
                  background: 'white',
                  color: C.forest,
                  border: `1px solid ${C.line}`,
                  borderRadius: 999,
                  padding: '0.55rem 1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                Alle ansehen
              </button>
            </div>
            {myMessages.length === 0 ? (
              <EmptyState
                title="Noch keine Nachrichten"
                text="Schreib einen Verleiher an oder erstelle ein Inserat, um Anfragen zu bekommen."
                buttonLabel="Inserate durchsuchen"
                onClick={() => goTo('listings')}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {myMessages.slice(0, 6).map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      background: 'white',
                      padding: '1.25rem 1.5rem',
                      borderRadius: 16,
                      border: `1px solid ${C.line}`,
                      boxShadow: '0 4px 15px rgba(28,58,46,0.05)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        marginBottom: '0.4rem',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.5rem',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span
                          style={{
                            background: C.sageLight,
                            color: C.forest,
                            padding: '0.2rem 0.65rem',
                            borderRadius: 999,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          {msg.listingTitle}
                        </span>
                        {msg.toUserId === currentUser.id && (
                          <span style={{ fontSize: '0.78rem', color: C.muted }}>
                            von <strong style={{ color: C.forest }}>{msg.fromName}</strong>
                          </span>
                        )}
                        {msg.fromUserId === currentUser.id && (
                          <span style={{ fontSize: '0.78rem', color: C.muted }}>gesendet</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: C.muted, whiteSpace: 'nowrap' }}>
                        {new Date(msg.createdAt).toLocaleDateString('de-DE')}
                      </div>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        color: C.ink,
                        fontSize: '0.88rem',
                        lineHeight: 1.6,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {msg.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {reviewBooking && (
        <ReviewModal
          listingId={reviewBooking.listing_id}
          listingTitle={reviewBooking.listing_title}
          revieweeId={reviewBooking.owner_id}
          revieweeName={reviewBooking.listing_title}
          currentUser={currentUser}
          onClose={() => setReviewBooking(null)}
          onReviewAdded={() => { setReviewBooking(null); }}
          addToast={addToast}
        />
      )}
    </div>
  );
}
