/*
  # Children's Ministry Database Schema
  
  1. New Tables
    - children: stores child information and check-in data
    - parents: stores parent/guardian contact information
    - intake_forms: stores medical and legal intake information
    - events: stores calendar events
    - alerts: stores realtime parent alert notifications
      
  2. Security
    - Enable RLS on all tables
    - Public read access for events and children (for parent-facing views)
    - Authenticated-only write access (for teacher portal)
    - Alerts table has public read for realtime broadcasting
*/

-- Create children table
CREATE TABLE IF NOT EXISTS children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  nickname text,
  dob date NOT NULL,
  gender text,
  photo_url text,
  room text NOT NULL,
  unique_number text UNIQUE NOT NULL,
  checked_in_today boolean DEFAULT false,
  check_in_time timestamptz,
  birthday_celebrated boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create parents table
CREATE TABLE IF NOT EXISTS parents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE,
  primary_name text NOT NULL,
  primary_relationship text NOT NULL,
  primary_phone text NOT NULL,
  primary_email text NOT NULL,
  secondary_name text,
  secondary_relationship text,
  secondary_phone text,
  created_at timestamptz DEFAULT now()
);

-- Create intake_forms table
CREATE TABLE IF NOT EXISTS intake_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid UNIQUE REFERENCES children(id) ON DELETE CASCADE,
  allergies text[],
  restricted_foods text,
  medications jsonb,
  medical_conditions text,
  special_needs text,
  medication_authorized boolean DEFAULT false,
  doctor_name text,
  doctor_phone text,
  behavioral_notes text,
  triggers text,
  communication_notes text,
  photo_consent boolean DEFAULT false,
  medical_consent boolean DEFAULT false,
  digital_signature text NOT NULL,
  submitted_at timestamptz DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date date NOT NULL,
  time time,
  description text,
  location text,
  category text,
  color text,
  created_at timestamptz DEFAULT now()
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_number text NOT NULL,
  reason text NOT NULL,
  triggered_at timestamptz DEFAULT now(),
  resolved boolean DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for children table
CREATE POLICY "Anyone can view children"
  ON children FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert children"
  ON children FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update children"
  ON children FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for parents table
CREATE POLICY "Anyone can view parents"
  ON parents FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert parents"
  ON parents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update parents"
  ON parents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for intake_forms table
CREATE POLICY "Anyone can view intake forms"
  ON intake_forms FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert intake forms"
  ON intake_forms FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update intake forms"
  ON intake_forms FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for events table
CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete events"
  ON events FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for alerts table (public read for realtime broadcasting)
CREATE POLICY "Anyone can view alerts"
  ON alerts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert alerts"
  ON alerts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update alerts"
  ON alerts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_children_unique_number ON children(unique_number);
CREATE INDEX IF NOT EXISTS idx_children_dob ON children(dob);
CREATE INDEX IF NOT EXISTS idx_children_checked_in ON children(checked_in_today);
CREATE INDEX IF NOT EXISTS idx_parents_child_id ON parents(child_id);
CREATE INDEX IF NOT EXISTS idx_intake_forms_child_id ON intake_forms(child_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(resolved);
