import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encryptToken } from "../_shared/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const encryptionKey = Deno.env.get("TOKEN_ENCRYPTION_KEY");

    // Authenticate
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const anonClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await anonClient.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const userId = userData.user.id;
    const body = await req.json();
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Handle test action
    if (body.action === "test" && body.integrationId) {
      const { data: integration } = await supabaseAdmin
        .from("integrations")
        .select("credentials")
        .eq("id", body.integrationId)
        .eq("user_id", userId)
        .single();

      if (!integration) {
        return new Response(
          JSON.stringify({ error: "Integration not found" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
        );
      }

      // Decrypt and test the API key
      const creds = integration.credentials as Record<string, any>;
      let apiKey: string;
      if (creds.encrypted && encryptionKey) {
        const { decryptToken } = await import("../_shared/crypto.ts");
        apiKey = await decryptToken(creds.encrypted, encryptionKey);
        const parsed = JSON.parse(apiKey);
        apiKey = parsed.api_key;
      } else {
        apiKey = creds.api_key;
      }

      const testRes = await fetch("https://api.cal.com/v2/me", {
        headers: { Authorization: `Bearer ${apiKey}`, "cal-api-version": "2024-08-13" },
      });

      if (!testRes.ok) {
        const errText = await testRes.text();
        return new Response(
          JSON.stringify({ error: `Cal.com API test failed: ${errText}` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      await testRes.text();
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Connect flow: validate and store API key
    const { apiKey } = body;
    if (!apiKey || typeof apiKey !== "string" || apiKey.length < 10) {
      return new Response(
        JSON.stringify({ error: "A valid Cal.com API key is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Validate the API key by calling Cal.com
    const validateRes = await fetch("https://api.cal.com/v2/me", {
      headers: { Authorization: `Bearer ${apiKey}`, "cal-api-version": "2024-08-13" },
    });

    if (!validateRes.ok) {
      const errText = await validateRes.text();
      return new Response(
        JSON.stringify({ error: `Invalid Cal.com API key: ${errText}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const calUser = await validateRes.json();
    const calUsername = calUser.data?.username || calUser.data?.email || "Cal.com User";

    // Encrypt credentials
    let credentials: Record<string, any> = { api_key: apiKey };
    if (encryptionKey) {
      const encrypted = await encryptToken(JSON.stringify(credentials), encryptionKey);
      credentials = { encrypted };
    }

    // Upsert integration record
    const { data: existing } = await supabaseAdmin
      .from("integrations")
      .select("id")
      .eq("user_id", userId)
      .eq("integration_type", "cal_com")
      .single();

    if (existing) {
      await supabaseAdmin
        .from("integrations")
        .update({
          credentials,
          status: "connected",
          is_active: true,
          display_name: `Cal.com (${calUsername})`,
          metadata: { username: calUsername },
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await supabaseAdmin.from("integrations").insert({
        user_id: userId,
        integration_type: "cal_com",
        provider_name: "cal_com",
        display_name: `Cal.com (${calUsername})`,
        status: "connected",
        credentials,
        configuration: {},
        metadata: { username: calUsername },
        capabilities: ["calendar", "scheduling"],
        is_active: true,
      });
    }

    return new Response(
      JSON.stringify({ success: true, username: calUsername }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in store-calcom-key:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
