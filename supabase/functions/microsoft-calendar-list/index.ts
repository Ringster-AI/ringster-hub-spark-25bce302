import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "../_shared/cors.ts";
import { encryptToken, decryptToken, isEncrypted } from "../_shared/crypto.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const MS_CLIENT_ID = Deno.env.get("MICROSOFT_CLIENT_ID") || "";
const MS_CLIENT_SECRET = Deno.env.get("MICROSOFT_CLIENT_SECRET") || "";
const TOKEN_ENCRYPTION_KEY = Deno.env.get("TOKEN_ENCRYPTION_KEY") || "";

serve(async (req) => {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] microsoft-calendar-list invoked`);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header provided" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Authentication required", details: userError?.message }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: integration, error: integrationError } = await supabase
      .from("microsoft_integrations")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (integrationError || !integration) {
      return new Response(
        JSON.stringify({ error: "Microsoft integration not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let accessToken = integration.access_token;
    let refreshToken = integration.refresh_token;

    if (TOKEN_ENCRYPTION_KEY) {
      try {
        if (isEncrypted(accessToken)) {
          accessToken = await decryptToken(accessToken, TOKEN_ENCRYPTION_KEY);
        }
        if (refreshToken && isEncrypted(refreshToken)) {
          refreshToken = await decryptToken(refreshToken, TOKEN_ENCRYPTION_KEY);
        }
      } catch (e) {
        console.error(`[${requestId}] Decrypt error:`, e);
        return new Response(
          JSON.stringify({ error: "Failed to decrypt stored tokens. Please reconnect your Microsoft account." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Refresh if expired
    const now = new Date();
    if (now > new Date(integration.expires_at)) {
      console.log(`[${requestId}] Refreshing expired Microsoft token`);
      if (!refreshToken) {
        return new Response(
          JSON.stringify({ error: "No refresh token available. Please reconnect Microsoft." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const tokenResp = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: MS_CLIENT_ID,
          client_secret: MS_CLIENT_SECRET,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
          scope: "openid profile email offline_access User.Read Calendars.ReadWrite",
        }),
      });

      if (!tokenResp.ok) {
        const errData = await tokenResp.json().catch(() => ({}));
        console.error(`[${requestId}] MS refresh failed:`, errData);
        return new Response(
          JSON.stringify({ error: "Failed to refresh access token", details: errData }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const tokenData = await tokenResp.json();
      const expiresInSeconds = tokenData.expires_in - 300;
      const newExpiry = new Date();
      newExpiry.setSeconds(newExpiry.getSeconds() + expiresInSeconds);

      let storeAccess = tokenData.access_token;
      let storeRefresh = tokenData.refresh_token || refreshToken;
      if (TOKEN_ENCRYPTION_KEY) {
        storeAccess = await encryptToken(tokenData.access_token, TOKEN_ENCRYPTION_KEY);
        if (tokenData.refresh_token) {
          storeRefresh = await encryptToken(tokenData.refresh_token, TOKEN_ENCRYPTION_KEY);
        }
      }

      await supabase
        .from("microsoft_integrations")
        .update({
          access_token: storeAccess,
          refresh_token: storeRefresh,
          expires_at: newExpiry.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", integration.id);

      accessToken = tokenData.access_token;
    }

    // Fetch the user's calendars from Microsoft Graph
    const calResp = await fetch("https://graph.microsoft.com/v1.0/me/calendars", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!calResp.ok) {
      const errData = await calResp.json().catch(() => ({}));
      console.error(`[${requestId}] MS Graph error:`, errData);
      return new Response(
        JSON.stringify({ error: "Failed to fetch calendars", details: errData }),
        { status: calResp.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const calData = await calResp.json();
    const calendars = (calData.value || []).map((c: any) => ({
      id: c.id,
      summary: c.name,
      primary: c.isDefaultCalendar || false,
      canEdit: c.canEdit,
      backgroundColor: c.hexColor || null,
    }));

    return new Response(
      JSON.stringify({ calendars }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error(`[${requestId}] Error:`, err);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch calendars",
        details: err instanceof Error ? err.message : String(err),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
