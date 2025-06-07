
import { supabase } from "@/integrations/supabase/client";
import { Integration, IntegrationLog, CampaignIntegration } from "@/types/integrations";

export class IntegrationService {
  static async getUserIntegrations(): Promise<Integration[]> {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getIntegrationById(id: string): Promise<Integration | null> {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  static async getIntegrationByType(type: string): Promise<Integration | null> {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('integration_type', type)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  static async createIntegration(integration: Partial<Integration>): Promise<Integration> {
    const { data, error } = await supabase
      .from('integrations')
      .insert(integration)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateIntegration(id: string, updates: Partial<Integration>): Promise<Integration> {
    const { data, error } = await supabase
      .from('integrations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
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
        integration:integrations(*)
      `)
      .eq('campaign_id', campaignId);

    if (error) throw error;
    return data;
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
        configuration
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateCampaignIntegration(
    id: string,
    updates: Partial<CampaignIntegration>
  ): Promise<CampaignIntegration> {
    const { data, error } = await supabase
      .from('campaign_integrations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
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
        details: details || {}
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getIntegrationLogs(integrationId: string): Promise<IntegrationLog[]> {
    const { data, error } = await supabase
      .from('integration_logs')
      .select('*')
      .eq('integration_id', integrationId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data;
  }
}
