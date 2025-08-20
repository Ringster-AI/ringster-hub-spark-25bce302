
export interface CallRecording {
  id: string;
  call_log_id: string;
  recording_url: string | null;
  transcript_url: string | null;
  created_at: string;
  call_log: {
    call_sid: string;
    from_number: string;
    to_number: string;
    duration: number;
    start_time: string;
    status: string;
    agent: {
      name: string;
    };
  };
}

export interface CallRecordingEnhanced extends CallRecording {
  sentiment?: 'positive' | 'neutral' | 'negative';
  keywords?: string[];
  conversion_flag?: boolean;
  contact_name?: string;
  call_type: 'inbound' | 'outbound';
}

export interface TranscriptSegment {
  speaker: string;
  text: string;
  timestamp: string;
}
