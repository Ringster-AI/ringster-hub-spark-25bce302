
import { supabase } from "@/integrations/supabase/client";
import { getNetlifyFunctionsUrl } from "@/utils/netlifyFunctions";

export class VapiAssistantUpdateService {
  static async syncAgentWithVapi(agentId: string) {
    console.log(`Syncing agent ${agentId} with VAPI assistant`);
    
    // Get the current session for authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error("No active session for VAPI sync");
      throw new Error("Authentication required to sync agent");
    }
    
    // Get agent data from Supabase
    const { data: agent, error } = await supabase
      .from("agent_configs")
      .select("*")
      .eq("id", agentId)
      .single();

    if (error || !agent) {
      console.error("Error fetching agent:", error);
      throw new Error("Failed to fetch agent data");
    }

    // Use the dedicated vapi_assistant_id column from the database
    const assistantId = agent.vapi_assistant_id;

    if (!assistantId) {
      console.log("No VAPI assistant ID found for agent, skipping sync");
      return;
    }

    // Call the Netlify function to update the VAPI assistant with retry
    const requestId = `assist-sync-${agentId}-${Date.now()}`;
    const maxRetries = 2;
    const baseDelayMs = 300;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(getNetlifyFunctionsUrl('manage-vapi-assistant'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-request-id': requestId,
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            agentId: agentId,
            action: 'update'
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to update VAPI assistant: ${errorText}`);
        }

        const result = await response.json();
        console.log(`Successfully synced agent ${agentId} with VAPI assistant ${assistantId}`, {
          requestId,
          toolIds: result.toolIds,
          transferToolId: result.transferToolId,
          calendarToolsAttached: result.calendarToolsAttached,
          globalToolsAvailable: result.globalToolsAvailable,
          action: result.action,
        });
        return result;
      } catch (error) {
        console.error(`Sync attempt ${attempt + 1} failed for agent ${agentId}`, { requestId, error });
        if (attempt === maxRetries) throw error;
        const delay = baseDelayMs * Math.pow(2, attempt);
        await new Promise((res) => setTimeout(res, delay));
      }
    }

  }
}
