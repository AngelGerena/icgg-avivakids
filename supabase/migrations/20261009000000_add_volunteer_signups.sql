-- Parent volunteer sign-ups (Sundays, Thursdays, and special events)
CREATE TABLE IF NOT EXISTS volunteer_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_date date NOT NULL,
  slot_type text NOT NULL CHECK (slot_type IN ('sunday', 'thursday', 'event')),
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  slot_label text,
  full_name text NOT NULL CHECK (char_length(trim(full_name)) BETWEEN 2 AND 120),
  email text NOT NULL CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text NOT NULL CHECK (char_length(regexp_replace(phone, '\D', '', 'g')) BETWEEN 10 AND 15),
  created_at timestamptz DEFAULT now()
);

-- One sign-up per person per slot (same email can't double-book the same day/event)
CREATE UNIQUE INDEX IF NOT EXISTS volunteer_signups_unique_person_slot
  ON volunteer_signups (volunteer_date, slot_type, COALESCE(event_id, '00000000-0000-0000-0000-000000000000'::uuid), lower(email));

CREATE INDEX IF NOT EXISTS volunteer_signups_date_idx ON volunteer_signups (volunteer_date);

ALTER TABLE volunteer_signups ENABLE ROW LEVEL SECURITY;

-- Parents (not logged in) can sign up, but only for today or a future date
DROP POLICY IF EXISTS "Anyone can sign up to volunteer" ON volunteer_signups;
CREATE POLICY "Anyone can sign up to volunteer"
  ON volunteer_signups FOR INSERT TO anon, authenticated
  WITH CHECK (volunteer_date >= CURRENT_DATE);

-- Only staff (logged in to the portal) can see and manage the volunteer list
DROP POLICY IF EXISTS "Staff can view volunteers" ON volunteer_signups;
CREATE POLICY "Staff can view volunteers"
  ON volunteer_signups FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Staff can delete volunteers" ON volunteer_signups;
CREATE POLICY "Staff can delete volunteers"
  ON volunteer_signups FOR DELETE TO authenticated USING (true);

-- Public calendar shows how many helpers each day has, without exposing names or contact info
CREATE OR REPLACE FUNCTION volunteer_counts(start_date date, end_date date)
RETURNS TABLE (volunteer_date date, total bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT v.volunteer_date, count(*)::bigint
  FROM volunteer_signups v
  WHERE v.volunteer_date BETWEEN start_date AND end_date
  GROUP BY v.volunteer_date;
$$;

GRANT EXECUTE ON FUNCTION volunteer_counts(date, date) TO anon, authenticated;
