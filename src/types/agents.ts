export interface AgentFormData {
  name: string;
  description?: string;
  greeting?: string;
  goodbye?: string;
  voice_id?: string;
  phone_number?: string;
  transfer_directory?: Record<string, TransferEntry>;
  hipaa_enabled?: boolean;
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