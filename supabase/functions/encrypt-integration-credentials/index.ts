import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encryptToken, isEncrypted } from "../_shared/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const encryptionKey = Deno.env.get("TOKEN_ENCRYPTION_KEY");

    if (!encryptionKey) {
      return new Response(
        JSON.stringify({ error: "TOKEN_ENCRYPTION_KEY not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // For migration: accept TOKEN_ENCRYPTION_KEY as auth or service role key
    const authHeader = req.headers.get("Authorization");
    const body = await req.json().catch(() => ({}));
    const migrationKey = body.migration_key;
    
    const isServiceRole = authHeader?.replace("Bearer ", "") === supabaseServiceKey;
    const isMigrationKey = migrationKey === encryptionKey;
    
    if (!isServiceRole && !isMigrationKey) {
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(
          JSON.stringify({ error: "Authentication required" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
        );
      }
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const anonClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await anonClient.auth.getUser(token);
      if (userError || !userData?.user) {
        return new Response(
          JSON.stringify({ error: "Invalid token" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
        );
      }
    }

    // Fetch all integrations with credentials
    const { data: integrations, error: fetchError } = await supabaseAdmin
      .from("integrations")
      .select("id, credentials");

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    let encrypted = 0;
    let skipped = 0;

    for (const integration of integrations || []) {
      const creds = integration.credentials as Record<string, any>;
      if (!creds || Object.keys(creds).length === 0) {
        skipped++;
        continue;
      }

      // Check if credentials are already encrypted (stored as { encrypted: "base64..." })
      if (creds.encrypted && typeof creds.encrypted === "string") {
        skipped++;
        continue;
      }

      // Encrypt the entire credentials object as a single encrypted blob
      const encryptedBlob = await encryptToken(JSON.stringify(creds), encryptionKey);
      
      const { error: updateError } = await supabaseAdmin
        .from("integrations")
        .update({ credentials: { encrypted: encryptedBlob } })
        .eq("id", integration.id);

      if (updateError) {
        console.error(`Failed to encrypt credentials for integration ${integration.id}:`, updateError);
      } else {
        encrypted++;
      }
    }

    return new Response(
      JSON.stringify({ 
        message: "Credential encryption complete",
        encrypted,
        skipped,
        total: (integrations || []).length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error encrypting credentials:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
