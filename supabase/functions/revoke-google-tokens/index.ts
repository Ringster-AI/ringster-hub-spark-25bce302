
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "../_shared/cors.ts";
import { decryptToken, isEncrypted } from "../_shared/crypto.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID") || "";
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET") || "";
const TOKEN_ENCRYPTION_KEY = Deno.env.get("TOKEN_ENCRYPTION_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "No authorization header provided" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Create Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get the current user using the authorization token from the request
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (userError || !user) {
      console.error("Authentication error:", userError);
      return new Response(
        JSON.stringify({ error: "Authentication required", details: userError?.message }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("Authenticated user:", user.id);
    const userId = user.id;
    
    // Get the user's Google integration
    const { data: integrationData, error: integrationError } = await supabase
      .from("google_integrations")
      .select("refresh_token")
      .eq("user_id", userId)
      .single();
      
    if (integrationError && integrationError.code !== "PGRST116") {
      console.error("Error fetching integration:", integrationError);
      throw integrationError;
    }
    
    // If there's a refresh token, revoke it with Google
    if (integrationData?.refresh_token) {
      try {
        console.log("Revoking token for user:", userId);
        
        // Decrypt the refresh token if it's encrypted
        let refreshToken = integrationData.refresh_token;
        if (TOKEN_ENCRYPTION_KEY && isEncrypted(refreshToken)) {
          try {
            refreshToken = await decryptToken(refreshToken, TOKEN_ENCRYPTION_KEY);
            console.log("Successfully decrypted refresh token for revocation");
          } catch (decryptError) {
            console.error("Error decrypting refresh token:", decryptError);
            // Continue with deletion even if decryption fails
          }
        }
        
        const revokeResponse = await fetch("https://oauth2.googleapis.com/revoke", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            token: refreshToken,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET
          })
        });
        
        const revokeStatus = revokeResponse.status;
        console.log("Token revocation status:", revokeStatus);
        
        if (!revokeResponse.ok) {
          const revokeError = await revokeResponse.text();
          console.error("Error from Google revoke API:", revokeError);
        }
      } catch (revokeError) {
        // Log but continue - we still want to remove from database even if revocation fails
        console.error("Error revoking token:", revokeError);
      }
    } else {
      console.log("No refresh token found for user:", userId);
    }
    
    // Delete the integration from database
    const { error: deleteError } = await supabase
      .from("google_integrations")
      .delete()
      .eq("user_id", userId);
      
    if (deleteError) {
      console.error("Error deleting integration:", deleteError);
      throw deleteError;
    }
    
    console.log("Successfully removed Google integration for user:", userId);
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (err) {
    console.error("Error in revoke-google-tokens:", err);
    return new Response(
      JSON.stringify({ 
        error: "Failed to revoke Google credentials", 
        details: err instanceof Error ? err.message : String(err) 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
