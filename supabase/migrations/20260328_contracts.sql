CREATE TABLE IF NOT EXISTS contracts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id text NOT NULL,
  listing_title text NOT NULL,
  owner_id uuid NOT NULL,
  renter_id uuid NOT NULL,
  owner_name text NOT NULL DEFAULT '',
  renter_name text NOT NULL DEFAULT '',
  start_date date,
  end_date date,
  price_per_day text,
  kaution text,
  item_condition text,
  special_notes text,
  owner_signed_at timestamptz,
  renter_signed_at timestamptz,
  status text NOT NULL DEFAULT 'pending_renter'
    CHECK (status IN ('pending_renter', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contracts_select" ON contracts;
DROP POLICY IF EXISTS "contracts_insert" ON contracts;
DROP POLICY IF EXISTS "contracts_update" ON contracts;

CREATE POLICY "contracts_select" ON contracts FOR SELECT
  USING (auth.uid() = owner_id OR auth.uid() = renter_id);
CREATE POLICY "contracts_insert" ON contracts FOR INSERT
  WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "contracts_update" ON contracts FOR UPDATE
  USING (auth.uid() = renter_id AND status = 'pending_renter');
