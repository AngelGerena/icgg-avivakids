import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Child {
  id: string;
  full_name: string;
  nickname?: string;
  dob: string;
  gender?: string;
  photo_url?: string;
  room: string;
  unique_number: string;
  checked_in_today: boolean;
  check_in_time?: string;
  birthday_celebrated: boolean;
  created_at: string;
}

export interface Parent {
  id: string;
  child_id: string;
  primary_name: string;
  primary_relationship: string;
  primary_phone: string;
  primary_email: string;
  secondary_name?: string;
  secondary_relationship?: string;
  secondary_phone?: string;
  created_at: string;
}

export interface IntakeForm {
  id: string;
  child_id: string;
  allergies?: string[];
  restricted_foods?: string;
  medications?: any;
  medical_conditions?: string;
  special_needs?: string;
  medication_authorized: boolean;
  doctor_name?: string;
  doctor_phone?: string;
  behavioral_notes?: string;
  triggers?: string;
  communication_notes?: string;
  photo_consent: boolean;
  medical_consent: boolean;
  digital_signature: string;
  submitted_at: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time?: string;
  description?: string;
  location?: string;
  category?: string;
  color?: string;
  created_at: string;
}

export interface Alert {
  id: string;
  child_number: string;
  child_id?: string;
  reason: string;
  triggered_at: string;
  resolved: boolean;
  parent_name?: string;
  parent_phone?: string;
  sms_sent?: boolean;
  resolved_at?: string;
  resolved_by?: string;
  parent_acknowledged?: boolean;
  acknowledged_at?: string;
  acknowledged_by?: string;
}
