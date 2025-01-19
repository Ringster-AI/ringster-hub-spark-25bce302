import { Json } from "@/integrations/supabase/types";

export interface TransferHours {
  start: string; // Format: "HH:mm"
  end: string;   // Format: "HH:mm"
}

export interface TransferEntry {
  keywords: string[];
  number: string;
  transfer_message: string;
  transfer_hours?: TransferHours;
}

export interface AdvancedConfig {
  transcriber: {
    provider: string;
    model: string;
    language: string;
  };
  voice: {
    provider: string;
    voiceId: string | null;
    customVoiceId: string | null;
    useCustomVoiceId?: boolean;
  };
}

export interface AgentFormData {
  name: string;
  description: string;
  greeting: string;
  goodbye: string;
  voice_id: string;
  transfer_directory: Record<string, TransferEntry>;
  advanced_config: AdvancedConfig;
}

export interface AgentConfigInsert {
  name: string;
  description?: string | null;
  greeting?: string | null;
  goodbye?: string | null;
  status: string;
  config: Json;
  transfer_directory: Json;
  user_id: string;
  advanced_config?: Json;
}