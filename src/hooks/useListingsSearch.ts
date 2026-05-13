import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabase';
import { mapListingFromDb } from '../lib/mappers';
import type { Listing } from '../types';

interface UseListingsSearchReturn {
  results: Listing[];
  searching: boolean;
}

export function useListingsSearch(
  query: string,
  category: string,
  location: string,
  { allListings = [] }: { allListings?: Listing[] } = {}
): UseListingsSearchReturn {
  const [results, setResults] = useState<Listing[]>([]);
  const [searching, setSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (q: string, cat: string, loc: string) => {
    // No text query → filter client-side to preserve review/rating enrichment
    if (!q) {
      let filtered = allListings;
      if (cat) filtered = filtered.filter((l) => l.category === cat);
      if (loc) filtered = filtered.filter((l) => l.location?.toLowerCase().includes(loc.toLowerCase()));
      setResults(filtered);
      setSearching(false);
      return;
    }
    // Text query → hit Supabase for full-text match, then re-attach enriched data
    setSearching(true);
    try {
      let qb = supabase.from('listings').select('*')
        .or(`title.ilike.%${q}%,description.ilike.%${q}%`);
      if (cat) qb = qb.eq('category', cat);
      if (loc) qb = qb.ilike('location', `%${loc}%`);
      qb = qb.order('created_at', { ascending: false });
      const { data, error } = await qb;
      if (error) throw error;
      // Merge DB results with enriched allListings to preserve ratings
      const enrichedById = new Map(allListings.map((l) => [l.id, l]));
      setResults((data ?? []).map((row) => {
        const mapped = mapListingFromDb(row);
        return enrichedById.get(mapped.id) ?? mapped;
      }));
    } catch (err) {
      if (import.meta.env.DEV) console.warn('[useListingsSearch]', err);
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [allListings]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(query, category, location), 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query, category, location, doSearch]);

  return { results, searching };
}
