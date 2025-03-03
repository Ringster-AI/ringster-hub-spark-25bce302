
import { serve } from "http/server";
import { createClient } from "@supabase/supabase-js";

// These will be replaced with the actual environment variables on deployment
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID') || '';
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET') || '';
const REDIRECT_URI = `${SUPABASE_URL}/functions/v1/google-callback`;
const APP_URL = Deno.env.get('APP_URL') || 'http://localhost:5173';

serve(async (req) => {
  // Parse the URL to get search parameters
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  // Create a Supabase client with service role for admin operations
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // If there's an error in the OAuth process, redirect back with error
  if (error) {
    return Response.redirect(`${APP_URL}/dashboard/settings?tab=integrations&error=${error}`, 302);
  }

  // If no code or state is provided, return error
  if (!code || !state) {
    return Response.redirect(`${APP_URL}/dashboard/settings?tab=integrations&error=missing_params`, 302);
  }

  try {
    // Verify state to prevent CSRF
    const { data: stateData, error: stateError } = await supabase
      .from('oauth_states')
      .select('user_id')
      .eq('state', state)
      .single();

    if (stateError || !stateData) {
      return Response.redirect(`${APP_URL}/dashboard/settings?tab=integrations&error=invalid_state`, 302);
    }

    const userId = stateData.user_id;

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Token exchange error:', errorData);
      return Response.redirect(`${APP_URL}/dashboard/settings?tab=integrations&error=token_exchange`, 302);
    }

    const tokens = await tokenResponse.json();

    // Get user info to store email
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      console.error('Failed to get user info');
      return Response.redirect(`${APP_URL}/dashboard/settings?tab=integrations&error=user_info`, 302);
    }

    const userInfo = await userInfoResponse.json();

    // Calculate token expiration
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in);

    // Store tokens in database (upsert to update if already exists)
    const { error: insertError } = await supabase
      .from('google_integrations')
      .upsert({
        user_id: userId,
        email: userInfo.email,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt.toISOString(),
        scopes: tokens.scope,
        updated_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('DB insert error:', insertError);
      return Response.redirect(`${APP_URL}/dashboard/settings?tab=integrations&error=database`, 302);
    }

    // Clean up the state
    await supabase
      .from('oauth_states')
      .delete()
      .eq('state', state);

    // Redirect back to the app with success
    return Response.redirect(`${APP_URL}/dashboard/settings?tab=integrations&success=true`, 302);
  } catch (error) {
    console.error('Callback error:', error);
    return Response.redirect(`${APP_URL}/dashboard/settings?tab=integrations&error=server_error`, 302);
  }
});
