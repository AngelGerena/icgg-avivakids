import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

/*
  send-sms: texts a parent from the teacher portal through Twilio.
  Locked down:
  - the caller must be signed in with an approved teacher account (user_roles.role = 'teacher')
  - the number must already be on file for a family (primary, secondary or approved pickup phone)
  - message length is capped
*/

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const digits = (s: string | null | undefined) => (s ?? '').replace(/\D/g, '');
const last10 = (s: string | null | undefined) => digits(s).slice(-10);

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ success: false, error: 'Use POST' }, 405);

  try {
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
      auth: { persistSession: false },
    });

    // 1. Who is calling? Must be an approved teacher.
    const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
    const { data: userData } = await admin.auth.getUser(token);
    const user = userData?.user;
    if (!user) return json({ success: false, error: 'Not signed in' }, 401);

    const { data: role } = await admin
      .from('user_roles').select('role').eq('user_id', user.id).eq('role', 'teacher').maybeSingle();
    if (!role) return json({ success: false, error: 'Teachers only' }, 403);

    // 2. Validate the request.
    const { to, message } = await req.json().catch(() => ({}));
    const target = last10(to);
    const text = String(message ?? '').trim();
    if (target.length !== 10 || !text) return json({ success: false, error: 'Missing or invalid phone or message' }, 400);
    if (text.length > 480) return json({ success: false, error: 'Message too long' }, 400);

    // 3. Only numbers already on file for a family.
    const { data: rows } = await admin
      .from('parents').select('primary_phone, secondary_phone, approved_pickup_phone');
    const onFile = (rows ?? []).some((r) =>
      [r.primary_phone, r.secondary_phone, r.approved_pickup_phone].some((p) => last10(p) === target)
    );
    if (!onFile) return json({ success: false, error: 'That number is not on file for any family' }, 403);

    // 4. Send through Twilio.
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');
    if (!accountSid || !authToken || !fromNumber) {
      console.warn('Twilio credentials not configured. SMS skipped.');
      return json({ success: false, reason: 'Twilio not configured' });
    }

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: '+1' + target, From: fromNumber, Body: text }).toString(),
    });
    const result = await response.json();

    if (!response.ok) {
      console.error('Twilio error:', result?.message);
      return json({ success: false, error: result?.message ?? 'Twilio error' });
    }
    return json({ success: true, sid: result.sid });
  } catch (err) {
    console.error('send-sms error:', err);
    return json({ success: false, error: 'Unexpected error' }, 500);
  }
});
