
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  console.log("Request received in store-google-tokens");
  
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log the headers for debugging
    console.log("Request headers:", Object.fromEntries(req.headers.entries()));
    
    // Create Supabase client with service role key (has elevated privileges)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get token data from request body
    const { email, accessToken, refreshToken, expiresAt, scopes } = await req.json();
    
    console.log("Received token data:", { 
      email, 
      hasAccessToken: !!accessToken, 
      hasRefreshToken: !!refreshToken, 
      expiresAt, 
      scopes 
    });
    
    if (!email || !accessToken || !expiresAt || !scopes) {
      console.error("Missing required parameters:", { email, hasAccessToken: !!accessToken, expiresAt, scopes });
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get the current user making the request from the auth header
    const authHeader = req.headers.get("Authorization");
    
    let userId;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
        
        if (userError || !user) {
          console.error("Authentication error with token:", userError);
          return new Response(
            JSON.stringify({ error: "Authentication required", details: userError?.message }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        userId = user.id;
        console.log("User authenticated via token:", userId);
      } catch (authErr) {
        console.error("Error parsing auth token:", authErr);
      }
    }
    
    // If we couldn't get the user from the token, try getting the current session
    if (!userId) {
      console.log("Trying to get user from session");
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        console.error("No valid session found:", sessionError);
        
        // Use admin powers to look up the user by email instead
        console.log("Looking up user by email:", email);
        const { data: userData, error: userLookupError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single();
        
        if (userLookupError || !userData) {
          console.error("Failed to find user by email:", userLookupError);
          return new Response(
            JSON.stringify({ 
              error: "User not found", 
              details: "Could not determine which user to store this integration for" 
            }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        userId = userData.id;
        console.log("Found user by email lookup:", userId);
      } else {
        userId = session.user.id;
        console.log("User authenticated via session:", userId);
      }
    }
    
    console.log("Storing integration for user:", userId);
    
    // Store the integration securely in the database with proper RLS
    const { data, error } = await supabase
      .from("google_integrations")
      .upsert({
        user_id: userId,
        email: email,
        access_token: accessToken,  // These will be encrypted at rest if column encryption is enabled
        refresh_token: refreshToken, // These will be encrypted at rest if column encryption is enabled
        expires_at: expiresAt,
        scopes: scopes
      })
      .select("id");
      
    if (error) {
      console.error("Database error storing integration:", error);
      throw error;
    }
    
    console.log("Integration stored successfully, id:", data?.[0]?.id);
    
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
