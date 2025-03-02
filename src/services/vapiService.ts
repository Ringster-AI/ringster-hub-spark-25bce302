
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

// Define basic types without circular references
interface CallLog {
  id: string;
  call_sid: string;
  status: string | null;
  duration: number | null;
  start_time: string | null;
  end_time: string | null;
}

interface CallRecording {
  id: string;
  recording_url: string | null;
  transcript_url: string | null;
}

// Define agent config with minimal properties needed
interface AgentConfig {
  id: string;
  name: string;
  config: {
    vapi_assistant_id?: string;
  } | null;
}

export const vapiService = {
  /**
   * Fetches call details from Vapi.ai through our database
   */
  async getCallDetails(agentId: string): Promise<VapiCallDetails[]> {
    try {
      // First, get the agent config with vapi_assistant_id
      const { data: agentData, error: agentError } = await supabase
        .from('agent_configs')
        .select('id, name, config')
        .eq('id', agentId)
        .single();
      
      if (agentError) throw agentError;

      const vapi_assistant_id = agentData?.config?.vapi_assistant_id || '';
      
      // Then, get call logs in a separate query
      const { data: callLogs, error: callLogsError } = await supabase
        .from('call_logs')
        .select('id, call_sid, status, duration, start_time, end_time')
        .eq('agent_id', agentId);
      
      if (callLogsError) throw callLogsError;
      
      if (!callLogs || callLogs.length === 0) return [];
      
      // Create a map for storing recordings by call log id
      const recordingsMap: Record<string, { recording_url: string | null, transcript_url: string | null }> = {};
      
      // Get recordings for all call logs
      const callLogIds = callLogs.map(log => log.id);
      const { data: recordings, error: recordingsError } = await supabase
        .from('call_recordings')
        .select('call_log_id, recording_url, transcript_url')
        .in('call_log_id', callLogIds);
      
      if (recordingsError) throw recordingsError;
      
      // Populate recordings map
      if (recordings) {
        recordings.forEach(rec => {
          recordingsMap[rec.call_log_id] = {
            recording_url: rec.recording_url,
            transcript_url: rec.transcript_url
          };
        });
      }
      
      // Map the data to our VapiCallDetails interface
      return callLogs.map(log => {
        const recording = recordingsMap[log.id] || { recording_url: null, transcript_url: null };
        
        return {
          assistantId: vapi_assistant_id,
          callId: log.call_sid,
          status: log.status || 'unknown',
          duration: log.duration || 0,
          startTime: log.start_time || '',
          endTime: log.end_time || '',
          transcriptUrl: recording.transcript_url,
          recordingUrl: recording.recording_url,
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
      
      if (response.error) throw new Error(response.error.message);
      
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
      
      if (response.error) throw new Error(response.error.message);
      
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
