import { Json } from './auth';

export interface AgentConfig {
  id: string;
  name: string;
  phone_number: string | null;
  description: string | null;
  greeting: string | null;
  goodbye: string | null;
  status: string;
  config: {
    voice_id?: string | null;
    vapi_assistant_id?: string | null;
    transfer_tool_id?: string | null;
  } | null;
  transfer_directory: Json | null;
  minutes_used: number | null;
  total_minutes_used: number | null;
  created_at: string | null;
  updated_at: string | null;
  voice_id: string | null;
  twilio_sid: string | null;
  user_id: string | null;
  minutes_allowance: number | null;
  is_trial: boolean | null;
  trial_ends_at: string | null;
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