import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

/*
  claim-child: securely links an authenticated parent (magic-link session) to a
  child. The parent proves ownership by supplying the child's unique number; we
  confirm the parent's verified email matches the parent contact on file before
  creating the user_roles + parent_profiles records (service role, RLS-bypassing).
*/
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(url, serviceKey);

    // Identify the caller from their JWT
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    const { data: userData } = await admin.auth.getUser(token);
    const user = userData.user;
    if (!user?.email) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const email = user.email.toLowerCase();

    const { childNumber } = await req.json();
    if (!childNumber) {
      return new Response(JSON.stringify({ error: 'Missing childNumber' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Find the child
    const { data: child } = await admin.from('children').select('id, full_name').eq('unique_number', String(childNumber).trim()).maybeSingle();
    if (!child) {
      return new Response(JSON.stringify({ error: 'Child not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Confirm the verified email matches a parent contact for this child
    const { data: parent } = await admin
      .from('parents')
      .select('id, primary_email')
      .eq('child_id', child.id)
      .ilike('primary_email', email)
      .maybeSingle();

    if (!parent) {
      return new Response(JSON.stringify({ error: 'Email does not match the parent on file for this child' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Mark this user as a parent (idempotent) and link them to the child
    await admin.from('user_roles').upsert({ user_id: user.id, role: 'parent' }, { onConflict: 'user_id', ignoreDuplicates: true });
    await admin.from('parent_profiles').upsert(
      { user_id: user.id, parent_id: parent.id, child_id: child.id },
      { onConflict: 'user_id,child_id', ignoreDuplicates: true }
    );

    return new Response(JSON.stringify({ success: true, childId: child.id, childName: child.full_name }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
