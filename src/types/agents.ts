
export interface AgentFormData {
  name: string;
  description?: string;
  greeting?: string;
  goodbye?: string;
  voice_id?: string;
  phone_number?: string;
  transfer_directory?: Record<string, TransferEntry>;
  hipaa_enabled?: boolean;
  agent_type?: 'inbound' | 'outbound';
  calendar_booking?: {
    enabled: boolean;
    default_duration?: number;
    buffer_time?: number;
    business_hours_start?: string;
    business_hours_end?: string;
    booking_lead_time_hours?: number;
    require_phone_verification?: boolean;
  };
  advanced_config?: {
    voice: {
      provider: string;
      voiceId?: string;
      useCustomVoiceId?: boolean;
      customVoiceId?: string;
    };
    transcriber: {
      provider: string;
      model: string;
      language: string;
    };
  };
  config?: {
    artifactPlan?: {
      recordingEnabled?: boolean;
      videoRecordingEnabled?: boolean;
      transcriptPlan?: {
        enabled: boolean;
        assistantName?: string;
        userName?: string;
      };
      recordingPath?: string;
    };
  };
}

export interface TransferEntry {
  keywords: string[];
  number: string;
  transfer_message: string;
  transfer_hours?: {
    start: string;
    end: string;
  };
}
