
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.1";

const CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID") || "";
const CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET") || "";
const APP_URL = Deno.env.get("APP_URL") || "http://localhost:5173";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization code from the URL
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    if (error) {
      console.error("Error from Google OAuth:", error);
      return Response.redirect(`${APP_URL}/dashboard/settings?tab=integrations&error=${error}`);
    }

    if (!code) {
      console.error("No authorization code received");
      return Response.redirect(`${APP_URL}/dashboard/settings?tab=integrations&error=no_code`);
    }

    // Create a Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Modified approach - we'll use a state parameter to identify the user
    // instead of relying on the auth header which might not be present
    
    // Since we don't have user identification, we'll create a temporary user record
    // that will be associated with the Google account after authorization
    const tempUserId = crypto.randomUUID();
    
    // Exchange the authorization code for access and refresh tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: `${supabaseUrl}/functions/v1/google-callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Error exchanging code for tokens:", tokenData);
      return Response.redirect(`${APP_URL}/dashboard/settings?tab=integrations&error=token_error`);
    }

    // Get user info from Google to get the email
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userInfo = await userInfoResponse.json();

    if (!userInfoResponse.ok) {
      console.error("Error getting user info:", userInfo);
      return Response.redirect(`${APP_URL}/dashboard/settings?tab=integrations&error=userinfo_error`);
    }

    // Calculate token expiration time
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

    // Store the temporary integration in a cookie or query param
    // We'll redirect to a frontend page that will handle connecting to the correct user
    const redirectUrl = new URL(`${APP_URL}/dashboard/settings`);
    redirectUrl.searchParams.append("tab", "integrations");
    redirectUrl.searchParams.append("email", userInfo.email);
    redirectUrl.searchParams.append("googleConnected", "true");
    redirectUrl.searchParams.append("googleToken", tokenData.access_token);
    redirectUrl.searchParams.append("googleRefreshToken", tokenData.refresh_token);
    redirectUrl.searchParams.append("googleExpiresAt", expiresAt.toISOString());
    redirectUrl.searchParams.append("googleScopes", tokenData.scope);
    
    // Redirect back to the app with the temporary Google data
    return Response.redirect(redirectUrl.toString());
  } catch (err) {
    console.error("Unexpected error:", err);
    return Response.redirect(`${APP_URL}/dashboard/settings?tab=integrations&error=unknown`);
  }
});
