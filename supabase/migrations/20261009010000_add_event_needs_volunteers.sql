-- Lets staff choose which events appear on the parent volunteer calendar
ALTER TABLE events ADD COLUMN IF NOT EXISTS needs_volunteers boolean NOT NULL DEFAULT false;
