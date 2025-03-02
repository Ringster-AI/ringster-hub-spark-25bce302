
import { supabase } from "@/integrations/supabase/client";

interface TwilioCallLog {
  callSid: string;
  fromNumber: string;
  toNumber: string;
  duration: number;
  status: string;
  startTime: string;
  endTime: string;
}

interface TwilioRecording {
  recordingSid: string;
  callSid: string;
  duration: number;
  url: string;
  transcriptionUrl?: string;
}

export const twilioService = {
  /**
   * Fetches call logs from Supabase (which would be synced with Twilio)
   */
  async getCallLogs(userId: string, limit = 50): Promise<TwilioCallLog[]> {
    try {
      const { data, error } = await supabase
        .from('call_logs')
        .select(`
          call_sid,
          from_number,
          to_number,
          duration,
          status,
          start_time,
          end_time,
          agent_id
        `)
        .eq('agent_id', userId)
        .order('start_time', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      return (data || []).map(log => ({
        callSid: log.call_sid,
        fromNumber: log.from_number || '',
        toNumber: log.to_number || '',
        duration: log.duration || 0,
        status: log.status || '',
        startTime: log.start_time || '',
        endTime: log.end_time || '',
      }));
    } catch (error) {
      console.error('Error fetching Twilio call logs:', error);
      return [];
    }
  },
  
  /**
   * Fetches call recordings from Supabase (which would be synced with Twilio)
   */
  async getCallRecordings(callSid: string): Promise<TwilioRecording[]> {
    try {
      const { data, error } = await supabase
        .from('call_recordings')
        .select(`
          id,
          call_log_id,
          recording_url,
          transcript_url,
          call_log:call_log_id(call_sid)
        `)
        .eq('call_log.call_sid', callSid);
      
      if (error) throw error;
      
      return (data || []).map(recording => ({
        recordingSid: recording.id,
        callSid: recording.call_log.call_sid,
        duration: 0, // This would need to be fetched from the actual recording metadata
        url: recording.recording_url || '',
        transcriptionUrl: recording.transcript_url || undefined,
      }));
    } catch (error) {
      console.error('Error fetching Twilio call recordings:', error);
      return [];
    }
  },
  
  /**
   * This would be a placeholder for a direct Twilio API call through a Netlify function
   * in case we wanted to access Twilio directly rather than through our database
   */
  async fetchDirectFromTwilio(callSid: string) {
    // This would call a Netlify function that makes a direct API call to Twilio
    try {
      const response = await fetch(`/.netlify/functions/get-twilio-recording?callSid=${callSid}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching directly from Twilio:', error);
      throw error;
    }
  }
};
