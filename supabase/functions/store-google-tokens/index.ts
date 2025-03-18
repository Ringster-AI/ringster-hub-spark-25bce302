
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Request received in store-google-tokens`);
  
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log environment variables availability (without exposing actual values)
    console.log(`[${requestId}] Environment variables check:`, {
      hasSupabaseUrl: !!SUPABASE_URL,
      hasServiceRoleKey: !!SUPABASE_SERVICE_ROLE_KEY
    });
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error(`[${requestId}] Missing required environment variables`);
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Create Supabase client with service role key (has elevated privileges)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get token data from request body
    const requestBody = await req.json();
    console.log(`[${requestId}] Request body received:`, Object.keys(requestBody));
    
    const { email, accessToken, refreshToken, expiresAt, scopes, userId } = requestBody;
    
    console.log(`[${requestId}] Received token data:`, { 
      email, 
      hasAccessToken: !!accessToken, 
      hasRefreshToken: !!refreshToken, 
      expiresAt, 
      scopes,
      hasUserId: !!userId
    });
    
    // Verify authorization
    // This function can be called either with service role key directly or with a user token
    let authorizedUserId = userId;
    
    if (!authorizedUserId) {
      // Check if request comes with user token
      const authHeader = req.headers.get("Authorization");
      
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "");
        
        // Verify this isn't the service role key
        if (token !== SUPABASE_SERVICE_ROLE_KEY) {
          const { data: { user }, error: userError } = await supabase.auth.getUser(token);
          
          if (userError || !user) {
            console.error(`[${requestId}] User authentication failed:`, userError);
            return new Response(
              JSON.stringify({ error: "Authentication error" }),
              { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          
          authorizedUserId = user.id;
          console.log(`[${requestId}] Request authenticated via user token for ${authorizedUserId}`);
        } else {
          console.log(`[${requestId}] Request authenticated via service role key`);
        }
      } else if (!req.headers.get("Authorization") || !req.headers.get("Authorization").includes(SUPABASE_SERVICE_ROLE_KEY)) {
        // Not authenticated with service role or user token
        console.error(`[${requestId}] Unauthorized request`);
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    if (!email || !accessToken || !expiresAt || !scopes) {
      console.error(`[${requestId}] Missing required parameters:`, { 
        email, 
        hasAccessToken: !!accessToken, 
        expiresAt, 
        scopes 
      });
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // If we have a userId, use it directly for token storage
    if (authorizedUserId) {
      console.log(`[${requestId}] Storing integration for user: ${authorizedUserId}`);
      
      // First check if an entry already exists
      const { data: existingData, error: fetchError } = await supabase
        .from("google_integrations")
        .select("id")
        .eq("user_id", authorizedUserId)
        .maybeSingle();
        
      if (fetchError) {
        console.error(`[${requestId}] Error checking for existing integration:`, fetchError);
      }
      
      console.log(`[${requestId}] Existing integration check:`, existingData ? "Found" : "Not found");
      
      // Store the integration securely in the database
      const { data, error } = await supabase
        .from("google_integrations")
        .upsert({
          user_id: authorizedUserId,
          email: email,
          access_token: accessToken,
          refresh_token: refreshToken || null,
          expires_at: expiresAt,
          scopes: scopes
        })
        .select("id");
        
      if (error) {
        console.error(`[${requestId}] Database error storing integration:`, error);
        throw error;
      }
      
      console.log(`[${requestId}] Integration stored successfully, id: ${data?.[0]?.id}`);
      
      return new Response(
        JSON.stringify({ success: true, id: data[0]?.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // If still no userId, try to look up by email
      console.log(`[${requestId}] Looking up user by email: ${email}`);
      const { data: userData, error: userLookupError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
      
      if (userLookupError || !userData) {
        console.error(`[${requestId}] Failed to find user:`, userLookupError);
        return new Response(
          JSON.stringify({ 
            error: "User not found", 
            details: "Could not determine which user to store this integration for" 
          }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Store the integration
      console.log(`[${requestId}] Found user by email lookup: ${userData.id}`);
      const { data, error } = await supabase
        .from("google_integrations")
        .upsert({
          user_id: userData.id,
          email: email,
          access_token: accessToken,
          refresh_token: refreshToken || null,
          expires_at: expiresAt,
          scopes: scopes
        })
        .select("id");
        
      if (error) {
        console.error(`[${requestId}] Database error storing integration:`, error);
        throw error;
      }
      
      console.log(`[${requestId}] Integration stored successfully, id: ${data?.[0]?.id}`);
      
      return new Response(
        JSON.stringify({ success: true, id: data[0]?.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err) {
    console.error(`[${requestId}] Error in store-google-tokens:`, err);
    return new Response(
      JSON.stringify({ 
        error: "Failed to store Google credentials", 
        details: err instanceof Error ? err.message : String(err) 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
