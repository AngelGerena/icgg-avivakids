/*
  # Schema Enhancements for QR Codes, SMS Alerts, and Analytics
  
  1. Changes to existing tables
    - Add `intake_form_pdf_url` column to children table for storing PDF receipts
    - Add `qr_code_data` column to children table for QR code payload
    - Modify alerts table to include parent contact info and resolved timestamps
    
  2. New columns
    - children.intake_form_pdf_url (text) - URL to stored intake form PDF
    - children.qr_code_data (text) - Encrypted or encoded QR data
    - alerts.child_id (uuid) - Foreign key reference to child
    - alerts.parent_name (text) - Parent name for alert
    - alerts.parent_phone (text) - Phone number where SMS was sent
    - alerts.sms_sent (boolean) - Whether SMS was successfully sent
    - alerts.resolved_at (timestamptz) - When alert was marked resolved
    - alerts.resolved_by (text) - Who resolved the alert
    
  3. Security
    - Maintain existing RLS policies
    - Add indexes for performance
*/

-- Add new columns to children table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'children' AND column_name = 'intake_form_pdf_url'
  ) THEN
    ALTER TABLE children ADD COLUMN intake_form_pdf_url text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'children' AND column_name = 'qr_code_data'
  ) THEN
    ALTER TABLE children ADD COLUMN qr_code_data text;
  END IF;
END $$;

-- Add new columns to alerts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'alerts' AND column_name = 'child_id'
  ) THEN
    ALTER TABLE alerts ADD COLUMN child_id uuid REFERENCES children(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'alerts' AND column_name = 'parent_name'
  ) THEN
    ALTER TABLE alerts ADD COLUMN parent_name text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'alerts' AND column_name = 'parent_phone'
  ) THEN
    ALTER TABLE alerts ADD COLUMN parent_phone text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'alerts' AND column_name = 'sms_sent'
  ) THEN
    ALTER TABLE alerts ADD COLUMN sms_sent boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'alerts' AND column_name = 'resolved_at'
  ) THEN
    ALTER TABLE alerts ADD COLUMN resolved_at timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'alerts' AND column_name = 'resolved_by'
  ) THEN
    ALTER TABLE alerts ADD COLUMN resolved_by text;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_alerts_child_id ON alerts(child_id);
CREATE INDEX IF NOT EXISTS idx_alerts_triggered_at ON alerts(triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_children_intake_pdf ON children(intake_form_pdf_url);
