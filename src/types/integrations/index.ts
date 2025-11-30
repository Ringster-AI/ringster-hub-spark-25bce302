
export interface Integration {
  id: string;
  user_id: string;
  integration_type: string;
  provider_name: string;
  display_name: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  configuration: Record<string, any>;
  credentials: Record<string, any>;
  metadata: Record<string, any>;
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
  details: Record<string, any>;
  created_at: string;
}

export interface CampaignIntegration {
  id: string;
  campaign_id: string;
  integration_id: string;
  configuration: Record<string, any>;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
  integration?: Integration;
}

export interface IntegrationType {
  type: string;
  provider: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  capabilities: string[];
  configurationSchema: Record<string, any>;
  isAvailable: boolean;
}

export interface IntegrationProvider {
  connect: (returnUrl?: string) => Promise<void>;
  disconnect: (integrationId: string) => Promise<void>;
  refresh: (integrationId: string) => Promise<void>;
  test: (integrationId: string) => Promise<boolean>;
  getCapabilities: () => string[];
  getConfigurationSchema: () => Record<string, any>;
}
