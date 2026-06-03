-- VBS Settings table (one row per year)
CREATE TABLE IF NOT EXISTS vbs_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year int NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  theme text NOT NULL DEFAULT 'under-the-sea',
  title text NOT NULL DEFAULT 'VBS 2026',
  start_date date,
  end_date date,
  active_days text[] DEFAULT ARRAY['monday','tuesday','wednesday','thursday','friday'],
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- VBS Children table
CREATE TABLE IF NOT EXISTS vbs_children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  dob date,
  age int,
  grade text,
  group_name text,
  parent_name text NOT NULL,
  parent_phone text NOT NULL,
  parent_email text,
  is_first_time boolean DEFAULT false,
  registered_by text DEFAULT 'online',
  registration_date timestamptz DEFAULT now(),
  unique_code text UNIQUE NOT NULL,
  year int DEFAULT EXTRACT(YEAR FROM NOW())
);

-- VBS Attendance table (one row per child per day)
CREATE TABLE IF NOT EXISTS vbs_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES vbs_children(id) ON DELETE CASCADE,
  date date NOT NULL,
  present boolean DEFAULT true,
  checked_in_at timestamptz DEFAULT now(),
  checked_in_by text DEFAULT 'staff'
);

-- RLS Policies
ALTER TABLE vbs_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vbs_children ENABLE ROW LEVEL SECURITY;
ALTER TABLE vbs_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read vbs_settings" ON vbs_settings FOR SELECT TO anon USING (true);
CREATE POLICY "Authenticated can manage vbs_settings" ON vbs_settings FOR ALL TO authenticated USING (true);

CREATE POLICY "Anyone can insert vbs_children" ON vbs_children FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public can read vbs_children" ON vbs_children FOR SELECT TO anon USING (true);
CREATE POLICY "Authenticated can manage vbs_children" ON vbs_children FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated can manage vbs_attendance" ON vbs_attendance FOR ALL TO authenticated USING (true);
CREATE POLICY "Public can read vbs_attendance" ON vbs_attendance FOR SELECT TO anon USING (true);
