import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { ADMIN_EMAIL, STORAGE_KEYS } from '../constants';
import type { AppUser, UserProfile } from '../types';

function buildSessionUser(user: { id: string; user_metadata?: { name?: string }; email?: string; email_confirmed_at?: string | null }): AppUser {
  return {
    id: user.id,
    name: user.user_metadata?.name || 'User',
    email: user.email ?? '',
    emailConfirmed: !!user.email_confirmed_at,
  };
}

function loadHiddenThreadsFromLocalStorage(userId: string): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEYS.hiddenThreads(userId)) || '[]'));
  } catch {
    return new Set();
  }
}

interface AuthSyncOptions {
  /** Called whenever a user session is established (initial load, login, or token refresh). */
  onUserReady: (user: AppUser) => void;
  /** Called when the user signs out or the session expires. */
  onUserGone: () => void;
  setCurrentPage: (page: string) => void;
}

export function useAuthSync({ onUserReady, onUserGone, setCurrentPage }: AuthSyncOptions) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return saved ? (JSON.parse(saved) as AppUser) : null;
    } catch { return null; }
  });
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hiddenThreads, setHiddenThreads] = useState<Set<string>>(new Set());

  // Use refs so the auth listener never closes over stale callbacks
  const onUserReadyRef = useRef(onUserReady);
  onUserReadyRef.current = onUserReady;
  const onUserGoneRef = useRef(onUserGone);
  onUserGoneRef.current = onUserGone;

  async function fetchProfile(userId: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) {
      setProfile(data as UserProfile);
      // Load hidden threads from DB (authoritative), fall back to localStorage for offline/first-load
      const dbKeys: string[] = Array.isArray(data.hidden_thread_keys) ? data.hidden_thread_keys : [];
      const lsKeys = loadHiddenThreadsFromLocalStorage(userId);
      const merged = new Set([...dbKeys, ...lsKeys]);
      setHiddenThreads(merged);
      // If localStorage had extras that weren't in DB, persist merged set back to DB
      if (lsKeys.size > 0 && dbKeys.length < merged.size) {
        void supabase.from('profiles').update({ hidden_thread_keys: [...merged] }).eq('id', userId);
        // Clear localStorage now that DB is the source of truth
        localStorage.removeItem(STORAGE_KEYS.hiddenThreads(userId));
      }
    }
  }

  function applyRawUser(rawUser: Parameters<typeof buildSessionUser>[0]) {
    const u = buildSessionUser(rawUser);
    setCurrentUser(u);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(u));
    // Load from localStorage immediately so UI isn't empty while fetchProfile runs
    setHiddenThreads(loadHiddenThreadsFromLocalStorage(u.id));
    void fetchProfile(u.id);
    onUserReadyRef.current(u);
  }

  function clearAuth() {
    setCurrentUser(null);
    setProfile(null);
    setHiddenThreads(new Set());
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    onUserGoneRef.current();
  }

  useEffect(() => {
    // Restore session on initial mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) applyRawUser(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') { setCurrentPage('reset-password'); return; }
      if (session?.user) applyRawUser(session.user);
      else clearAuth();
    });

    return () => subscription.unsubscribe();
  // Intentionally [] — listener must only be registered once on mount.
  // applyRawUser/clearAuth access callbacks via refs so they never go stale.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Called from LoginPage after a successful sign-in (receives already-shaped app user). */
  function handleLogin(appUser: AppUser, isNew = false) {
    setCurrentUser(appUser);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(appUser));
    setHiddenThreads(loadHiddenThreadsFromLocalStorage(appUser.id));
    void fetchProfile(appUser.id);
    onUserReadyRef.current(appUser);
    if (isNew) setShowOnboarding(true);
    setCurrentPage('home');
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    clearAuth();
    setCurrentPage('home');
  }

  return {
    currentUser,
    setCurrentUser,
    profile,
    setProfile,
    showOnboarding,
    setShowOnboarding,
    hiddenThreads,
    setHiddenThreads,
    handleLogin,
    handleLogout,
    isAdmin: currentUser?.email === ADMIN_EMAIL || profile?.is_admin === true,
  };
}
