import { Json } from './auth';

export interface AgentConfig {
  id: string;
  name: string;
  phone_number: string | null;
  description: string | null;
  greeting: string | null;
  goodbye: string | null;
  // Changed to string to match Supabase's type
  status: string;
  config: Json | null;
  transfer_directory: Json | null;
  minutes_used: number | null;
  total_minutes_used: number | null;
  created_at: string | null;
  updated_at: string | null;
  voice_id: string | null;
  twilio_sid: string | null;
  user_id: string | null;
}

export interface AgentsSchema {
  Tables: {
    agent_configs: {
      Row: AgentConfig;
      Insert: Partial<AgentConfig> & Pick<AgentConfig, 'name'>;
      Update: Partial<AgentConfig>;
    };
  };
}