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
    if (!q && !cat && !loc) {
      setResults(allListings);
      setSearching(false);
      return;
    }
    setSearching(true);
    try {
      let qb = supabase.from('listings').select('*').eq('is_available', true);
      if (q) qb = qb.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
      if (cat) qb = qb.eq('category', cat);
      if (loc) qb = qb.ilike('location', `%${loc}%`);
      qb = qb.order('created_at', { ascending: false });
      const { data, error } = await qb;
      if (error) throw error;
      setResults((data ?? []).map(mapListingFromDb));
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
