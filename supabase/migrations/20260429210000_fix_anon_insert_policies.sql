/*
  # Fix anonymous intake form submission

  ## Problem
  The migration 20260407200846_fix_security_issues.sql locked INSERT on children,
  parents, and intake_forms to authenticated users only.

  The follow-up migration 20260429202437_allow_anon_intake_form_insert.sql added
  anon INSERT policies but did NOT drop the conflicting authenticated-only ones.

  Supabase/Postgres RLS evaluates ALL policies for a role. Since anon is not
  authenticated, the authenticated INSERT policy does not grant access, and the
  result is a permission denied error even with the anon policy present.

  ## Fix
  Drop the authenticated-only INSERT policies on children, parents, and
  intake_forms, then replace with a single policy that allows both anon and
  authenticated to insert. Write operations (UPDATE/DELETE) remain authenticated only.
*/

-- Children table
DROP POLICY IF EXISTS "Authenticated users can insert children" ON children;
DROP POLICY IF EXISTS "Anyone can insert children" ON children;

CREATE POLICY "Anyone can insert children"
  ON children FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Parents table
DROP POLICY IF EXISTS "Authenticated users can insert parents" ON parents;
DROP POLICY IF EXISTS "Anyone can insert parents" ON parents;

CREATE POLICY "Anyone can insert parents"
  ON parents FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Intake forms table
DROP POLICY IF EXISTS "Authenticated users can insert intake forms" ON intake_forms;
DROP POLICY IF EXISTS "Anyone can insert intake forms" ON intake_forms;

CREATE POLICY "Anyone can insert intake forms"
  ON intake_forms FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
