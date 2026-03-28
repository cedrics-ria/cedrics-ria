import { useState, useCallback } from 'react';
import { supabase } from '../supabase';
import type { SupportRequest } from '../types';

interface UseSupportRequestsReturn {
  supportRequests: SupportRequest[];
  setSupportRequests: React.Dispatch<React.SetStateAction<SupportRequest[]>>;
  loadSupportRequests: () => Promise<void>;
  markSupportRequestRead: (id: string) => Promise<void>;
}

export function useSupportRequests(): UseSupportRequestsReturn {
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);

  const loadSupportRequests = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('support_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setSupportRequests((data ?? []) as SupportRequest[]);
    } catch (err) {
      if (import.meta.env.DEV) console.warn('[useSupportRequests] load:', err);
    }
  }, []);

  const markSupportRequestRead = useCallback(async (id: string) => {
    try {
      await supabase.from('support_requests').update({ read: true }).eq('id', id);
      setSupportRequests((prev) => prev.map((r) => (r.id === id ? { ...r, read: true } : r)));
    } catch (err) {
      if (import.meta.env.DEV) console.warn('[useSupportRequests] markRead:', err);
    }
  }, []);

  return { supportRequests, setSupportRequests, loadSupportRequests, markSupportRequestRead };
}
