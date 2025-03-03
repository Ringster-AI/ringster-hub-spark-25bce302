
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

    // Get the JWT token from the authorization header
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    
    let userId;

    // If there's a token, verify it and get the user ID
    if (token) {
      const { data: userData, error: userError } = await supabase.auth.getUser(token);
      if (userError) {
        console.error("Error getting user from token:", userError);
        return Response.redirect(`${APP_URL}/dashboard/settings?tab=integrations&error=auth_error`);
      }
      userId = userData.user?.id;
    } else {
      // Try to get the auth.user() from the current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData?.session) {
        console.error("Error getting session:", sessionError);
        return Response.redirect(`${APP_URL}/dashboard/settings?tab=integrations&error=auth_error`);
      }
      userId = sessionData.session?.user?.id;
    }

    if (!userId) {
      console.error("No user ID found");
      return Response.redirect(`${APP_URL}/dashboard/settings?tab=integrations&error=auth_error`);
    }

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

    // Store the tokens in the database
    const { error: dbError } = await supabase
      .from("google_integrations")
      .upsert({
        user_id: userId,
        email: userInfo.email,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt.toISOString(),
        scopes: tokenData.scope,
      });

    if (dbError) {
      console.error("Error storing tokens:", dbError);
      return Response.redirect(`${APP_URL}/dashboard/settings?tab=integrations&error=db_error`);
    }

    // Redirect back to the app with success
    return Response.redirect(`${APP_URL}/dashboard/settings?tab=integrations&success=true`);
  } catch (err) {
    console.error("Unexpected error:", err);
    return Response.redirect(`${APP_URL}/dashboard/settings?tab=integrations&error=unknown`);
  }
});
