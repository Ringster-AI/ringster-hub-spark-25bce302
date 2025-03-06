
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CallRecording, TranscriptSegment } from "./types";

export const useRecordings = () => {
  return useQuery({
    queryKey: ['recordings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('call_recordings')
        .select(`
          id,
          call_log_id,
          recording_url,
          transcript_url,
          created_at,
          call_log:call_log_id (
            call_sid,
            from_number,
            to_number,
            duration,
            start_time,
            agent:agent_id (
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Cast to ensure type compatibility
      return (data as unknown) as CallRecording[];
    },
  });
};

export const useTranscript = (callSid: string | undefined) => {
  return useQuery({
    queryKey: ['transcript', callSid],
    queryFn: async () => {
      if (!callSid) {
        throw new Error('Call SID is required to fetch transcript');
      }

      try {
        const response = await supabase.functions.invoke('get-vapi-call-data', {
          body: { callId: callSid, action: 'transcript' }
        });
        
        if (response.error) throw new Error(response.error.message);
        
        console.log('Transcript response:', response.data);
        return response.data?.transcript || [];
      } catch (error) {
        console.error('Error fetching transcript:', error);
        throw error;
      }
    },
    enabled: !!callSid, // Only run query when callSid is available
  });
};
