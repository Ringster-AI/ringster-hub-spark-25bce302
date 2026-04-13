
import { supabase } from "@/integrations/supabase/client";
import { Integration, IntegrationLog, CampaignIntegration } from "@/types/integrations/index";

// Select all columns EXCEPT credentials - credentials should never be read client-side
const SAFE_COLUMNS = 'id, user_id, integration_type, provider_name, display_name, status, configuration, metadata, capabilities, is_active, last_sync_at, expires_at, created_at, updated_at';

export class IntegrationService {
  static async getUserIntegrations(): Promise<Integration[]> {
    const { data, error } = await supabase
      .from('integrations')
      .select(SAFE_COLUMNS)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(item => ({
      ...item,
      credentials: {}, // Never expose credentials client-side
      status: item.status as Integration['status'],
      configuration: item.configuration as Record<string, any>,
      metadata: item.metadata as Record<string, any>
    }));
  }

  static async getIntegrationById(id: string): Promise<Integration | null> {
    const { data, error } = await supabase
      .from('integrations')
      .select(SAFE_COLUMNS)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return {
      ...data,
      credentials: {},
      status: data.status as Integration['status'],
      configuration: data.configuration as Record<string, any>,
      metadata: data.metadata as Record<string, any>
    };
  }

  static async getIntegrationByType(type: string): Promise<Integration | null> {
    const { data, error } = await supabase
      .from('integrations')
      .select(SAFE_COLUMNS)
      .eq('integration_type', type)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return {
      ...data,
      credentials: {},
      status: data.status as Integration['status'],
      configuration: data.configuration as Record<string, any>,
      metadata: data.metadata as Record<string, any>
    };
  }

  static async createIntegration(integration: Omit<Integration, 'id' | 'created_at' | 'updated_at'>): Promise<Integration> {
    // Strip credentials from client-side inserts - credentials should be set server-side only
    const { credentials: _creds, ...safeData } = integration;
    const { data, error } = await supabase
      .from('integrations')
      .insert({
        ...safeData,
        credentials: {},
        configuration: integration.configuration as any,
        metadata: integration.metadata as any
      })
      .select(SAFE_COLUMNS)
      .single();

    if (error) throw error;
    return {
      ...data,
      credentials: {},
      status: data.status as Integration['status'],
      configuration: data.configuration as Record<string, any>,
      metadata: data.metadata as Record<string, any>
    };
  }

  static async updateIntegration(id: string, updates: Partial<Integration>): Promise<Integration> {
    // Strip credentials from client-side updates
    const { credentials: _creds, ...safeUpdates } = updates;
    const updateData: any = { ...safeUpdates };
    if (updateData.configuration) {
      updateData.configuration = updateData.configuration as any;
    }
    if (updateData.metadata) {
      updateData.metadata = updateData.metadata as any;
    }

    const { data, error } = await supabase
      .from('integrations')
      .update(updateData)
      .eq('id', id)
      .select(SAFE_COLUMNS)
      .single();

    if (error) throw error;
    return {
      ...data,
      credentials: {},
      status: data.status as Integration['status'],
      configuration: data.configuration as Record<string, any>,
      metadata: data.metadata as Record<string, any>
    };
  }

  static async deleteIntegration(id: string): Promise<void> {
    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getCampaignIntegrations(campaignId: string): Promise<CampaignIntegration[]> {
    const { data, error } = await supabase
      .from('campaign_integrations')
      .select(`
        *,
        integration:integrations(${SAFE_COLUMNS})
      `)
      .eq('campaign_id', campaignId);

    if (error) throw error;
    return data.map(item => ({
      ...item,
      configuration: item.configuration as Record<string, any>,
      integration: item.integration ? {
        ...item.integration,
        credentials: {},
        status: item.integration.status as Integration['status'],
        configuration: item.integration.configuration as Record<string, any>,
        metadata: item.integration.metadata as Record<string, any>
      } : undefined
    }));
  }

  static async addCampaignIntegration(
    campaignId: string,
    integrationId: string,
    configuration: Record<string, any> = {}
  ): Promise<CampaignIntegration> {
    const { data, error } = await supabase
      .from('campaign_integrations')
      .insert({
        campaign_id: campaignId,
        integration_id: integrationId,
        configuration: configuration as any
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      configuration: data.configuration as Record<string, any>
    };
  }

  static async updateCampaignIntegration(
    id: string,
    updates: Partial<CampaignIntegration>
  ): Promise<CampaignIntegration> {
    const updateData: any = { ...updates };
    if (updateData.configuration) {
      updateData.configuration = updateData.configuration as any;
    }

    const { data, error } = await supabase
      .from('campaign_integrations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      configuration: data.configuration as Record<string, any>
    };
  }

  static async removeCampaignIntegration(id: string): Promise<void> {
    const { error } = await supabase
      .from('campaign_integrations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async logIntegrationActivity(
    integrationId: string,
    action: string,
    status: 'success' | 'failure' | 'pending',
    message?: string,
    details?: Record<string, any>
  ): Promise<IntegrationLog> {
    const { data, error } = await supabase
      .from('integration_logs')
      .insert({
        integration_id: integrationId,
        action,
        status,
        message,
        details: (details || {}) as any
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      status: data.status as IntegrationLog['status'],
      details: data.details as Record<string, any>
    };
  }

  static async getIntegrationLogs(integrationId: string): Promise<IntegrationLog[]> {
    const { data, error } = await supabase
      .from('integration_logs')
      .select('*')
      .eq('integration_id', integrationId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data.map(item => ({
      ...item,
      status: item.status as IntegrationLog['status'],
      details: item.details as Record<string, any>
    }));
  }
}
