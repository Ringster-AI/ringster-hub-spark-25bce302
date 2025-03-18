
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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

    // Create Supabase client for database operations
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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
      console.log(`[${requestId}] Looking up state in database: ${state}`);
      const { data, error: stateError } = await supabase
        .from('oauth_states')
        .select('*')
        .eq('state', state)
        .single();
      
      if (stateError) {
        console.error(`[${requestId}] Error fetching state data:`, stateError);
        return redirectWithError("invalid_state", requestId);
      }
      
      if (!data) {
        console.error(`[${requestId}] State not found in database`);
        return redirectWithError("invalid_state", requestId);
      }
      
      stateData = data;
      console.log(`[${requestId}] State data retrieved:`, {
        state: stateData.state,
        hasCodeVerifier: !!stateData.code_verifier,
        hasReturnUrl: !!stateData.return_url,
        userId: stateData.user_id,
        createdAt: stateData.created_at,
        expiresAt: stateData.expires_at
      });
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
    
    // IMPORTANT: Use URLSearchParams for proper x-www-form-urlencoded format
    const tokenParams = new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
      code_verifier: codeVerifier, // Add PKCE code verifier
    });
    
    console.log(`[${requestId}] Token request parameters:`, 
      Object.fromEntries([...tokenParams.entries()].filter(([key]) => key !== 'client_secret')));
    console.log(`[${requestId}] Redirect URI: ${redirectUri}`);
    
    // Add timeout protection
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
    
    try {
      console.log(`[${requestId}] Making token exchange request`);
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

      console.log(`[${requestId}] Token exchange response status: ${tokenResponse.status}`);
      
      const tokenResponseText = await tokenResponse.text();
      console.log(`[${requestId}] Raw token response (first 100 chars): ${tokenResponseText.substring(0, 100)}...`);
      
      let tokenData;
      try {
        tokenData = JSON.parse(tokenResponseText);
        console.log(`[${requestId}] Token data parsed successfully`);
      } catch (parseError) {
        console.error(`[${requestId}] Error parsing token response:`, parseError);
        return redirectWithError("invalid_response", requestId);
      }
      
      if (!tokenResponse.ok) {
        console.error(`[${requestId}] Error exchanging code for tokens:`, tokenData);
        return redirectWithError(tokenData.error || "token_error", requestId);
      }

      // Get user info from Google to get the email
      try {
        console.log(`[${requestId}] Requesting user info from Google...`);
        const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        });

        console.log(`[${requestId}] User info response status: ${userInfoResponse.status}`);
        
        const userInfoText = await userInfoResponse.text();
        console.log(`[${requestId}] Raw user info response: ${userInfoText}`);
        
        let userInfo;
        try {
          userInfo = JSON.parse(userInfoText);
          console.log(`[${requestId}] User info parsed successfully: ${JSON.stringify({
            email: userInfo.email,
            id: userInfo.id,
            verified_email: userInfo.verified_email
          })}`);
        } catch (parseError) {
          console.error(`[${requestId}] Error parsing user info response:`, parseError);
          return redirectWithError("userinfo_parse_error", requestId);
        }

        if (!userInfoResponse.ok) {
          console.error(`[${requestId}] Error getting user info:`, userInfo);
          return redirectWithError("userinfo_error", requestId);
        }

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
        // This is done using a server-to-server call to avoid tokens in URL
        if (userId) {
          try {
            console.log(`[${requestId}] Storing tokens securely for user ${userId}`);
            
            const storeResponse = await fetch(`${SUPABASE_URL}/functions/v1/store-google-tokens`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
              },
              body: JSON.stringify({
                userId,
                email: userInfo.email,
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token || '',
                expiresAt: expiresAt.toISOString(),
                scopes: tokenData.scope
              })
            });
            
            const storeResponseText = await storeResponse.text();
            console.log(`[${requestId}] Store tokens response status: ${storeResponse.status}`);
            console.log(`[${requestId}] Store tokens response: ${storeResponseText}`);
            
            let storeResult;
            try {
              storeResult = JSON.parse(storeResponseText);
            } catch (parseError) {
              console.error(`[${requestId}] Error parsing store response:`, parseError, storeResponseText);
              return redirectWithError("storage_parse_error", requestId);
            }
            
            if (!storeResponse.ok) {
              console.error(`[${requestId}] Error storing tokens:`, storeResult);
              return redirectWithError("storage_error", requestId);
            }
            
            console.log(`[${requestId}] Tokens stored successfully:`, storeResult);
          } catch (storeError) {
            console.error(`[${requestId}] Error calling token storage function:`, storeError);
            return redirectWithError("storage_error", requestId);
          }
        } else {
          console.warn(`[${requestId}] No user ID available, cannot store tokens securely`);
          return redirectWithError("missing_user_id", requestId);
        }

        // After storing tokens, redirect to success URL with minimal parameters
        // Don't include any sensitive tokens in URL
        const redirectUrl = new URL(returnUrl);
        redirectUrl.searchParams.append("success", "true");
        redirectUrl.searchParams.append("email", userInfo.email);
        redirectUrl.searchParams.append("googleConnected", "true");
        redirectUrl.searchParams.append("googleScopes", tokenData.scope);
        
        // Add timestamp as cache-buster
        redirectUrl.searchParams.append("ts", Date.now().toString());
        
        const redirectString = redirectUrl.toString();
        console.log(`[${requestId}] Redirecting to: ${redirectString.substring(0, 100)}...`);
        
        // Clean up the used state entry
        await supabase.from('oauth_states').delete().eq('state', state);
        
        // Create new response object with headers
        return Response.redirect(redirectString, {
          headers: {
            "Access-Control-Allow-Origin": APP_URL,
            "Access-Control-Allow-Credentials": "true",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "X-Content-Type-Options": "nosniff"
          }
        });
      } catch (userInfoError) {
        console.error(`[${requestId}] Error in user info request:`, userInfoError);
        return redirectWithError("userinfo_request_error", requestId);
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
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
  
  // Helper function to redirect with error
  function redirectWithError(errorCode: string, reqId: string) {
    const errorMessages: Record<string, string> = {
      "server_config_error": "Server configuration error",
      "no_code": "No authorization code received",
      "invalid_state": "Invalid state parameter",
      "expired_state": "Authorization request expired",
      "invalid_response": "Invalid response from Google",
      "token_error": "Error exchanging code for tokens",
      "token_exchange_error": "Error during token exchange with Google",
      "userinfo_error": "Error retrieving user information",
      "userinfo_parse_error": "Error parsing user information",
      "userinfo_request_error": "Error requesting user information",
      "request_timeout": "Request timed out",
      "storage_error": "Error storing integration data",
      "storage_parse_error": "Error parsing storage response",
      "missing_user_id": "Missing user ID for token storage",
      "database_error": "Database query error",
      "auth_error": "Authentication error",
      "access_denied": "Access denied by user",
      "server_error": "Unexpected server error"
    };
    
    const errorMessage = errorMessages[errorCode] || "Unknown error";
    console.error(`[${reqId}] Error: ${errorCode} - ${errorMessage}`);
    
    const errorUrl = new URL(`${APP_URL}/dashboard/settings`);
    errorUrl.searchParams.append("tab", "integrations");
    errorUrl.searchParams.append("error", errorCode);
    errorUrl.searchParams.append("errorMessage", errorMessage);
    // Add timestamp as cache-buster
    errorUrl.searchParams.append("ts", Date.now().toString());
    console.log(`[${reqId}] Redirecting with error: ${errorCode} to ${errorUrl.toString()}`);
    
    // Create a new response with headers instead of modifying an existing one
    return Response.redirect(errorUrl.toString(), {
      headers: {
        "Access-Control-Allow-Origin": APP_URL,
        "Access-Control-Allow-Credentials": "true",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "X-Content-Type-Options": "nosniff"
      }
    });
  }
});
