
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const WEBHOOK_URL = Deno.env.get("RINGSTER_THANKYOU");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { fullName, email, phone, companyName, teamSize, message } = await req.json();

    // Validate required fields
    if (!fullName || !email || !phone || !companyName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Store in database first
    const { error: dbError } = await fetch(
      Deno.env.get("SUPABASE_URL") + "/rest/v1/demo_requests",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": Deno.env.get("SUPABASE_ANON_KEY") || "",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`
        },
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone,
          company_name: companyName,
          team_size: teamSize || null,
          message: message || null
        })
      }
    ).then(res => res.json());

    if (dbError) {
      console.error("Error storing demo request:", dbError);
    }

    // Forward to external webhook
    if (WEBHOOK_URL) {
      const webhookResponse = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          companyName,
          teamSize,
          message,
          source: "Ebook Demo Request"
        })
      });

      if (!webhookResponse.ok) {
        throw new Error(`Webhook error: ${webhookResponse.status}`);
      }

      // Update database entry to mark as forwarded
      await fetch(
        `${Deno.env.get("SUPABASE_URL")}/rest/v1/demo_requests?email=eq.${encodeURIComponent(email)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "apikey": Deno.env.get("SUPABASE_ANON_KEY") || "",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`
          },
          body: JSON.stringify({
            forwarded: true
          })
        }
      );

      return new Response(
        JSON.stringify({ success: true }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    } else {
      throw new Error("RINGSTER_THANKYOU webhook URL not configured");
    }
  } catch (error) {
    console.error("Error processing demo request:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
