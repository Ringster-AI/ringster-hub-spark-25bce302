
import { Json } from './auth';

export interface Integration {
  id: string;
  user_id: string;
  integration_type: string;
  provider_name: string;
  display_name: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  configuration: Json;
  credentials: Json;
  metadata: Json;
  capabilities: string[];
  is_active: boolean;
  last_sync_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface IntegrationLog {
  id: string;
  integration_id: string;
  action: string;
  status: 'success' | 'failure' | 'pending';
  message: string | null;
  details: Json;
  created_at: string;
}

export interface CampaignIntegration {
  id: string;
  campaign_id: string;
  integration_id: string;
  configuration: Json;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface IntegrationsSchema {
  Tables: {
    integrations: {
      Row: Integration;
      Insert: Partial<Integration> & Pick<Integration, 'integration_type' | 'provider_name' | 'display_name'>;
      Update: Partial<Integration>;
    };
    integration_logs: {
      Row: IntegrationLog;
      Insert: Partial<IntegrationLog> & Pick<IntegrationLog, 'integration_id' | 'action' | 'status'>;
      Update: Partial<IntegrationLog>;
    };
    campaign_integrations: {
      Row: CampaignIntegration;
      Insert: Partial<CampaignIntegration> & Pick<CampaignIntegration, 'campaign_id' | 'integration_id'>;
      Update: Partial<CampaignIntegration>;
    };
  };
}
