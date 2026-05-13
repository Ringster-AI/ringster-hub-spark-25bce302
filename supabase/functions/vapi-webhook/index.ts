// Vapi end-of-call webhook → finalize_call RPC (idempotent, single transaction)
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-vapi-secret, x-vapi-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPI_SERVER_SECRET = Deno.env.get("VAPI_SERVER_SECRET");

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function ok(body: unknown = { received: true }, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return ok({ error: "method not allowed" }, 405);

  // Shared-secret auth (configured as `server.secret` on the Vapi assistant)
  if (VAPI_SERVER_SECRET) {
    const provided = req.headers.get("x-vapi-secret") ?? req.headers.get("x-vapi-signature");
    if (provided !== VAPI_SERVER_SECRET) {
      console.warn("vapi-webhook: bad secret");
      return ok({ error: "unauthorized" }, 401);
    }
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return ok({ error: "invalid json" }, 400);
  }

  const message = payload?.message ?? payload;
  const type = message?.type;

  // Vapi fires many event types — we only act on the final report
  if (type !== "end-of-call-report") {
    return ok({ ignored: type ?? "unknown" });
  }

  try {
    const call = message.call ?? {};
    const artifact = message.artifact ?? {};
    const metadata = call.metadata ?? message.metadata ?? {};

    const vapiCallId: string | undefined = call.id ?? message.callId;
    const assistantId: string | undefined = call.assistantId ?? message.assistantId;
    const durationSeconds: number = Math.round(
      message.durationSeconds ?? message.duration ?? call.duration ?? 0
    );
    const startedAt = message.startedAt ?? call.startedAt ?? null;
    const endedAt = message.endedAt ?? call.endedAt ?? null;
    const fromNumber = call.customer?.number ?? call.from ?? null;
    const toNumber = call.phoneNumber?.number ?? call.to ?? null;
    const recordingUrl = artifact.recordingUrl ?? message.recordingUrl ?? null;
    const transcriptUrl = artifact.transcript ?? message.transcript ?? null;

    if (!vapiCallId) return ok({ error: "missing call id" }, 400);

    // Resolve user_id + agent_id: prefer metadata, fall back to assistant lookup
    let userId: string | null = metadata.user_id ?? metadata.userId ?? null;
    let agentId: string | null = metadata.agent_id ?? metadata.agentId ?? null;

    if ((!userId || !agentId) && assistantId) {
      const { data: agent } = await admin
        .from("agent_configs")
        .select("id, user_id")
        .eq("vapi_assistant_id", assistantId)
        .maybeSingle();
      if (agent) {
        userId = userId ?? agent.user_id;
        agentId = agentId ?? agent.id;
      }
    }

    if (!userId || !agentId) {
      console.error("vapi-webhook: cannot resolve user/agent", { vapiCallId, assistantId });
      return ok({ error: "agent not resolvable" }, 200); // 200 so Vapi stops retrying
    }

    const { data, error } = await admin.rpc("finalize_call", {
      p_user_id: userId,
      p_agent_id: agentId,
      p_vapi_call_id: vapiCallId,
      p_duration_seconds: durationSeconds,
      p_from_number: fromNumber,
      p_to_number: toNumber,
      p_recording_url: typeof recordingUrl === "string" ? recordingUrl : null,
      p_transcript_url: typeof transcriptUrl === "string" ? transcriptUrl : null,
      p_started_at: startedAt,
      p_ended_at: endedAt,
    });

    if (error) {
      console.error("finalize_call failed", error);
      return ok({ error: error.message }, 500);
    }

    return ok({ call_log_id: data, minutes_charged: Math.max(1, Math.ceil(durationSeconds / 60)) });
  } catch (err: any) {
    console.error("vapi-webhook error", err);
    return ok({ error: err?.message ?? "unknown" }, 500);
  }
});
