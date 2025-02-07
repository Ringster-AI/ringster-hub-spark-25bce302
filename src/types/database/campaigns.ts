
import { Json } from './auth';

export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed';
  agent_id: string | null;
  scheduled_start: string | null;
  created_at: string | null;
  updated_at: string | null;
  user_id: string | null;
  config: Json | null;
}

export interface CampaignContact {
  id: string;
  campaign_id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  status: 'pending' | 'scheduled' | 'called' | 'failed' | 'no-answer' | 'do-not-call';
  call_attempts: number;
  last_call_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  metadata: Json | null;
}

export interface CampaignsSchema {
  Tables: {
    campaigns: {
      Row: Campaign;
      Insert: Partial<Campaign> & Pick<Campaign, 'name'>;
      Update: Partial<Campaign>;
    };
    campaign_contacts: {
      Row: CampaignContact;
      Insert: Partial<CampaignContact> & Pick<CampaignContact, 'first_name' | 'last_name' | 'phone_number' | 'campaign_id'>;
      Update: Partial<CampaignContact>;
    };
  };
}
