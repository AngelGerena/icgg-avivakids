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
}

// ============================================================
// Faith at Home — types
// ============================================================
export interface Lesson {
  id: string;
  title: string;
  week_of: string;
  room?: string;
  language?: string;
  bible_passage?: string;
  memory_verse?: string;
  story_summary?: string;
  discussion_questions?: string[];
  activity?: string;
  song_title?: string;
  song_url?: string;
  image_url?: string;
  attachment_url?: string;
  status: 'draft' | 'published';
  created_by?: string;
  created_at: string;
  updated_at?: string;
}

export interface Assignment {
  id: string;
  lesson_id: string;
  title: string;
  instructions?: string;
  attachment_url?: string;
  due_date?: string;
  submission_type: 'photo' | 'video' | 'text' | 'any';
  created_at: string;
}

export interface HomeworkSubmission {
  id: string;
  assignment_id: string;
  child_id: string;
  submitted_by?: string;
  file_url?: string;
  parent_note?: string;
  status: 'submitted' | 'reviewed' | 'completed';
  stars_awarded: number;
  teacher_feedback?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface Message {
  id: string;
  child_id: string;
  lesson_id?: string;
  sender_role: 'parent' | 'teacher';
  sender_id?: string;
  body: string;
  read_at?: string;
  created_at: string;
}

export interface ParentProfile {
  id: string;
  user_id: string;
  parent_id?: string;
  child_id: string;
  created_at: string;
}

// ============================================================
// Faith at Home — helpers
// ============================================================

// Is the currently signed-in user a teacher (staff)?
export async function isTeacher(): Promise<boolean> {
  const { data: sessionData } = await supabase.auth.getSession();
  const uid = sessionData.session?.user?.id;
  if (!uid) return false;
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', uid)
    .eq('role', 'teacher')
    .maybeSingle();
  return !!data;
}

// Child IDs the signed-in parent is allowed to see
export async function getParentChildIds(): Promise<string[]> {
  const { data: sessionData } = await supabase.auth.getSession();
  const uid = sessionData.session?.user?.id;
  if (!uid) return [];
  const { data } = await supabase
    .from('parent_profiles')
    .select('child_id')
    .eq('user_id', uid);
  return (data || []).map((r: { child_id: string }) => r.child_id);
}

// Upload a file to a bucket and return its storage path
export async function uploadFile(
  bucket: 'lesson-assets' | 'homework',
  path: string,
  file: File
): Promise<string> {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  });
  if (error) throw error;
  return path;
}

// Public URL for lesson-assets (public bucket)
export function publicAssetUrl(path: string): string {
  return supabase.storage.from('lesson-assets').getPublicUrl(path).data.publicUrl;
}

// Short-lived signed URL for private homework files
export async function signedHomeworkUrl(path: string, expiresIn = 3600): Promise<string | null> {
  const { data } = await supabase.storage.from('homework').createSignedUrl(path, expiresIn);
  return data?.signedUrl ?? null;
}
