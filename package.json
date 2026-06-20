-- Add photo columns to parents table
ALTER TABLE parents ADD COLUMN IF NOT EXISTS primary_photo_url text;
ALTER TABLE parents ADD COLUMN IF NOT EXISTS secondary_photo_url text;
ALTER TABLE parents ADD COLUMN IF NOT EXISTS approved_pickup_name text;
ALTER TABLE parents ADD COLUMN IF NOT EXISTS approved_pickup_phone text;
ALTER TABLE parents ADD COLUMN IF NOT EXISTS approved_pickup_photo_url text;

-- Checkout records table
CREATE TABLE IF NOT EXISTS checkouts (
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

ALTER TABLE checkouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage checkouts" ON checkouts FOR ALL TO authenticated USING (true);
CREATE POLICY "Public can read checkouts" ON checkouts FOR SELECT TO anon USING (true);

-- Storage buckets (run separately in Supabase dashboard if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('child-photos', 'child-photos', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('parent-photos', 'parent-photos', true) ON CONFLICT DO NOTHING;

-- Add alert_type to alerts table
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS alert_type text DEFAULT 'general';

-- Add flyer_url to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS flyer_url text;
