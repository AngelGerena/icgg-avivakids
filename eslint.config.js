-- Add photo columns to parents table
ALTER TABLE parents ADD COLUMN IF NOT EXISTS primary_photo_url text;
ALTER TABLE parents ADD COLUMN IF NOT EXISTS secondary_photo_url text;
ALTER TABLE parents ADD COLUMN IF NOT EXISTS approved_pickup_name text;
ALTER TABLE parents ADD COLUMN IF NOT EXISTS approved_pickup_phone text;
ALTER TABLE parents ADD COLUMN IF NOT EXISTS approved_pickup_photo_url text;

-- Add photo to children table (may already exist)
ALTER TABLE children ADD COLUMN IF NOT EXISTS photo_url text;

-- Checkout log table
CREATE TABLE IF NOT EXISTS checkout_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE,
  child_number text NOT NULL,
  child_name text NOT NULL,
  checked_out_at timestamptz DEFAULT now(),
  checked_out_date date DEFAULT CURRENT_DATE,
  picked_up_by_name text NOT NULL,
  picked_up_by_relationship text NOT NULL,
  released_by_teacher text NOT NULL,
  notes text
);

ALTER TABLE checkout_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage checkout_log" ON checkout_log FOR ALL TO authenticated USING (true);
CREATE POLICY "Public can insert checkout_log" ON checkout_log FOR INSERT TO anon WITH CHECK (true);

-- Storage bucket for child/parent photos (run separately in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('aviva-kids-photos', 'aviva-kids-photos', true);
