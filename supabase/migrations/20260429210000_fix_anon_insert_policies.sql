/*
  # Fix anonymous intake form and check-in submission

  ## Problem
  The migration 20260407200846_fix_security_issues.sql locked INSERT on children,
  parents, and intake_forms to authenticated users only (using auth.uid() IS NOT NULL).

  The follow-up migration 20260429202437_allow_anon_intake_form_insert.sql added
  anon INSERT policies but did NOT drop the conflicting authenticated-only ones.

  In PostgreSQL RLS, policies for a given role are OR'd together. However, the
  authenticated-only policy targets only the `authenticated` role, and the anon
  policy targets only `anon`. Since the anon role is separate from authenticated,
  having both policies is fine in theory. BUT the security migration used
  `WITH CHECK (auth.uid() IS NOT NULL)` which is redundant with the role target
  and may cause confusion. The real issue is that if both policies exist with
  the same name from different migrations, Postgres will error on CREATE.

  ## Fix
  Drop ALL existing INSERT policies on children, parents, and intake_forms,
  then recreate a single INSERT policy per table that allows BOTH anon and
  authenticated roles to insert. This is correct because:
  
  - The intake form is filled by parents (anon, not logged in)
  - The check-in form is also filled by parents (anon, not logged in)
  - The teacher portal inserts children/parents when doing admin tasks (authenticated)
  
  UPDATE and DELETE operations remain authenticated-only (teacher portal).
*/

-- ============================================================
-- Children table: allow both anon and authenticated to INSERT
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can insert children" ON children;
DROP POLICY IF EXISTS "Anyone can insert children" ON children;
DROP POLICY IF EXISTS "Anon can insert children" ON children;

CREATE POLICY "Anyone can insert children"
  ON children FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ============================================================
-- Parents table: allow both anon and authenticated to INSERT
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can insert parents" ON parents;
DROP POLICY IF EXISTS "Anyone can insert parents" ON parents;
DROP POLICY IF EXISTS "Anon can insert parents" ON parents;

CREATE POLICY "Anyone can insert parents"
  ON parents FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ============================================================
-- Intake forms table: allow both anon and authenticated to INSERT
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can insert intake forms" ON intake_forms;
DROP POLICY IF EXISTS "Anyone can insert intake forms" ON intake_forms;
DROP POLICY IF EXISTS "Anon can insert intake forms" ON intake_forms;

CREATE POLICY "Anyone can insert intake forms"
  ON intake_forms FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ============================================================
-- Recreate useful indexes that were dropped by the security migration
-- These improve query performance for common lookups
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_children_unique_number ON children(unique_number);
CREATE INDEX IF NOT EXISTS idx_children_checked_in ON children(checked_in_today);
CREATE INDEX IF NOT EXISTS idx_parents_child_id ON parents(child_id);
CREATE INDEX IF NOT EXISTS idx_intake_forms_child_id ON intake_forms(child_id);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(resolved);
