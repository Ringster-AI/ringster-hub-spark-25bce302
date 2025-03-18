
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

/**
 * Create a Supabase admin client with service role
 */
export function createSupabaseAdmin() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables");
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Look up OAuth state data in the database
 */
export async function lookupOAuthState(state: string, requestId: string) {
  const supabase = createSupabaseAdmin();
  
  console.log(`[${requestId}] Looking up state in database: ${state}`);
  const { data, error } = await supabase
    .from('oauth_states')
    .select('*')
    .eq('state', state)
    .single();
  
  if (error) {
    console.error(`[${requestId}] Error fetching state data:`, error);
    throw new Error(`State lookup failed: ${error.message}`);
  }
  
  if (!data) {
    console.error(`[${requestId}] State not found in database`);
    throw new Error("State not found");
  }
  
  console.log(`[${requestId}] State data retrieved:`, {
    state: data.state,
    hasCodeVerifier: !!data.code_verifier,
    hasReturnUrl: !!data.return_url,
    userId: data.user_id,
    createdAt: data.created_at,
    expiresAt: data.expires_at
  });
  
  return data;
}

/**
 * Delete OAuth state from database
 */
export async function deleteOAuthState(state: string) {
  const supabase = createSupabaseAdmin();
  return await supabase.from('oauth_states').delete().eq('state', state);
}
