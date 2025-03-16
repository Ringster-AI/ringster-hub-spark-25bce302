
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
    
    // Get the current user making the request
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get the user's Google integration from the database
    const { data: integration, error: integrationError } = await supabase
      .from("google_integrations")
      .select("*")
      .eq("user_id", user.id)
      .single();
    
    if (integrationError || !integration) {
      return new Response(
        JSON.stringify({ error: "Google integration not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Call Google Calendar API to get the user's calendars
    const calendarResponse = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
      headers: {
        "Authorization": `Bearer ${integration.access_token}`,
      },
    });
    
    if (!calendarResponse.ok) {
      // If token expired, try to refresh it
      if (calendarResponse.status === 401) {
        console.log("Token expired, attempting to refresh...");
        
        // Refresh token logic would go here
        // For now, return an error
        return new Response(
          JSON.stringify({ error: "Access token expired. Please reconnect your Google account." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorData = await calendarResponse.json();
      return new Response(
        JSON.stringify({ error: "Failed to fetch calendars", details: errorData }),
        { status: calendarResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const calendarData = await calendarResponse.json();
    
    // Format the response to include only necessary data
    const calendars = calendarData.items.map((calendar: any) => ({
      id: calendar.id,
      summary: calendar.summary,
      primary: calendar.primary || false,
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
