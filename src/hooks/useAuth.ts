import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import type { UserProfile } from '../types';

interface UseAuthReturn {
  currentUser: (UserProfile & { email: string; emailConfirmed: boolean }) | null;
  authLoading: boolean;
  setCurrentUser: React.Dispatch<React.SetStateAction<UseAuthReturn['currentUser']>>;
}

export function useAuth(): UseAuthReturn {
  const [currentUser, setCurrentUser] = useState<UseAuthReturn['currentUser']>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadUser(session: { user: { id: string; email?: string; email_confirmed_at?: string | null; user_metadata?: { name?: string } } } | null) {
      if (!session?.user) {
        if (mounted) { setCurrentUser(null); setAuthLoading(false); }
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      if (mounted) {
        setCurrentUser(
          data
            ? { ...data, email: session.user.email ?? '', emailConfirmed: !!session.user.email_confirmed_at }
            : null
        );
        setAuthLoading(false);
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => loadUser(session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUser(session);
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  return { currentUser, authLoading, setCurrentUser };
}
