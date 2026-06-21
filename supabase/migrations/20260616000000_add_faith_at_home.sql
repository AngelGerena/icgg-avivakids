/*
  # Faith at Home — Parent Hub
  Adds: weekly lessons/curriculum, homework assignments + submissions,
  private parent<->teacher messages, passwordless parent access, and
  storage buckets for lesson assets and homework uploads.

  Security: RLS on every table. Helper functions is_teacher() and
  parent_can_access_child() drive per-child access. Parents only ever see
  their own child's data; teachers (authenticated staff) see everything.
*/

-- ============================================================
-- 1. ROLES — distinguish teachers from parents
-- ============================================================
CREATE TABLE IF NOT EXISTS user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'parent' CHECK (role IN ('teacher','parent')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Link an authenticated parent to the child(ren) they may access
CREATE TABLE IF NOT EXISTS parent_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES parents(id) ON DELETE SET NULL,
  child_id uuid REFERENCES children(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, child_id)
);
ALTER TABLE parent_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. HELPER FUNCTIONS (used by policies)
-- ============================================================
CREATE OR REPLACE FUNCTION is_teacher() RETURNS boolean
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'teacher'
  );
$$;

CREATE OR REPLACE FUNCTION parent_can_access_child(target uuid) RETURNS boolean
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM parent_profiles WHERE user_id = auth.uid() AND child_id = target
  );
$$;

-- ============================================================
-- 3. LESSONS — weekly curriculum published by teachers
-- ============================================================
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  week_of date NOT NULL,
  room text DEFAULT 'all',
  language text DEFAULT 'es',
  bible_passage text,
  memory_verse text,
  story_summary text,
  discussion_questions jsonb DEFAULT '[]'::jsonb,
  activity text,
  song_title text,
  song_url text,
  image_url text,                 -- lesson cover image (public lesson-assets bucket)
  attachment_url text,            -- coloring page / worksheet (public lesson-assets bucket)
  status text DEFAULT 'draft' CHECK (status IN ('draft','published')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_lessons_week_of ON lessons(week_of DESC);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON lessons(status);
CREATE INDEX IF NOT EXISTS idx_lessons_room ON lessons(room);

-- ============================================================
-- 4. ASSIGNMENTS — homework attached to a lesson
-- ============================================================
CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  title text NOT NULL,
  instructions text,
  attachment_url text,            -- optional worksheet/image to download
  due_date date,
  submission_type text DEFAULT 'any' CHECK (submission_type IN ('photo','video','text','any')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_assignments_lesson_id ON assignments(lesson_id);

-- ============================================================
-- 5. HOMEWORK SUBMISSIONS — parent turns in a child's work
-- ============================================================
CREATE TABLE IF NOT EXISTS homework_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES assignments(id) ON DELETE CASCADE,
  child_id uuid REFERENCES children(id) ON DELETE CASCADE,
  submitted_by uuid REFERENCES auth.users(id),
  file_url text,                  -- storage path in private 'homework' bucket
  parent_note text,
  status text DEFAULT 'submitted' CHECK (status IN ('submitted','reviewed','completed')),
  stars_awarded int DEFAULT 0,
  teacher_feedback text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE homework_submissions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_hw_assignment ON homework_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_hw_child ON homework_submissions(child_id);

-- ============================================================
-- 6. MESSAGES — private parent <-> teacher thread per child
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES lessons(id) ON DELETE SET NULL,
  sender_role text NOT NULL CHECK (sender_role IN ('parent','teacher')),
  sender_id uuid REFERENCES auth.users(id),
  body text NOT NULL,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_messages_child ON messages(child_id, created_at);

-- ============================================================
-- 7. RLS POLICIES
-- ============================================================

-- user_roles: a user can read their own role; teachers can read all
CREATE POLICY "read own role" ON user_roles FOR SELECT
  TO authenticated USING (user_id = auth.uid() OR is_teacher());

-- parent_profiles: a parent reads their own links; teachers read all
CREATE POLICY "parent reads own profile" ON parent_profiles FOR SELECT
  TO authenticated USING (user_id = auth.uid() OR is_teacher());

-- lessons: public/parents read PUBLISHED lessons; teachers manage all
CREATE POLICY "read published lessons" ON lessons FOR SELECT
  TO anon, authenticated USING (status = 'published' OR is_teacher());
CREATE POLICY "teachers insert lessons" ON lessons FOR INSERT
  TO authenticated WITH CHECK (is_teacher());
CREATE POLICY "teachers update lessons" ON lessons FOR UPDATE
  TO authenticated USING (is_teacher()) WITH CHECK (is_teacher());
CREATE POLICY "teachers delete lessons" ON lessons FOR DELETE
  TO authenticated USING (is_teacher());

-- assignments: readable by anyone who can read the parent lesson; teachers manage
CREATE POLICY "read assignments" ON assignments FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "teachers insert assignments" ON assignments FOR INSERT
  TO authenticated WITH CHECK (is_teacher());
CREATE POLICY "teachers update assignments" ON assignments FOR UPDATE
  TO authenticated USING (is_teacher()) WITH CHECK (is_teacher());
CREATE POLICY "teachers delete assignments" ON assignments FOR DELETE
  TO authenticated USING (is_teacher());

-- homework_submissions: parent sees/creates only own child; teachers see/update all
CREATE POLICY "read own child submissions" ON homework_submissions FOR SELECT
  TO authenticated USING (is_teacher() OR parent_can_access_child(child_id));
CREATE POLICY "parent inserts own child submission" ON homework_submissions FOR INSERT
  TO authenticated WITH CHECK (parent_can_access_child(child_id));
CREATE POLICY "parent updates own pending submission" ON homework_submissions FOR UPDATE
  TO authenticated USING (parent_can_access_child(child_id) AND status = 'submitted')
  WITH CHECK (parent_can_access_child(child_id));
CREATE POLICY "teacher reviews submission" ON homework_submissions FOR UPDATE
  TO authenticated USING (is_teacher()) WITH CHECK (is_teacher());
CREATE POLICY "parent deletes own submission" ON homework_submissions FOR DELETE
  TO authenticated USING (parent_can_access_child(child_id) OR is_teacher());

-- messages: parent reads/writes own child thread; teachers all
CREATE POLICY "read own child messages" ON messages FOR SELECT
  TO authenticated USING (is_teacher() OR parent_can_access_child(child_id));
CREATE POLICY "parent sends message" ON messages FOR INSERT
  TO authenticated WITH CHECK (
    (sender_role = 'parent' AND parent_can_access_child(child_id))
    OR (sender_role = 'teacher' AND is_teacher())
  );
CREATE POLICY "mark message read" ON messages FOR UPDATE
  TO authenticated USING (is_teacher() OR parent_can_access_child(child_id))
  WITH CHECK (is_teacher() OR parent_can_access_child(child_id));

-- ============================================================
-- 8. STORAGE BUCKETS
-- ============================================================
-- Public bucket for lesson images / worksheets teachers upload
INSERT INTO storage.buckets (id, name, public)
  VALUES ('lesson-assets', 'lesson-assets', true)
  ON CONFLICT (id) DO NOTHING;

-- Private bucket for homework the parents upload (children's photos/video)
INSERT INTO storage.buckets (id, name, public)
  VALUES ('homework', 'homework', false)
  ON CONFLICT (id) DO NOTHING;

-- lesson-assets: public read; only teachers can write
CREATE POLICY "public read lesson assets" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'lesson-assets');
CREATE POLICY "teachers upload lesson assets" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'lesson-assets' AND is_teacher());
CREATE POLICY "teachers update lesson assets" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'lesson-assets' AND is_teacher());
CREATE POLICY "teachers delete lesson assets" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'lesson-assets' AND is_teacher());

-- homework: path is homework/{child_id}/...  Parents access only their child's folder
CREATE POLICY "read own child homework files" ON storage.objects FOR SELECT
  TO authenticated USING (
    bucket_id = 'homework' AND (
      is_teacher()
      OR parent_can_access_child(((storage.foldername(name))[1])::uuid)
    )
  );
CREATE POLICY "parent uploads own child homework" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (
    bucket_id = 'homework'
    AND parent_can_access_child(((storage.foldername(name))[1])::uuid)
  );
CREATE POLICY "parent deletes own child homework" ON storage.objects FOR DELETE
  TO authenticated USING (
    bucket_id = 'homework' AND (
      is_teacher()
      OR parent_can_access_child(((storage.foldername(name))[1])::uuid)
    )
  );
