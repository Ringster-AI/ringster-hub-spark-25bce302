
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.1";
import { corsHeaders } from "../_shared/cors.ts";

const CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
const REDIRECT_URI = `${Deno.env.get("SUPABASE_URL") || ""}/functions/v1/google-callback`;
const APP_URL = Deno.env.get("APP_URL") || "http://localhost:5173";

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate environmental variables
    if (!CLIENT_ID) {
      console.error("GOOGLE_CLIENT_ID environment variable is not set");
      return new Response(
        JSON.stringify({ error: "Server configuration error: Missing Google Client ID" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase environment variables are not set");
      return new Response(
        JSON.stringify({ error: "Server configuration error: Missing Supabase credentials" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authentication token from request header
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    
    // Verify the token and get user (optional but recommended for security)
    if (token) {
      const { data, error } = await supabase.auth.getUser(token);
      if (error) {
        console.error("Error verifying token:", error);
        return new Response(
          JSON.stringify({ error: "Unauthorized: Invalid authentication token" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.log("User authenticated:", data.user.id);
    }

    // Generate OAuth URL with scopes
    const scopes = [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/calendar",
    ];

    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.append("client_id", CLIENT_ID);
    url.searchParams.append("redirect_uri", REDIRECT_URI);
    url.searchParams.append("response_type", "code");
    url.searchParams.append("scope", scopes.join(" "));
    url.searchParams.append("access_type", "offline");
    url.searchParams.append("prompt", "consent");
    
    // Add state parameter with return URL
    url.searchParams.append("state", `return_to=${APP_URL}/dashboard/settings?tab=integrations`);

    return new Response(
      JSON.stringify({ url: url.toString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error generating OAuth URL:", err);
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate OAuth URL", 
        details: err instanceof Error ? err.message : String(err) 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
