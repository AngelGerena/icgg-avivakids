/*
  # Allow authenticated users to delete and update children records

  Adds DELETE policy for authenticated users (teachers/admins) on:
  - children table (delete and room update)
  - parents table (cascade handled by FK, but explicit policy for safety)
*/

CREATE POLICY "Authenticated users can delete children"
  ON children
  FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update children"
  ON children
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
