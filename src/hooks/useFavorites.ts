import { useState, useCallback, useRef } from 'react';
import { supabase } from '../supabase';

interface UseFavoritesReturn {
  favorites: string[];
  setFavorites: React.Dispatch<React.SetStateAction<string[]>>;
  loadFavorites: (userId: string) => Promise<void>;
  toggleFavorite: (userId: string, listingId: string) => Promise<void>;
}

export function useFavorites(): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<string[]>([]);
  const pendingRef = useRef<Set<string>>(new Set());

  const loadFavorites = useCallback(async (userId: string) => {
    if (!userId) return;
    try {
      const { data, error } = await supabase.from('favorites').select('listing_id').eq('user_id', userId);
      if (error) throw error;
      setFavorites((data ?? []).map((f: { listing_id: string }) => f.listing_id));
    } catch (err) {
      if (import.meta.env.DEV) console.warn('[useFavorites] loadFavorites:', err);
    }
  }, []);

  const toggleFavorite = useCallback(async (userId: string, listingId: string) => {
    if (!userId) return;
    // Prevent double-click race condition: ignore if this listingId is already in-flight
    if (pendingRef.current.has(listingId)) return;
    pendingRef.current.add(listingId);
    const isFav = favorites.includes(listingId);
    try {
      if (isFav) {
        await supabase.from('favorites').delete().eq('user_id', userId).eq('listing_id', listingId);
        setFavorites((prev) => prev.filter((id) => id !== listingId));
      } else {
        await supabase.from('favorites').insert([{ user_id: userId, listing_id: listingId }]);
        setFavorites((prev) => [...prev, listingId]);
      }
    } catch (err) {
      if (import.meta.env.DEV) console.warn('[useFavorites] toggleFavorite:', err);
    } finally {
      pendingRef.current.delete(listingId);
    }
  }, [favorites]);

  return { favorites, setFavorites, loadFavorites, toggleFavorite };
}
