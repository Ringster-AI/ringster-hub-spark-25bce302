
import { supabase } from "@/integrations/supabase/client";

interface VapiAssistantUpdateData {
  name?: string;
  firstMessage?: string;
  systemMessage?: string;
  model?: {
    provider: string;
    model: string;
    toolIds?: string[];
  };
  voice?: {
    provider: string;
    voiceId: string;
  };
}

export class VapiAssistantUpdateService {
  private static async makeVapiRequest(endpoint: string, method: string, data?: any) {
    console.log(`Making ${method} request to VAPI: ${endpoint}`);
    
    // Get VAPI API key from environment
    const vapiApiKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;
    if (!vapiApiKey) {
      throw new Error('VAPI API key not configured');
    }

    const response = await fetch(`https://api.vapi.ai${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${vapiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`VAPI request failed: ${errorText}`);
      throw new Error(`VAPI request failed: ${errorText}`);
    }

    return response.json();
  }

  static async updateAssistant(assistantId: string, agentData: any) {
    console.log(`Updating VAPI assistant ${assistantId} with new data`);
    
    const updateData: VapiAssistantUpdateData = {
      name: agentData.name,
      firstMessage: agentData.greeting,
      systemMessage: agentData.description,
    };

    // Add voice configuration if available
    if (agentData.voice_id) {
      updateData.voice = {
        provider: "11labs",
        voiceId: String(agentData.voice_id),
      };
    }

    // Add model configuration
    updateData.model = {
      provider: "openai",
      model: "gpt-4",
    };

    return this.makeVapiRequest(`/assistant/${assistantId}`, 'PATCH', updateData);
  }

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

    // Get VAPI assistant ID from config
    const config = typeof agent.config === 'object' ? agent.config : JSON.parse(agent.config || '{}');
    const rawVapiAssistantId = config.vapi_assistant_id;

    // Validate and convert to string
    if (!rawVapiAssistantId || rawVapiAssistantId === true) {
      console.log("No valid VAPI assistant ID found for agent, skipping sync");
      return;
    }

    // Convert to string - now TypeScript knows it's either string or number
    const assistantId = String(rawVapiAssistantId);

    // Update VAPI assistant
    try {
      await this.updateAssistant(assistantId, agent);
      console.log(`Successfully synced agent ${agentId} with VAPI assistant ${assistantId}`);
    } catch (error) {
      console.error(`Failed to sync agent ${agentId} with VAPI:`, error);
      throw error;
    }
  }
}
