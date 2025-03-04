
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
const CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
const APP_URL = Deno.env.get("APP_URL") || "http://localhost:5173";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate environment variables
    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.error("Missing Google OAuth credentials in environment variables");
      return redirectWithError("server_config_error");
    }

    if (!SUPABASE_URL) {
      console.error("Missing Supabase URL in environment variables");
      return redirectWithError("server_config_error");
    }

    // Get the authorization code and state from the URL
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");
    const state = url.searchParams.get("state") || "";
    
    console.log("Received OAuth callback with state:", state);
    
    // Parse the return URL from state parameter or use default
    const returnUrlMatch = state.match(/return_to=([^&]+)/);
    let returnUrl = returnUrlMatch 
      ? decodeURIComponent(returnUrlMatch[1])
      : `${APP_URL}/dashboard/settings?tab=integrations`;
      
    // Fix the return URL if it has double dashboard paths
    if (returnUrl.includes("/dashboard/settings/dashboard/settings")) {
      returnUrl = returnUrl.replace("/dashboard/settings/dashboard/settings", "/dashboard/settings");
    }

    console.log("Return URL:", returnUrl);

    // Handle OAuth errors
    if (error) {
      console.error("Error from Google OAuth:", error);
      return Response.redirect(`${returnUrl}&error=${error}`);
    }

    if (!code) {
      console.error("No authorization code received");
      return redirectWithError("no_code");
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
        redirect_uri: `${SUPABASE_URL}/functions/v1/google-callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Error exchanging code for tokens:", tokenData);
      return redirectWithError(tokenData.error || "token_error");
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
      return redirectWithError("userinfo_error");
    }

    // Calculate token expiration time
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

    // Build redirect URL with all OAuth data as query parameters
    const redirectUrl = new URL(returnUrl);
    redirectUrl.searchParams.append("success", "true");
    redirectUrl.searchParams.append("email", userInfo.email);
    redirectUrl.searchParams.append("googleConnected", "true");
    redirectUrl.searchParams.append("googleToken", tokenData.access_token);
    
    if (tokenData.refresh_token) {
      redirectUrl.searchParams.append("googleRefreshToken", tokenData.refresh_token);
    }
    
    redirectUrl.searchParams.append("googleExpiresAt", expiresAt.toISOString());
    redirectUrl.searchParams.append("googleScopes", tokenData.scope);
    
    console.log("Redirecting to:", redirectUrl.toString());
    
    // Redirect back to the app with the Google data
    return Response.redirect(redirectUrl.toString());
  } catch (err) {
    console.error("Unexpected error in Google callback:", err);
    return redirectWithError("server_error");
  }
  
  // Helper function to redirect with error
  function redirectWithError(errorCode: string) {
    const errorUrl = new URL(`${APP_URL}/dashboard/settings`);
    errorUrl.searchParams.append("tab", "integrations");
    errorUrl.searchParams.append("error", errorCode);
    return Response.redirect(errorUrl.toString());
  }
});
