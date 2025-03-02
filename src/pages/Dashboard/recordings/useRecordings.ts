
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CallRecording } from "./types";

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
