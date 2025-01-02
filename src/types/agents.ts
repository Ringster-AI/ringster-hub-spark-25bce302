import { Json } from "@/integrations/supabase/types";

export interface TransferEntry {
  keywords: string[];
  number: string;
  transfer_message: string;
}

export interface AgentFormData {
  name: string;
  description: string;
  greeting: string;
  goodbye: string;
  voice_id: string;
  transfer_directory: Record<string, TransferEntry>;
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
}