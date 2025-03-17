
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
    // Log environment variables availability (without exposing actual values)
    console.log("Environment variables check:", {
      hasSupabaseUrl: !!SUPABASE_URL,
      hasServiceRoleKey: !!SUPABASE_SERVICE_ROLE_KEY
    });
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Create Supabase client with service role key (has elevated privileges)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get token data from request body
    const requestBody = await req.json();
    console.log("Request body received:", Object.keys(requestBody));
    
    const { email, accessToken, refreshToken, expiresAt, scopes, userId } = requestBody;
    
    console.log("Received token data:", { 
      email, 
      hasAccessToken: !!accessToken, 
      hasRefreshToken: !!refreshToken, 
      expiresAt, 
      scopes,
      hasUserId: !!userId
    });
    
    // Log headers for debugging
    console.log("Request headers:", Object.fromEntries([...req.headers.entries()]));
    
    if (!email || !accessToken || !expiresAt || !scopes) {
      console.error("Missing required parameters:", { 
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
    
    // If userId is provided directly, use it
    let userIdToUse = userId;
    
    // If no userId provided, try to get it from the auth header
    if (!userIdToUse) {
      const authHeader = req.headers.get("Authorization");
      
      if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
          console.log("Found Authorization header, attempting to get user");
          const token = authHeader.replace("Bearer ", "");
          console.log("Token length:", token.length);
          
          const { data: { user }, error: userError } = await supabase.auth.getUser(token);
          
          if (userError || !user) {
            console.error("Authentication error with token:", userError);
          } else {
            userIdToUse = user.id;
            console.log("User authenticated via token:", userIdToUse);
          }
        } catch (authErr) {
          console.error("Error parsing auth token:", authErr);
        }
      } else {
        console.log("No authorization header found or header doesn't start with 'Bearer '");
        console.log("Auth header value:", authHeader);
      }
    }
    
    // If we still don't have a userId, try to find user by email
    if (!userIdToUse) {
      console.log("Looking up user by email:", email);
      const { data: userData, error: userLookupError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
      
      if (userLookupError || !userData) {
        console.error("Failed to find user by email lookup:", userLookupError);
        
        // As a final fallback, try to find the user directly in auth.users
        console.log("Attempting to list users as final fallback");
        const { data: authUser, error: authUserError } = await supabase.auth.admin.listUsers();
        
        if (authUserError) {
          console.error("Error listing users:", authUserError);
        } else {
          console.log(`Found ${authUser.users.length} users in auth.users`);
          const matchingUser = authUser.users.find(u => u.email === email);
          if (matchingUser) {
            userIdToUse = matchingUser.id;
            console.log("Found user in auth.users:", userIdToUse);
          } else {
            console.log("No matching user found in auth.users");
          }
        }
        
        if (!userIdToUse) {
          return new Response(
            JSON.stringify({ 
              error: "User not found", 
              details: "Could not determine which user to store this integration for" 
            }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } else {
        userIdToUse = userData.id;
        console.log("Found user by email lookup:", userIdToUse);
      }
    }
    
    console.log("Storing integration for user:", userIdToUse);
    
    // Store the integration securely in the database
    const { data, error } = await supabase
      .from("google_integrations")
      .upsert({
        user_id: userIdToUse,
        email: email,
        access_token: accessToken,
        refresh_token: refreshToken,
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
