import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AlertRequest {
  childId: string;
  alertType: 'pickup_request' | 'emergency' | 'general';
  message: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { childId, alertType, message }: AlertRequest = await req.json();

    const { data: child, error: childError } = await supabase
      .from('children')
      .select('full_name, unique_number')
      .eq('id', childId)
      .maybeSingle();

    if (childError || !child) {
      throw new Error('Child not found');
    }

    const { data: parent, error: parentError } = await supabase
      .from('parents')
      .select('primary_name, primary_email')
      .eq('child_id', childId)
      .maybeSingle();

    if (parentError || !parent) {
      throw new Error('Parent contact not found');
    }

    const authHeader = req.headers.get('Authorization');
    let createdBy = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      createdBy = user?.id;
    }

    const { error: notificationError } = await supabase
      .from('parent_notifications')
      .insert({
        child_id: childId,
        alert_type: alertType,
        message: message,
        created_by: createdBy,
        sent_via_email: false,
      });

    if (notificationError) {
      throw notificationError;
    }

    const emailSubject = alertType === 'pickup_request'
      ? `Please Pick Up ${child.full_name}`
      : alertType === 'emergency'
      ? `URGENT: ${child.full_name} - Immediate Attention Required`
      : `Notification for ${child.full_name}`;

    const emailBody = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">ICGG Aviva Kids Alert</h1>
          </div>
          <div style="background: #f7fafc; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #2d3748;">Dear ${parent.primary_name},</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${alertType === 'emergency' ? '#f56565' : '#667eea'};">
              <p style="font-size: 18px; font-weight: bold; color: #2d3748; margin: 0 0 10px 0;">
                ${alertType === 'pickup_request' ? '🔔 Pickup Request' : alertType === 'emergency' ? '🚨 Emergency Alert' : '📢 Notification'}
              </p>
              <p style="font-size: 16px; color: #4a5568; margin: 0;">
                ${message}
              </p>
            </div>
            <div style="background: #edf2f7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0; color: #4a5568;"><strong>Child:</strong> ${child.full_name}</p>
              <p style="margin: 5px 0; color: #4a5568;"><strong>ID Number:</strong> ${child.unique_number}</p>
              <p style="margin: 5px 0; color: #4a5568;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            ${alertType === 'pickup_request' ? '<p style="font-size: 16px; color: #2d3748;">Please come to the children\'s ministry area at your earliest convenience.</p>' : ''}
            <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="font-size: 11px; font-weight: bold; color: #92400e; margin: 0 0 8px 0;">CONFIDENCIAL / CONFIDENTIAL</p>
              <p style="font-size: 10px; color: #78350f; margin: 0; line-height: 1.5;">
                <strong>Esta información es confidencial y será utilizada únicamente para el cuidado del menor.</strong>
                This information is confidential and will be used solely for the care of the child.
                Protected under Florida law. Access restricted to authorized ministry personnel only.
              </p>
            </div>
            <p style="font-size: 14px; color: #718096; margin-top: 30px; padding-top: 20px; border-top: 1px solid #cbd5e0;">
              This is an automated notification from ICGG Aviva Kids.
            </p>
          </div>
        </body>
      </html>
    `;

    const { error: emailError } = await supabase.auth.admin.inviteUserByEmail(
      parent.primary_email,
      {
        data: {
          email_subject: emailSubject,
          email_body: emailBody,
        },
        redirectTo: `${supabaseUrl}/check-in`,
      }
    );

    if (!emailError) {
      await supabase
        .from('parent_notifications')
        .update({
          sent_via_email: true,
          email_sent_at: new Date().toISOString(),
        })
        .eq('child_id', childId)
        .eq('sent_via_email', false)
        .order('created_at', { ascending: false })
        .limit(1);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Alert created and notification sent',
        emailSent: !emailError,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
