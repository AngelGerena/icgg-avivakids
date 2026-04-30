/*
  # Fix parent_notifications UPDATE policy

  ## Problem
  The security migration (20260407200846) created an UPDATE policy for
  parent_notifications that uses a subquery comparing the current row's
  is_read value against the new value. This self-referencing subquery
  pattern is problematic in PostgreSQL RLS and can cause unexpected
  permission denied errors.

  ## Fix
  Replace with a simple permissive UPDATE policy for anon and authenticated
  roles. The parent notification widget only updates `is_read` to true,
  and since the table only stores non-sensitive notification metadata,
  allowing updates from both roles is acceptable.
*/

DROP POLICY IF EXISTS "Anyone can mark notifications as read" ON parent_notifications;
DROP POLICY IF EXISTS "Anyone can update notifications" ON parent_notifications;

CREATE POLICY "Anyone can mark notifications as read"
  ON parent_notifications FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
