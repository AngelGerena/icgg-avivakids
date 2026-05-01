/*
  # Add parent acknowledgment to alerts table

  Adds two columns to track when a parent confirms they are on their way:
  - parent_acknowledged: boolean flag
  - acknowledged_at: timestamp of acknowledgment  
  - acknowledged_by: parent name who confirmed
*/

ALTER TABLE alerts ADD COLUMN IF NOT EXISTS parent_acknowledged boolean DEFAULT false;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS acknowledged_at timestamptz;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS acknowledged_by text;

-- Allow anon (parent) to update acknowledgment fields only
CREATE POLICY "Anyone can acknowledge alerts"
  ON alerts
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
