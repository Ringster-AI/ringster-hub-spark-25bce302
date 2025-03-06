
// Import the supabase client
import { supabase } from "@/integrations/supabase/client";

// Example of how the correct query should look:
async function getRecordingByCallSid(callSid: string) {
  const { data, error } = await supabase
    .from('call_recordings')
    .select(`
      id,
      call_log_id,
      recording_url,
      transcript_url,
      call_log:call_log_id (
        call_sid,
        from_number,
        to_number,
        duration
      )
    `)
    .eq('call_log.call_sid', callSid);

  if (error) {
    console.error('Error fetching recording:', error);
    throw error;
  }

  return data;
}

// Export the function
export { getRecordingByCallSid };
