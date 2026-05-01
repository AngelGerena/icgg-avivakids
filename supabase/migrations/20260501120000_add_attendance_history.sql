/*
  # Attendance History Table

  Tracks each individual check-in as a separate record so we can:
  - Show per-child attendance history
  - Generate monthly attendance reports for the Pastor
  - Track which Sundays a child attended
  - Calculate attendance rates per room and per child

  This is separate from the checked_in_today boolean on children,
  which resets each service day.
*/

CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE,
  child_number text NOT NULL,
  child_name text NOT NULL,
  room text,
  checked_in_at timestamptz DEFAULT now(),
  service_date date DEFAULT CURRENT_DATE,
  checked_in_by text DEFAULT 'staff'
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert attendance"
  ON attendance FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can view attendance"
  ON attendance FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete attendance"
  ON attendance FOR DELETE TO authenticated USING (true);

CREATE INDEX idx_attendance_child_id ON attendance(child_id);
CREATE INDEX idx_attendance_service_date ON attendance(service_date);
CREATE INDEX idx_attendance_child_number ON attendance(child_number);
