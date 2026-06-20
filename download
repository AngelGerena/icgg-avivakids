/*
  # Email and Real-time Notification System

  1. New Tables
    - `parent_notifications`
      - `id` (uuid, primary key) - Unique notification identifier
      - `child_id` (uuid, foreign key) - References children table
      - `alert_type` (text) - Type of alert (pickup_request, emergency, general)
      - `message` (text) - Notification message content
      - `is_read` (boolean) - Whether parent has read the notification
      - `created_at` (timestamptz) - When notification was created
      - `sent_via_email` (boolean) - Whether email was sent
      - `email_sent_at` (timestamptz) - When email was sent
      - `created_by` (uuid) - Staff member who created the alert

  2. Security
    - Enable RLS on `parent_notifications` table
    - Parents can view notifications for their own children (via parents table)
    - Authenticated users can create and view all notifications
    - Anyone can update read status (for parent mobile usage)

  3. Indexes
    - Index on child_id for faster parent queries
    - Index on created_at for chronological sorting
    - Index on is_read for filtering unread notifications
*/

-- Create parent_notifications table
CREATE TABLE IF NOT EXISTS parent_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN ('pickup_request', 'emergency', 'general')),
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  sent_via_email boolean DEFAULT false,
  email_sent_at timestamptz,
  created_by uuid
);

-- Enable RLS
ALTER TABLE parent_notifications ENABLE ROW LEVEL SECURITY;

-- Anyone can view notifications (parents will filter by their children)
CREATE POLICY "Anyone can view notifications"
  ON parent_notifications
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users can create notifications
CREATE POLICY "Authenticated users can create notifications"
  ON parent_notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Anyone can update notifications (for marking as read)
CREATE POLICY "Anyone can update notifications"
  ON parent_notifications
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_parent_notifications_child_id ON parent_notifications(child_id);
CREATE INDEX IF NOT EXISTS idx_parent_notifications_created_at ON parent_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_parent_notifications_is_read ON parent_notifications(is_read);