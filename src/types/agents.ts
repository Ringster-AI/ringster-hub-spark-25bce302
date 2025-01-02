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