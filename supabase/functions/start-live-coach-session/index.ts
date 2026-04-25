import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Validate the user JWT
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = userData.user.id;

    // Use service role for the access check + insert
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: accessData, error: accessError } = await admin.rpc('has_live_coach_access', {
      p_user_id: userId,
    });
    if (accessError) {
      console.error('Access check failed:', accessError);
      return new Response(JSON.stringify({ error: 'Access check failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const access = accessData as {
      allowed: boolean;
      sessions_used: number;
      limit: number | null;
      plan_name: string;
    };

    if (!access.allowed) {
      return new Response(
        JSON.stringify({
          error: 'limit_reached',
          sessions_used: access.sessions_used,
          limit: access.limit,
          plan_name: access.plan_name,
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Insert a new session
    const { data: session, error: insertError } = await admin
      .from('live_coach_sessions')
      .insert({ user_id: userId })
      .select('session_token, expires_at')
      .single();

    if (insertError || !session) {
      console.error('Insert failed:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to create session' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        session_token: session.session_token,
        expires_at: session.expires_at,
        sessions_used: access.sessions_used + 1,
        limit: access.limit,
        plan_name: access.plan_name,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('start-live-coach-session error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
