import { useState, useMemo, useRef, useEffect } from 'react';
import { supabase } from '../supabase';
import { mapListingFromDb } from '../lib/mappers';
import type { Listing, AppUser } from '../types';

interface UseListingActionsOptions {
  currentUser: AppUser | null;
  isAdmin: boolean;
  addToast: (text: string, type?: string) => void;
  /** Called when a ?inserat=<id> deep-link resolves to a listing on initial load. */
  onPendingListing: (listing: Listing) => void;
}

export function useListingActions({ currentUser, isAdmin, addToast, onPendingListing }: UseListingActionsOptions) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [allReviews, setAllReviews] = useState<{ listing_id: string; rating: number }[]>([]);
  const pendingListingIdRef = useRef<string | null>(null);

  const enrichedListings = useMemo(() => {
    const map: Record<string, { sum: number; count: number }> = {};
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
    const mapped = (data || []).map(mapListingFromDb);
    setListings(mapped);
    setLoading(false);
    if (pendingListingIdRef.current) {
      const target = mapped.find((l) => String(l.id) === pendingListingIdRef.current);
      pendingListingIdRef.current = null;
      if (target) onPendingListing(target);
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

  // Initial load on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inseratId = params.get('inserat');
    if (inseratId) pendingListingIdRef.current = inseratId;
    void loadListings();
    void loadAllReviews();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleReviewAdded(listingId: string | number, rating: number) {
    setAllReviews((prev) => [...prev, { listing_id: String(listingId), rating }]);
  }

  async function addListing(newListing: Record<string, unknown>): Promise<Listing | false> {
    const payload = {
      title: newListing.title, price: newListing.price, location: newListing.location,
      image: newListing.image, images: (newListing.images as string[]) || [], category: newListing.category,
      description: newListing.description, user_id: newListing.userId,
      owner_name: (newListing.ownerName as string) || currentUser?.name || 'Ria Mitglied',
      is_available: true, kaution: newListing.kaution || null,
      payment_methods: (newListing.paymentMethods as string[]) || [], plz: newListing.plz || null,
    };
    const { data, error } = await supabase.from('listings').insert(payload).select().single();
    if (error) {
      console.error('[addListing]', error);
      addToast('Inserat konnte nicht gespeichert werden. Bitte versuche es erneut.', 'error');
      return false;
    }
    const inserted = mapListingFromDb(data);
    setListings((prev) => [inserted, ...prev]);
    return inserted;
  }

  async function updateListing(id: string, updates: Record<string, unknown>): Promise<boolean> {
    if (!currentUser) { addToast('Nicht angemeldet.', 'error'); return false; }
    const payload = {
      title: updates.title, price: updates.price, location: updates.location,
      image: updates.image, category: updates.category, description: updates.description,
      kaution: updates.kaution || null, payment_methods: (updates.paymentMethods as string[]) || [],
      plz: updates.plz || null,
    };
    // Admins can edit any listing; regular users only their own (enforced in DB query)
    let query = supabase.from('listings').update(payload).eq('id', id);
    if (!isAdmin) query = query.eq('user_id', currentUser.id);
    const { error } = await query.select().single();
    if (error) {
      console.error('[updateListing]', error);
      addToast('Änderungen konnten nicht gespeichert werden. Bitte versuche es erneut.', 'error');
      return false;
    }
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } as Listing : l)));
    addToast('Inserat gespeichert.', 'info');
    return true;
  }

  async function deleteListing(id: string) {
    if (!currentUser) return;
    // Admins can delete any listing; regular users only their own (enforced in DB query)
    let query = supabase.from('listings').delete().eq('id', id);
    if (!isAdmin) query = query.eq('user_id', currentUser.id);
    const { error } = await query;
    if (error) { console.error('[deleteListing]', error); addToast('Fehler beim Löschen.', 'error'); return; }
    setListings((prev) => prev.filter((l) => l.id !== id));
    addToast('Inserat gelöscht.', 'info');
  }

  async function toggleAvailability(id: string, isAvailable: boolean) {
    if (!currentUser) return;
    let query = supabase.from('listings').update({ is_available: isAvailable }).eq('id', id);
    if (!isAdmin) query = query.eq('user_id', currentUser.id);
    const { error } = await query;
    if (error) { console.error('[toggleAvailability]', error); addToast('Verfügbarkeit konnte nicht geändert werden.', 'error'); return; }
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, isAvailable } : l)));
    addToast(isAvailable ? 'Inserat wieder verfügbar ✓' : 'Als vergeben markiert.', 'info');
  }

  return {
    listings,
    setListings,
    loading,
    enrichedListings,
    loadListings,
    handleReviewAdded,
    addListing,
    updateListing,
    deleteListing,
    toggleAvailability,
  };
}
