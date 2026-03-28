-- ============================================================
-- ria — Admin-Override für RLS Policies
-- Problem: Die ersten Policies blockieren auch Admin-Operationen.
-- Fix: Admin-Hilfsfunktion + erweiterte Policies mit Admin-Ausnahme.
-- ============================================================

-- ── Admin-Hilfsfunktion (vermeidet Rekursion in profiles-Policies) ──
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;


-- ── LISTINGS: Admin darf alle Inserate bearbeiten / löschen ──────────
DROP POLICY IF EXISTS "listings_update_owner" ON listings;
DROP POLICY IF EXISTS "listings_delete_owner" ON listings;

CREATE POLICY "listings_update_owner"
  ON listings FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "listings_delete_owner"
  ON listings FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());


-- ── PROFILES: Admin darf is_banned setzen ────────────────────────────
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- Admin darf alle Profile lesen (war schon offen, zur Sicherheit nochmal)
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  USING (true);
