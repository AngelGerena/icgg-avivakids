-- ICGG Aviva Kids — Setup for photos, checkout, and pickup alerts
-- Safe to run multiple times (idempotent).

-- 1) COLUMNS ------------------------------------------------------------
ALTER TABLE parents  ADD COLUMN IF NOT EXISTS primary_photo_url text;
ALTER TABLE parents  ADD COLUMN IF NOT EXISTS secondary_photo_url text;
ALTER TABLE parents  ADD COLUMN IF NOT EXISTS approved_pickup_name text;
ALTER TABLE parents  ADD COLUMN IF NOT EXISTS approved_pickup_phone text;
ALTER TABLE parents  ADD COLUMN IF NOT EXISTS approved_pickup_photo_url text;

ALTER TABLE children ADD COLUMN IF NOT EXISTS photo_url text;

ALTER TABLE alerts   ADD COLUMN IF NOT EXISTS alert_type text DEFAULT 'general';
ALTER TABLE alerts   ADD COLUMN IF NOT EXISTS pickup_photo_url text;
ALTER TABLE alerts   ADD COLUMN IF NOT EXISTS pickup_name text;

ALTER TABLE events   ADD COLUMN IF NOT EXISTS flyer_url text;

-- 2) CHECKOUTS TABLE ----------------------------------------------------
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
DROP POLICY IF EXISTS "Authenticated can manage checkouts" ON checkouts;
CREATE POLICY "Authenticated can manage checkouts" ON checkouts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public can read checkouts" ON checkouts;
CREATE POLICY "Public can read checkouts" ON checkouts
  FOR SELECT TO anon USING (true);

-- 3) STORAGE BUCKETS (public so photos display in browsers) --------------
INSERT INTO storage.buckets (id, name, public) VALUES ('child-photos', 'child-photos', true)
  ON CONFLICT (id) DO UPDATE SET public = true;
INSERT INTO storage.buckets (id, name, public) VALUES ('parent-photos', 'parent-photos', true)
  ON CONFLICT (id) DO UPDATE SET public = true;

-- 4) STORAGE POLICIES ---------------------------------------------------
-- Public can read photos; the public intake form (anon) and staff (authenticated) can upload.
DROP POLICY IF EXISTS "Public read child photos" ON storage.objects;
CREATE POLICY "Public read child photos" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'child-photos');
DROP POLICY IF EXISTS "Anyone can upload child photos" ON storage.objects;
CREATE POLICY "Anyone can upload child photos" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'child-photos');
DROP POLICY IF EXISTS "Staff manage child photos" ON storage.objects;
CREATE POLICY "Staff manage child photos" ON storage.objects
  FOR UPDATE TO anon, authenticated USING (bucket_id = 'child-photos') WITH CHECK (bucket_id = 'child-photos');

DROP POLICY IF EXISTS "Public read parent photos" ON storage.objects;
CREATE POLICY "Public read parent photos" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'parent-photos');
DROP POLICY IF EXISTS "Anyone can upload parent photos" ON storage.objects;
CREATE POLICY "Anyone can upload parent photos" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'parent-photos');
DROP POLICY IF EXISTS "Staff manage parent photos" ON storage.objects;
CREATE POLICY "Staff manage parent photos" ON storage.objects
  FOR UPDATE TO anon, authenticated USING (bucket_id = 'parent-photos') WITH CHECK (bucket_id = 'parent-photos');
