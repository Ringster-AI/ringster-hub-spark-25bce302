
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const clientId = Deno.env.get("GOOGLE_CLIENT_ID")!;
const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET")!;
const redirectUri = `${supabaseUrl}/functions/v1/google-callback`;
const frontendUrl = Deno.env.get("FRONTEND_URL") || supabaseUrl;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
}

serve(async (req) => {
  // Get the authorization code from the URL
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state'); // This contains the user ID
  const error = url.searchParams.get('error');

  if (error) {
    console.error('Google OAuth error:', error);
    return Response.redirect(`${frontendUrl}/dashboard/settings?tab=integrations&error=${error}`);
  }

  if (!code || !state) {
    console.error('Missing code or state parameter');
    return Response.redirect(`${frontendUrl}/dashboard/settings?tab=integrations&error=missing_params`);
  }

  try {
    // Exchange the authorization code for an access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Error exchanging code for token:', errorData);
      return Response.redirect(`${frontendUrl}/dashboard/settings?tab=integrations&error=token_exchange_failed`);
    }

    const tokenData: GoogleTokenResponse = await tokenResponse.json();
    
    // Get user info from Google to verify the email
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });
    
    if (!userInfoResponse.ok) {
      console.error('Error fetching user info from Google');
      return Response.redirect(`${frontendUrl}/dashboard/settings?tab=integrations&error=user_info_failed`);
    }
    
    const userInfo = await userInfoResponse.json();
    
    // Store the tokens in the database
    const { error: dbError } = await supabase
      .from('google_integrations')
      .upsert({
        user_id: state,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expiry: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        scopes: tokenData.scope,
        email: userInfo.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error('Error storing tokens in database:', dbError);
      return Response.redirect(`${frontendUrl}/dashboard/settings?tab=integrations&error=database_error`);
    }

    // Redirect back to the settings page with a success parameter
    return Response.redirect(`${frontendUrl}/dashboard/settings?tab=integrations&success=true`);
  } catch (error) {
    console.error('Error in google-callback function:', error);
    return Response.redirect(`${frontendUrl}/dashboard/settings?tab=integrations&error=server_error`);
  }
});
