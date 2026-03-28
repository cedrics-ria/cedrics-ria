CREATE TABLE IF NOT EXISTS handover_protocols (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id text NOT NULL,
  listing_title text NOT NULL DEFAULT '',
  lender_id uuid NOT NULL,
  lender_name text NOT NULL DEFAULT '',
  borrower_id uuid NOT NULL,
  borrower_name text NOT NULL DEFAULT '',
  condition text NOT NULL,
  handover_date date NOT NULL,
  notes text,
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE handover_protocols ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hp_select" ON handover_protocols;
DROP POLICY IF EXISTS "hp_insert" ON handover_protocols;

-- Nur Verleiher und Mieter dürfen das Protokoll sehen
CREATE POLICY "hp_select" ON handover_protocols FOR SELECT
  USING (auth.uid() = lender_id OR auth.uid() = borrower_id);

-- Beide Parteien dürfen ein Protokoll erstellen
CREATE POLICY "hp_insert" ON handover_protocols FOR INSERT
  WITH CHECK (auth.uid() = lender_id OR auth.uid() = borrower_id);
