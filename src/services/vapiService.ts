
import { supabase } from "@/integrations/supabase/client";

interface VapiCallDetails {
  assistantId: string;
  callId: string;
  status: string;
  duration: number;
  startTime: string;
  endTime: string;
  transcriptUrl?: string;
  recordingUrl?: string;
}

interface TranscriptSegment {
  speaker: string;
  text: string;
  timestamp: string;
}

interface CallAnalytics {
  callCount: number;
  totalDuration: number;
  averageDuration: number;
  transferCount: number;
  callsByDay: Record<string, number>;
}

export const vapiService = {
  /**
   * Fetches call details from Vapi.ai through our database
   */
  async getCallDetails(agentId: string): Promise<VapiCallDetails[]> {
    try {
      // This fetches from our synced database that stores Vapi call data
      const { data, error } = await supabase
        .from('agent_configs')
        .select(`
          id,
          name,
          config:config->vapi_assistant_id,
          call_logs(
            id,
            call_sid,
            status,
            duration,
            start_time,
            end_time,
            call_recordings(
              id,
              recording_url,
              transcript_url
            )
          )
        `)
        .eq('id', agentId)
        .single();
      
      if (error) throw error;
      
      if (!data || !data.call_logs) return [];
      
      return data.call_logs.map((log: any) => {
        const recording = log.call_recordings && log.call_recordings[0];
        
        return {
          assistantId: data.config || '',
          callId: log.call_sid,
          status: log.status || 'unknown',
          duration: log.duration || 0,
          startTime: log.start_time || '',
          endTime: log.end_time || '',
          transcriptUrl: recording?.transcript_url,
          recordingUrl: recording?.recording_url,
        };
      });
    } catch (error) {
      console.error('Error fetching Vapi call details:', error);
      return [];
    }
  },
  
  /**
   * Get transcript for a specific call
   */
  async getCallTranscript(callId: string): Promise<TranscriptSegment[]> {
    try {
      const response = await supabase.functions.invoke('get-vapi-call-data', {
        body: { callId, action: 'transcript' }
      });
      
      if (response.error) throw new Error(response.error);
      
      return response.data?.transcript || [];
    } catch (error) {
      console.error('Error fetching call transcript:', error);
      throw error;
    }
  },
  
  /**
   * Get recording URL for a specific call
   */
  async getCallRecording(callId: string): Promise<string> {
    try {
      const response = await supabase.functions.invoke('get-vapi-call-data', {
        body: { callId, action: 'recording' }
      });
      
      if (response.error) throw new Error(response.error);
      
      return response.data?.url || '';
    } catch (error) {
      console.error('Error fetching call recording:', error);
      throw error;
    }
  },
  
  /**
   * Get analytics for a specific assistant
   */
  async getAssistantAnalytics(agentId: string): Promise<CallAnalytics> {
    try {
      // First get the vapi_assistant_id from the agent config
      const { data: agent, error: agentError } = await supabase
        .from('agent_configs')
        .select('config:config->vapi_assistant_id')
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
