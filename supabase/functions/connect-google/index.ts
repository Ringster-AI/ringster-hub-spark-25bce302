
import { serve } from "http/server";
import { createClient } from "@supabase/supabase-js";

// These will be replaced with the actual environment variables on deployment
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID') || '';
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET') || '';
const REDIRECT_URI = `${SUPABASE_URL}/functions/v1/google-callback`;

serve(async (req) => {
  // Handle CORS for local development
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    // Handle POSTs only
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Create a Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Get the JWT from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Verify JWT to get user info
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized", details: userError }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Generate oauth URL for Google
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/calendar',
    ];

    // Generate a random state to prevent CSRF
    const state = crypto.randomUUID();
    
    // Store state in database temporarily 
    await supabase.from('oauth_states').insert({
      state,
      user_id: user.id,
      created_at: new Date()
    });

    const googleOAuthURL = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleOAuthURL.searchParams.append('client_id', GOOGLE_CLIENT_ID);
    googleOAuthURL.searchParams.append('redirect_uri', REDIRECT_URI);
    googleOAuthURL.searchParams.append('response_type', 'code');
    googleOAuthURL.searchParams.append('scope', scopes.join(' '));
    googleOAuthURL.searchParams.append('access_type', 'offline');
    googleOAuthURL.searchParams.append('prompt', 'consent');
    googleOAuthURL.searchParams.append('state', state);

    return new Response(JSON.stringify({ url: googleOAuthURL.toString() }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      }
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      }
    });
  }
});
