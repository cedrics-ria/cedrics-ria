-- ============================================================
-- ria — Row Level Security Policies
-- Ausführen im Supabase Dashboard → SQL Editor → Run
-- Idempotent: kann mehrfach ausgeführt werden
-- ============================================================

-- ── LISTINGS ────────────────────────────────────────────────
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "listings_select_all"   ON listings;
DROP POLICY IF EXISTS "listings_insert_owner" ON listings;
DROP POLICY IF EXISTS "listings_update_owner" ON listings;
DROP POLICY IF EXISTS "listings_delete_owner" ON listings;

-- Jeder kann Inserate lesen
CREATE POLICY "listings_select_all"
  ON listings FOR SELECT
  USING (true);

-- Nur eingeloggte User dürfen eigene Inserate erstellen
CREATE POLICY "listings_insert_owner"
  ON listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Nur der Besitzer darf sein Inserat bearbeiten
CREATE POLICY "listings_update_owner"
  ON listings FOR UPDATE
  USING (auth.uid() = user_id);

-- Nur der Besitzer darf sein Inserat löschen
CREATE POLICY "listings_delete_owner"
  ON listings FOR DELETE
  USING (auth.uid() = user_id);


-- ── BOOKINGS ─────────────────────────────────────────────────
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bookings_select_parties"  ON bookings;
DROP POLICY IF EXISTS "bookings_insert_requester" ON bookings;
DROP POLICY IF EXISTS "bookings_update_owner"     ON bookings;
DROP POLICY IF EXISTS "bookings_delete_requester" ON bookings;

-- Nur Mieter und Vermieter der Buchung dürfen sie sehen
CREATE POLICY "bookings_select_parties"
  ON bookings FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = owner_id);

-- Nur der Anfragende darf eine Buchung erstellen (für sich selbst)
CREATE POLICY "bookings_insert_requester"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = requester_id AND requester_id != owner_id);

-- Nur der Vermieter darf den Status ändern (annehmen/ablehnen)
CREATE POLICY "bookings_update_owner"
  ON bookings FOR UPDATE
  USING (auth.uid() = owner_id);

-- Anfragende dürfen eigene pending-Buchungen stornieren
CREATE POLICY "bookings_delete_requester"
  ON bookings FOR DELETE
  USING (auth.uid() = requester_id);


-- ── MESSAGES ─────────────────────────────────────────────────
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_select_parties"   ON messages;
DROP POLICY IF EXISTS "messages_insert_sender"    ON messages;

-- Nur Sender und Empfänger dürfen Nachrichten lesen
CREATE POLICY "messages_select_parties"
  ON messages FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Nur eingeloggte User dürfen Nachrichten senden (nicht an sich selbst)
CREATE POLICY "messages_insert_sender"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = from_user_id AND from_user_id != to_user_id);


-- ── PROFILES ─────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all"    ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own"    ON profiles;
DROP POLICY IF EXISTS "profiles_update_own"    ON profiles;

-- Jeder kann Profile lesen (für Anzeige von Owner-Namen etc.)
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  USING (true);

-- Nur eigenes Profil anlegen
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Nur eigenes Profil bearbeiten (kein is_admin / is_banned selbst setzen)
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- ── FAVORITES ────────────────────────────────────────────────
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "favorites_select_own"  ON favorites;
DROP POLICY IF EXISTS "favorites_insert_own"  ON favorites;
DROP POLICY IF EXISTS "favorites_delete_own"  ON favorites;

CREATE POLICY "favorites_select_own"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "favorites_insert_own"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favorites_delete_own"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);


-- ── REVIEWS ──────────────────────────────────────────────────
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_select_all"     ON reviews;
DROP POLICY IF EXISTS "reviews_insert_auth"    ON reviews;

-- Jeder kann Bewertungen lesen
CREATE POLICY "reviews_select_all"
  ON reviews FOR SELECT
  USING (true);

-- Nur eingeloggte User dürfen bewerten (nicht ihr eigenes Inserat)
CREATE POLICY "reviews_insert_auth"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);


-- ── PUSH SUBSCRIPTIONS ───────────────────────────────────────
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "push_select_own"   ON push_subscriptions;
DROP POLICY IF EXISTS "push_upsert_own"   ON push_subscriptions;
DROP POLICY IF EXISTS "push_delete_own"   ON push_subscriptions;

CREATE POLICY "push_select_own"
  ON push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "push_upsert_own"
  ON push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "push_delete_own"
  ON push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);


-- ── SUPPORT REQUESTS ─────────────────────────────────────────
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "support_insert_all"  ON support_requests;
DROP POLICY IF EXISTS "support_select_own"  ON support_requests;

-- Jeder (auch nicht eingeloggt) darf Support-Anfragen schicken
CREATE POLICY "support_insert_all"
  ON support_requests FOR INSERT
  WITH CHECK (true);

-- Nur der Einsender darf seine eigene Anfrage lesen
-- (Admins lesen über service_role_key in der API-Route)
CREATE POLICY "support_select_own"
  ON support_requests FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);
