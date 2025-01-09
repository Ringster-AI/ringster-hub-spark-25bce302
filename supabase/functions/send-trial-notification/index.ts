import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get users whose trial is ending in 24 hours
    const { data: subscriptions, error } = await supabase
      .from("user_subscriptions")
      .select(`
        *,
        profiles:user_id (
          email
        )
      `)
      .eq("status", "trialing")
      .gt("trial_ends_at", new Date(Date.now()).toISOString())
      .lt("trial_ends_at", new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;

    console.log(`Found ${subscriptions.length} trials ending soon`);

    for (const subscription of subscriptions) {
      const userEmail = subscription.profiles?.email;
      if (!userEmail) continue;

      // Send email using Resend
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Ringster <notifications@ringster.ai>",
          to: [userEmail],
          subject: "Your Ringster trial is ending soon",
          html: `
            <h1>Your Ringster trial is ending soon</h1>
            <p>Your free trial will end in less than 24 hours. To keep your AI agents active, please upgrade to a paid plan.</p>
            <p>Visit your <a href="${SUPABASE_URL}/dashboard/subscription">subscription page</a> to upgrade.</p>
          `,
        }),
      });

      if (!res.ok) {
        console.error(`Failed to send email to ${userEmail}:`, await res.text());
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-trial-notification:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});