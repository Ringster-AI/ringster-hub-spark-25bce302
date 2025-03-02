
import { supabase } from "@/integrations/supabase/client";

interface TranscriptSegment {
  speaker: string;
  text: string;
  timestamp: string;
}

export const transcriptService = {
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
  }
};
