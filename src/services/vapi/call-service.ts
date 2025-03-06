
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

// Define basic types to avoid circular references
interface CallLog {
  id: string;
  call_sid: string;
  status: string | null;
  duration: number | null;
  start_time: string | null;
  end_time: string | null;
}

export const callService = {
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

      // Safely extract vapi_assistant_id from the config object
      let vapiAssistantId = '';
      if (agentData?.config && typeof agentData.config === 'object') {
        vapiAssistantId = (agentData.config as any).vapi_assistant_id || '';
      }
      
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
          assistantId: vapiAssistantId,
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
  }
};
