
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "../_shared/cors.ts";
import { encryptToken, decryptToken, isEncrypted } from "../_shared/crypto.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID") || "";
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET") || "";
const TOKEN_ENCRYPTION_KEY = Deno.env.get("TOKEN_ENCRYPTION_KEY") || "";

serve(async (req) => {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Calendar list function called`);
  
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      console.error(`[${requestId}] No authorization header provided`);
      return new Response(
        JSON.stringify({ error: "No authorization header provided" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Create Supabase client with service role key (has elevated privileges)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get the current user making the request using the provided token
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (userError || !user) {
      console.error(`[${requestId}] Authentication error:`, userError);
      return new Response(
        JSON.stringify({ error: "Authentication required", details: userError?.message }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`[${requestId}] Authenticated user: ${user.id}`);
    
    // Get the user's Google integration from the database
    const { data: integration, error: integrationError } = await supabase
      .from("google_integrations")
      .select("*")
      .eq("user_id", user.id)
      .single();
    
    if (integrationError || !integration) {
      console.error(`[${requestId}] Integration error:`, integrationError);
      return new Response(
        JSON.stringify({ error: "Google integration not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`[${requestId}] Found integration for email: ${integration.email}`);
    
    // Decrypt tokens if they're encrypted
    let storedAccessToken = integration.access_token;
    let storedRefreshToken = integration.refresh_token;
    
    if (TOKEN_ENCRYPTION_KEY) {
      try {
        if (isEncrypted(storedAccessToken)) {
          storedAccessToken = await decryptToken(storedAccessToken, TOKEN_ENCRYPTION_KEY);
          console.log(`[${requestId}] Successfully decrypted access token`);
        }
        if (storedRefreshToken && isEncrypted(storedRefreshToken)) {
          storedRefreshToken = await decryptToken(storedRefreshToken, TOKEN_ENCRYPTION_KEY);
          console.log(`[${requestId}] Successfully decrypted refresh token`);
        }
      } catch (decryptError) {
        console.error(`[${requestId}] Error decrypting tokens:`, decryptError);
        return new Response(
          JSON.stringify({ error: "Failed to decrypt stored tokens. Please reconnect your Google account." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    // Check if token is expired
    const now = new Date();
    const tokenExpiry = new Date(integration.expires_at);
    const isTokenExpired = now > tokenExpiry;
    
    console.log(`[${requestId}] Token expires at: ${tokenExpiry.toISOString()}`);
    console.log(`[${requestId}] Current time: ${now.toISOString()}`);
    console.log(`[${requestId}] Token expired: ${isTokenExpired}`);
    
    let accessToken = storedAccessToken;
    
    // If token is expired, attempt to refresh it
    if (isTokenExpired) {
      console.log(`[${requestId}] Refreshing expired token...`);
      
      if (!storedRefreshToken) {
        console.error(`[${requestId}] No refresh token available`);
        return new Response(
          JSON.stringify({ error: "No refresh token available. Please reconnect your Google account." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      try {
        // Use refresh token to get new access token
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            refresh_token: storedRefreshToken,
            grant_type: "refresh_token",
          }),
        });
        
        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json();
          console.error(`[${requestId}] Token refresh failed:`, errorData);
          return new Response(
            JSON.stringify({ error: "Failed to refresh access token", details: errorData }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        const tokenData = await tokenResponse.json();
        console.log(`[${requestId}] Token refreshed successfully`);
        
        // Calculate new expiration time (subtract 5 minutes for safety)
        const expiresInSeconds = tokenData.expires_in - 300;
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + expiresInSeconds);
        
        // Encrypt the new access token before storing if encryption key is available
        let tokenToStore = tokenData.access_token;
        if (TOKEN_ENCRYPTION_KEY) {
          tokenToStore = await encryptToken(tokenData.access_token, TOKEN_ENCRYPTION_KEY);
          console.log(`[${requestId}] Encrypted new access token for storage`);
        }
        
        // Update token in database
        const { error: updateError } = await supabase
          .from("google_integrations")
          .update({
            access_token: tokenToStore,
            expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq("id", integration.id);
        
        if (updateError) {
          console.error(`[${requestId}] Error updating token:`, updateError);
          throw updateError;
        }
        
        accessToken = tokenData.access_token;
        console.log(`[${requestId}] Updated token expires at: ${expiresAt.toISOString()}`);
      } catch (refreshError) {
        console.error(`[${requestId}] Error refreshing token:`, refreshError);
        return new Response(
          JSON.stringify({ 
            error: "Failed to refresh token. Please reconnect your Google account.",
            details: refreshError instanceof Error ? refreshError.message : String(refreshError)
          }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    // Call Google Calendar API to get the user's calendars
    console.log(`[${requestId}] Fetching calendar list...`);
    const calendarResponse = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });
    
    if (!calendarResponse.ok) {
      const errorData = await calendarResponse.json();
      console.error(`[${requestId}] Calendar API error:`, errorData);
      return new Response(
        JSON.stringify({ error: "Failed to fetch calendars", details: errorData }),
        { status: calendarResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const calendarData = await calendarResponse.json();
    console.log(`[${requestId}] Retrieved ${calendarData.items?.length || 0} calendars`);
    
    // Format the response to include only necessary data
    const calendars = (calendarData.items || []).map((calendar: any) => ({
      id: calendar.id,
      summary: calendar.summary,
      primary: calendar.primary || false,
      accessRole: calendar.accessRole,
      backgroundColor: calendar.backgroundColor,
    }));
    
    return new Response(
      JSON.stringify({ calendars }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (err) {
    console.error("Error in google-calendar-list:", err);
    return new Response(
      JSON.stringify({ 
        error: "Failed to fetch calendars", 
        details: err instanceof Error ? err.message : String(err) 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
