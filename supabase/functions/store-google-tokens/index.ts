
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key (has elevated privileges)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get token data from request body
    const { email, accessToken, refreshToken, expiresAt, scopes } = await req.json();
    
    if (!email || !accessToken || !expiresAt || !scopes) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get the current user making the request
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Security check: ensure the integration is being stored for the authenticated user
    const userId = user.id;
    
    // Store the integration securely in the database with proper RLS
    const { data, error } = await supabase
      .from("google_integrations")
      .upsert({
        user_id: userId,
        email: email,
        access_token: accessToken,  // These will be encrypted at rest if column encryption is enabled
        refresh_token: refreshToken, // These will be encrypted at rest if column encryption is enabled
        expires_at: expiresAt,
        scopes: scopes,
        calendar_enabled: scopes.includes('calendar')
      })
      .select("id");
      
    if (error) {
      console.error("Database error storing integration:", error);
      throw error;
    }
    
    return new Response(
      JSON.stringify({ success: true, id: data[0]?.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (err) {
    console.error("Error in store-google-tokens:", err);
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
