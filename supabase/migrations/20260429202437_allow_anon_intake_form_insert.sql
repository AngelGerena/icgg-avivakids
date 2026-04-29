/*
  # Allow anonymous users to submit intake forms

  ## Problem
  The intake form is filled out by parents who are NOT logged in (anon role).
  The existing INSERT policies only allow authenticated users, causing the form
  submission to fail with a permission error.

  ## Changes
  - Add INSERT policies for the anon role on: children, parents, intake_forms
  - SELECT already allows anon (existing policies), UPDATE stays authenticated-only
  - This is the correct pattern: parents register their child without needing an account
*/

CREATE POLICY "Anyone can insert children"
  ON children
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can insert parents"
  ON parents
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can insert intake forms"
  ON intake_forms
  FOR INSERT
  TO anon
  WITH CHECK (true);
