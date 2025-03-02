
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

export const vapiService = {
  /**
   * Fetches call details from Vapi.ai through our database
   */
  async getCallDetails(agentId: string): Promise<VapiCallDetails[]> {
    try {
      // This would fetch from our synced database that stores Vapi call data
      const { data, error } = await supabase
        .from('agent_configs')
        .select(`
          id,
          name,
          vapi_assistant_id,
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
          assistantId: data.vapi_assistant_id || '',
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
   * This would listen to a Vapi recording via their SDK
   * Actual implementation would require Vapi client SDK details
   */
  async listenToRecording(callId: string) {
    // This is a placeholder for actual Vapi integration
    console.log(`Listening to Vapi recording for call ${callId}`);
    
    // In reality, this would involve:
    // 1. Calling a Netlify function that has VAPI API credentials
    // 2. The function would fetch the recording URL or player details
    // 3. Return data needed to play the recording in the browser
    
    try {
      const response = await fetch(`/.netlify/functions/get-vapi-recording?callId=${callId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error accessing Vapi recording:', error);
      throw error;
    }
  }
};
