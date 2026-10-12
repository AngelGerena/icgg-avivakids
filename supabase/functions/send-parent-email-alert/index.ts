import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

/*
  send-parent-email-alert: called from the teacher portal when a teacher sends an alert.
  1. Saves a parent notification (what the parent sees in the notification bell).
  2. Emails the parent through Resend.
  Locked down: only approved teachers (user_roles.role = 'teacher') can call it,
  and it only ever emails the parent on file for that child.

  Secrets:   RESEND_API_KEY (required for email)
  Optional:  ALERT_FROM_EMAIL, defaults to "ICGG Aviva Kids <alertas@alerts.finessemedia.pro>"
*/

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

type AlertType = 'pickup_request' | 'emergency' | 'general';
const TYPES: AlertType[] = ['pickup_request', 'emergency', 'general'];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const TITLES: Record<AlertType, { es: string; en: string; color: string }> = {
  pickup_request: { es: 'Solicitud de recogida', en: 'Pickup request', color: '#6B4FD8' },
  emergency: { es: 'Alerta urgente', en: 'Urgent alert', color: '#E53E3E' },
  general: { es: 'Aviso', en: 'Notice', color: '#3182CE' },
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });
  if (req.method !== 'POST') return json({ success: false, error: 'Use POST' }, 405);

  try {
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
      auth: { persistSession: false },
    });

    // 1. Only approved teachers.
    const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
    const { data: userData } = await admin.auth.getUser(token);
    const user = userData?.user;
    if (!user) return json({ success: false, error: 'Not signed in' }, 401);
    const { data: role } = await admin
      .from('user_roles').select('role').eq('user_id', user.id).eq('role', 'teacher').maybeSingle();
    if (!role) return json({ success: false, error: 'Teachers only' }, 403);

    // 2. Validate input.
    const body = await req.json().catch(() => ({}));
    const childId = String(body.childId ?? '');
    const alertType: AlertType = TYPES.includes(body.alertType) ? body.alertType : 'general';
    const message = String(body.message ?? '').trim();
    if (!UUID.test(childId) || !message) return json({ success: false, error: 'Missing child or message' }, 400);
    if (message.length > 500) return json({ success: false, error: 'Message too long' }, 400);

    // 3. Child and parent on file.
    const { data: child } = await admin
      .from('children').select('full_name, unique_number').eq('id', childId).maybeSingle();
    if (!child) return json({ success: false, error: 'Child not found' }, 404);
    const { data: parent } = await admin
      .from('parents').select('primary_name, primary_email').eq('child_id', childId).maybeSingle();

    // 4. Save the notification for the parent's notification bell.
    const { data: notification, error: notificationError } = await admin
      .from('parent_notifications')
      .insert({ child_id: childId, alert_type: alertType, message, created_by: user.id, sent_via_email: false })
      .select('id')
      .single();
    if (notificationError) throw notificationError;

    // 5. Email the parent through Resend.
    const apiKey = Deno.env.get('RESEND_API_KEY');
    const to = (parent?.primary_email ?? '').trim();
    if (!apiKey) {
      console.warn('RESEND_API_KEY not set. Email skipped.');
      return json({ success: true, emailSent: false, reason: 'Email not configured' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return json({ success: true, emailSent: false, reason: 'No valid parent email on file' });
    }

    const t = TITLES[alertType];
    const firstName = String(child.full_name ?? '').trim().split(' ')[0];
    const time = new Date().toLocaleString('en-US', {
      timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit', hour12: true, month: 'short', day: 'numeric',
    });
    const subject = alertType === 'emergency'
      ? `URGENTE / URGENT: ${firstName} - Aviva Kids`
      : `${t.es} / ${t.en}: ${firstName} - Aviva Kids`;

    const html = `<!doctype html><html><body style="margin:0;background:#f4f2fb;font-family:Arial,Helvetica,sans-serif;color:#2d3748">
<div style="max-width:560px;margin:0 auto;padding:24px 16px">
  <div style="background:${t.color};color:#fff;border-radius:14px 14px 0 0;padding:22px 24px">
    <div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;opacity:.9">ICGG Aviva Kids</div>
    <div style="font-size:22px;font-weight:bold;margin-top:4px">${esc(t.es)} / ${esc(t.en)}</div>
  </div>
  <div style="background:#fff;border-radius:0 0 14px 14px;padding:24px">
    <p style="margin:0 0 14px;font-size:16px">Hola ${esc(parent?.primary_name ?? '')},</p>
    <p style="margin:0 0 18px;font-size:17px;font-weight:bold;line-height:1.45">${esc(message)}</p>
    <table style="width:100%;font-size:14px;background:#f7f7fb;border-radius:10px;padding:12px" cellpadding="4">
      <tr><td style="color:#718096">Nino/a / Child</td><td><strong>${esc(child.full_name)}</strong></td></tr>
      <tr><td style="color:#718096">Numero / Number</td><td><strong>#${esc(child.unique_number)}</strong></td></tr>
      <tr><td style="color:#718096">Hora / Time</td><td>${esc(time)}</td></tr>
    </table>
    ${alertType === 'pickup_request' ? '<p style="margin:18px 0 0;font-size:15px">Por favor pase al area del ministerio infantil. / Please come to the children\'s ministry area.</p>' : ''}
    <p style="margin:22px 0 0;font-size:11px;color:#a0aec0;line-height:1.5">Mensaje automatico de ICGG Aviva Kids. Informacion confidencial para el cuidado del menor.<br>Automated message from ICGG Aviva Kids. Confidential information for the care of the child.</p>
  </div>
</div></body></html>`;

    const from = Deno.env.get('ALERT_FROM_EMAIL') || 'ICGG Aviva Kids <alertas@alerts.finessemedia.pro>';
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });
    const sent = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('Resend error:', sent?.message ?? res.status);
      return json({ success: true, emailSent: false, reason: 'Email provider error' });
    }

    await admin
      .from('parent_notifications')
      .update({ sent_via_email: true, email_sent_at: new Date().toISOString() })
      .eq('id', notification.id);

    return json({ success: true, emailSent: true });
  } catch (error) {
    console.error('send-parent-email-alert error:', error);
    return json({ success: false, error: 'Unexpected error' }, 500);
  }
});
