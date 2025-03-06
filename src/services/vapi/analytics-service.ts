
import { supabase } from "@/integrations/supabase/client";

interface CallAnalytics {
  callCount: number;
  totalDuration: number;
  averageDuration: number;
  transferCount: number;
  callsByDay: Record<string, number>;
}

export const analyticsService = {
  /**
   * Get analytics for a specific assistant
   */
  async getAssistantAnalytics(agentId: string): Promise<CallAnalytics> {
    try {
      // First get the vapi_assistant_id from the agent config
      const { data: agent, error: agentError } = await supabase
        .from('agent_configs')
        .select('config')
        .eq('id', agentId)
        .single();
      
      if (agentError || !agent?.config) throw new Error('Assistant ID not found');
      
      // Then get the call logs for this agent
      const { data: calls, error: callsError } = await supabase
        .from('call_logs')
        .select('duration, start_time, transfer_count')
        .eq('agent_id', agentId);
      
      if (callsError) throw callsError;
      
      const callsByDay: Record<string, number> = {};
      let totalDuration = 0;
      let transferCount = 0;
      
      // Process the call logs to calculate analytics
      (calls || []).forEach((call: any) => {
        totalDuration += call.duration || 0;
        transferCount += call.transfer_count || 0;
        
        if (call.start_time) {
          const day = new Date(call.start_time).toISOString().split('T')[0];
          callsByDay[day] = (callsByDay[day] || 0) + 1;
        }
      });
      
      return {
        callCount: calls?.length || 0,
        totalDuration,
        averageDuration: calls?.length ? totalDuration / calls.length : 0,
        transferCount,
        callsByDay
      };
    } catch (error) {
      console.error('Error fetching assistant analytics:', error);
      throw error;
    }
  }
};
