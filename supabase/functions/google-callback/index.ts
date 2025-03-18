
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { redirectWithError, createSuccessRedirect } from "../_shared/responses.ts";
import { lookupOAuthState, deleteOAuthState } from "../_shared/supabase-admin.ts";
import { exchangeCodeForTokens, fetchUserInfo, storeTokens } from "./google-api.ts";

const CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
const CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
const APP_URL = Deno.env.get("APP_URL") || "http://localhost:5173";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Google OAuth callback received`);
  console.log(`[${requestId}] Request method: ${req.method}`);
  console.log(`[${requestId}] Request URL: ${req.url}`);
  
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate environment variables
    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.error(`[${requestId}] Missing Google OAuth credentials:`, { 
        hasClientId: !!CLIENT_ID, 
        hasClientSecret: !!CLIENT_SECRET 
      });
      return redirectWithError("server_config_error", requestId);
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error(`[${requestId}] Missing Supabase environment variables`);
      return redirectWithError("server_config_error", requestId);
    }

    // Get the authorization code and state from the URL
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");
    const state = url.searchParams.get("state") || "";
    
    console.log(`[${requestId}] Received OAuth callback with state: ${state}`);
    console.log(`[${requestId}] Authorization code present: ${!!code}`);
    console.log(`[${requestId}] Error present: ${!!error}`);
    
    // Handle OAuth errors
    if (error) {
      console.error(`[${requestId}] Error from Google OAuth: ${error}`);
      return redirectWithError(error, requestId);
    }

    if (!code) {
      console.error(`[${requestId}] No authorization code received`);
      return redirectWithError("no_code", requestId);
    }

    // Verify state parameter and get code_verifier
    if (!state) {
      console.error(`[${requestId}] Missing state parameter`);
      return redirectWithError("invalid_state", requestId);
    }

    // Look up state in database
    let stateData;
    try {
      stateData = await lookupOAuthState(state, requestId);
    } catch (stateQueryError) {
      console.error(`[${requestId}] Exception querying state:`, stateQueryError);
      return redirectWithError("database_error", requestId);
    }

    // Check if state has expired
    if (new Date(stateData.expires_at) < new Date()) {
      console.error(`[${requestId}] State token has expired`);
      return redirectWithError("expired_state", requestId);
    }

    const codeVerifier = stateData.code_verifier;
    const returnUrl = stateData.return_url;
    const userId = stateData.user_id;

    console.log(`[${requestId}] State verified, return URL: ${returnUrl}`);
    console.log(`[${requestId}] Associated user ID: ${userId || 'none'}`);

    // Exchange the authorization code for access and refresh tokens
    console.log(`[${requestId}] Exchanging code for tokens...`);
    const redirectUri = `${SUPABASE_URL}/functions/v1/google-callback`;
    
    try {
      // Exchange code for tokens
      const tokenData = await exchangeCodeForTokens(
        code, 
        CLIENT_ID, 
        CLIENT_SECRET, 
        redirectUri, 
        codeVerifier,
        requestId
      );

      // Get user info from Google
      try {
        const userInfo = await fetchUserInfo(tokenData.access_token, requestId);
        console.log(`[${requestId}] User info retrieved: ${userInfo.email}`);

        // Calculate token expiration time with 5 minute buffer
        const expiresInSeconds = tokenData.expires_in - 300; // 5 minute buffer
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + expiresInSeconds);

        // Check for calendar scope
        const calendarScope = 'https://www.googleapis.com/auth/calendar';
        const hasCalendarScope = tokenData.scope.includes(calendarScope);
        console.log(`[${requestId}] Has calendar scope: ${hasCalendarScope}`);

        // Store tokens securely via store-google-tokens function
        if (userId) {
          try {
            await storeTokens(
              userId,
              userInfo.email,
              tokenData.access_token,
              tokenData.refresh_token,
              expiresAt.toISOString(),
              tokenData.scope,
              SUPABASE_URL,
              SUPABASE_SERVICE_ROLE_KEY,
              requestId
            );
          } catch (storeError) {
            console.error(`[${requestId}] Error calling token storage function:`, storeError);
            return redirectWithError("storage_error", requestId);
          }
        } else {
          console.warn(`[${requestId}] No user ID available, cannot store tokens securely`);
          return redirectWithError("missing_user_id", requestId);
        }

        // Clean up the used state entry
        await deleteOAuthState(state);
        
        // Redirect to success URL with minimal parameters
        return createSuccessRedirect(returnUrl, userInfo, tokenData, requestId);
      } catch (userInfoError) {
        console.error(`[${requestId}] Error in user info request:`, userInfoError);
        return redirectWithError("userinfo_request_error", requestId);
      }
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        console.error(`[${requestId}] Token request timed out`);
        return redirectWithError("request_timeout", requestId);
      }
      console.error(`[${requestId}] Fetch error in token exchange:`, fetchError);
      return redirectWithError("token_exchange_error", requestId);
    }
  } catch (err) {
    console.error(`[${requestId}] Unexpected error in Google callback:`, err);
    console.error(`[${requestId}] Error details:`, err.stack || JSON.stringify(err));
    return redirectWithError("server_error", requestId);
  }
});
