-- ============================================================
-- ria — Profil-Fix + saubere Admin-Policies
-- Problem: is_admin() Funktion verursacht Fehler beim Profil laden/speichern
-- Fix 1: Admin-Check via auth.email() statt Funktion (kein Rekursionsrisiko)
-- Fix 2: Trigger der Profil automatisch beim Registrieren anlegt
-- Fix 3: Backfill für bestehende User ohne Profil-Eintrag
-- ============================================================

-- ── 1. Problematische Funktion entfernen ─────────────────────
DROP FUNCTION IF EXISTS public.is_admin();


-- ── 2. Listings-Policies: Admin via auth.email() ─────────────
DROP POLICY IF EXISTS "listings_update_owner" ON listings;
DROP POLICY IF EXISTS "listings_delete_owner" ON listings;

CREATE POLICY "listings_update_owner"
  ON listings FOR UPDATE
  USING (auth.uid() = user_id OR auth.email() = 'cedric.s.renner@gmail.com');

CREATE POLICY "listings_delete_owner"
  ON listings FOR DELETE
  USING (auth.uid() = user_id OR auth.email() = 'cedric.s.renner@gmail.com');


-- ── 3. Profiles-Policies fixen ────────────────────────────────
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING  (auth.uid() = id OR auth.email() = 'cedric.s.renner@gmail.com')
  WITH CHECK (auth.uid() = id OR auth.email() = 'cedric.s.renner@gmail.com');

-- Sicherstellen dass SELECT offen ist
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  USING (true);

-- Sicherstellen dass INSERT funktioniert (für Upsert)
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);


-- ── 4. Trigger: Profil automatisch bei Registrierung anlegen ──
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ── 5. Backfill: Profil für bestehende User ohne Eintrag ──────
INSERT INTO public.profiles (id, name, email, created_at, updated_at)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
  au.email,
  NOW(),
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;
