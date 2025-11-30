
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
    
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    console.log(`[${requestId}] Authorization header present: ${!!authHeader}`);
    
    if (!authHeader) {
      console.error(`[${requestId}] No authorization header provided`);
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
    
    if (!email || !accessToken || !expiresAt || !scopes || !userId) {
      console.error(`[${requestId}] Missing required parameters:`, { 
        email: !!email, 
        hasAccessToken: !!accessToken, 
        expiresAt: !!expiresAt, 
        scopes: !!scopes,
        userId: !!userId
      });
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check if the authorization header matches our service role key
    const token = authHeader.replace('Bearer ', '');
    if (token !== SUPABASE_SERVICE_ROLE_KEY) {
      console.error(`[${requestId}] Invalid authorization token`);
      return new Response(
        JSON.stringify({ error: "Invalid authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`[${requestId}] Storing integration for user: ${userId}`);
    
    try {
      // First check if an entry already exists
      const { data: existingData, error: fetchError } = await supabase
        .from("google_integrations")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();
        
      if (fetchError) {
        console.error(`[${requestId}] Error checking for existing integration:`, fetchError);
      }
      
      console.log(`[${requestId}] Existing integration check:`, existingData ? "Found" : "Not found");
      
      // Store the integration securely in the database
      const { data, error } = await supabase
        .from("google_integrations")
        .upsert({
          user_id: userId,
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
    } catch (dbError) {
      console.error(`[${requestId}] Database operation failed:`, dbError);
      return new Response(
        JSON.stringify({ error: "Database operation failed", details: String(dbError) }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
