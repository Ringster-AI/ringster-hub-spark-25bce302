
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
const CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
const APP_URL = Deno.env.get("APP_URL") || "http://localhost:5173";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");

console.log("Function loaded with environment variables:", {
  hasClientId: !!CLIENT_ID,
  hasClientSecret: !!CLIENT_SECRET,
  appUrl: APP_URL,
  hasSupabaseUrl: !!SUPABASE_URL
});

serve(async (req) => {
  console.log("Google OAuth callback received");
  console.log("Request method:", req.method);
  console.log("Request URL:", req.url);
  
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate environment variables
    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.error("Missing Google OAuth credentials:", { 
        hasClientId: !!CLIENT_ID, 
        hasClientSecret: !!CLIENT_SECRET 
      });
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
    console.log("Authorization code present:", !!code);
    console.log("Error present:", !!error);
    console.log("Full URL:", req.url);
    
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
    console.log("Exchanging code for tokens...");
    const redirectUri = `${SUPABASE_URL}/functions/v1/google-callback`;
    console.log("Redirect URI:", redirectUri);
    console.log("Client ID length:", CLIENT_ID?.length);
    console.log("Client Secret available and length:", !!CLIENT_SECRET, CLIENT_SECRET?.length); // Don't log the actual secret
    
    // IMPORTANT: Use URLSearchParams for proper x-www-form-urlencoded format
    const tokenParams = new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });
    
    console.log("Token request parameters (excluding client_secret):", 
      Object.fromEntries([...tokenParams.entries()].filter(([key]) => key !== 'client_secret')));
      
    // Additional validation check for empty strings
    if (CLIENT_ID.trim() === "" || CLIENT_SECRET.trim() === "") {
      console.error("OAuth credentials are empty strings");
      return redirectWithError("invalid_credentials");
    }
    
    // Log request details before making the token request
    console.log("About to make token request to: https://oauth2.googleapis.com/token");
    console.log("Using content-type: application/x-www-form-urlencoded");
    
    // Add timeout protection
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
    
    try {
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json"
        },
        body: tokenParams,
        signal: controller.signal
      });
      
      // Clear the timeout since the request completed
      clearTimeout(timeoutId);

      console.log("Token exchange response status:", tokenResponse.status);
      console.log("Token exchange response headers:", Object.fromEntries([...tokenResponse.headers.entries()]));
      
      const tokenResponseText = await tokenResponse.text();
      console.log("Raw token response:", tokenResponseText);
      
      let tokenData;
      try {
        tokenData = JSON.parse(tokenResponseText);
        console.log("Token data parsed successfully");
      } catch (parseError) {
        console.error("Error parsing token response:", parseError);
        return redirectWithError("invalid_response");
      }
      
      if (!tokenResponse.ok) {
        console.error("Error exchanging code for tokens:", tokenData);
        console.error("Full error details:", JSON.stringify(tokenData));
        return redirectWithError(tokenData.error || "token_error");
      }

      // Log token response data (excluding sensitive information)
      console.log("Token exchange successful:", {
        tokenType: tokenData.token_type,
        expiresIn: tokenData.expires_in,
        hasAccessToken: !!tokenData.access_token,
        hasRefreshToken: !!tokenData.refresh_token,
        scope: tokenData.scope
      });

      // Get user info from Google to get the email
      try {
        console.log("Requesting user info from Google...");
        const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        });

        console.log("User info response status:", userInfoResponse.status);
        
        const userInfoText = await userInfoResponse.text();
        console.log("Raw user info response:", userInfoText);
        
        let userInfo;
        try {
          userInfo = JSON.parse(userInfoText);
          console.log("User info parsed successfully");
        } catch (parseError) {
          console.error("Error parsing user info response:", parseError);
          return redirectWithError("userinfo_parse_error");
        }

        if (!userInfoResponse.ok) {
          console.error("Error getting user info:", userInfo);
          return redirectWithError("userinfo_error");
        }

        console.log("User info retrieved:", { email: userInfo.email });

        // Calculate token expiration time
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

        // Check for calendar scope
        const calendarScope = 'https://www.googleapis.com/auth/calendar';
        const hasCalendarScope = tokenData.scope.includes(calendarScope);
        console.log("Has calendar scope:", hasCalendarScope);

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
        
        const redirectString = redirectUrl.toString();
        console.log("Redirecting to:", redirectString.substring(0, 100) + "...");
        
        // Redirect back to the app with the Google data
        return Response.redirect(redirectString);
      } catch (userInfoError) {
        console.error("Error in user info request:", userInfoError);
        return redirectWithError("userinfo_request_error");
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error("Token request timed out");
        return redirectWithError("request_timeout");
      }
      throw fetchError;
    }
  } catch (err) {
    console.error("Unexpected error in Google callback:", err);
    console.error("Error details:", err.stack || JSON.stringify(err));
    return redirectWithError("server_error");
  }
  
  // Helper function to redirect with error
  function redirectWithError(errorCode: string) {
    const errorUrl = new URL(`${APP_URL}/dashboard/settings`);
    errorUrl.searchParams.append("tab", "integrations");
    errorUrl.searchParams.append("error", errorCode);
    console.log("Redirecting with error:", errorCode, "to", errorUrl.toString());
    return Response.redirect(errorUrl.toString());
  }
});
