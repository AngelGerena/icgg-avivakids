import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

/*
  send-message-notification: logs a parent<->teacher message to parent_notifications
  so it surfaces in the existing in-app notification bell, and is the place to wire
  an email provider (Resend/SendGrid) — mirrors send-parent-email-alert.
*/
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { childId, senderRole, body } = await req.json();

    const { data: child } = await supabase.from('children').select('full_name').eq('id', childId).maybeSingle();
    const { data: parent } = await supabase.from('parents').select('primary_name, primary_email').eq('child_id', childId).maybeSingle();

    // Record the notification (in-app bell). Email send can be added here.
    // parent_notifications.alert_type is constrained to pickup_request|emergency|general.
    await supabase.from('parent_notifications').insert({
      child_id: childId,
      alert_type: 'general',
      message: `${senderRole === 'parent' ? 'New parent question' : 'Teacher reply'} re: ${child?.full_name ?? 'child'} — ${String(body || '').slice(0, 140)}`,
    }).select().maybeSingle();

    return new Response(JSON.stringify({ success: true, parentEmail: parent?.primary_email ?? null }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
