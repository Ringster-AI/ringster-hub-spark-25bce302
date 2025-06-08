
import { supabase } from "@/integrations/supabase/client";

export class VapiAssistantUpdateService {
  static async syncAgentWithVapi(agentId: string) {
    console.log(`Syncing agent ${agentId} with VAPI assistant`);
    
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

    // Call the Netlify function to update the VAPI assistant
    try {
      const response = await fetch('/.netlify/functions/manage-vapi-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: agentId,
          action: 'update' // Add action parameter to distinguish from creation
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Netlify function request failed: ${errorText}`);
        throw new Error(`Failed to update VAPI assistant: ${errorText}`);
      }

      const result = await response.json();
      console.log(`Successfully synced agent ${agentId} with VAPI assistant ${assistantId}`, result);
      return result;
    } catch (error) {
      console.error(`Failed to sync agent ${agentId} with VAPI:`, error);
      throw error;
    }
  }
}
