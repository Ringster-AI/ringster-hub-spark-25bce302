
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CallRecording } from "./types";

export const useRecordings = () => {
  return useQuery({
    queryKey: ['recordings'],
    queryFn: async () => {
      // Step 1: fetch recordings with explicit FK alias to avoid duplicate-FK ambiguity
      const { data: recordings, error } = await supabase
        .from('call_recordings')
        .select(`
          id,
          call_log_id,
          recording_url,
          transcript_url,
          created_at,
          call_log:call_recordings_call_log_id_fkey (
            call_sid,
            from_number,
            to_number,
            duration,
            start_time,
            status,
            agent_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!recordings) return [];

      // Step 2: hydrate agent names in a separate query (no declared FK relationship in types)
      const agentIds = Array.from(
        new Set(
          recordings
            .map((r: any) => r.call_log?.agent_id)
            .filter((id: string | null | undefined): id is string => !!id)
        )
      );

      let agentMap: Record<string, string> = {};
      if (agentIds.length > 0) {
        const { data: agents } = await supabase
          .from('agent_configs')
          .select('id, name')
          .in('id', agentIds);
        agentMap = (agents || []).reduce((acc, a) => {
          acc[a.id] = a.name;
          return acc;
        }, {} as Record<string, string>);
      }

      const enriched = recordings.map((r: any) => ({
        ...r,
        call_log: r.call_log
          ? {
              ...r.call_log,
              agent: { name: agentMap[r.call_log.agent_id] || 'Unknown agent' },
            }
          : null,
      }));

      return enriched as unknown as CallRecording[];
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
    enabled: !!callSid,
  });
};
