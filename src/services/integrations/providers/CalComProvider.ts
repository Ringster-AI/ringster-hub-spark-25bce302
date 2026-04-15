
import { IntegrationProvider } from "@/types/integrations/index";
import { supabase } from "@/integrations/supabase/client";
import { IntegrationService } from "../IntegrationService";

export class CalComProvider implements IntegrationProvider {
  async connect(returnUrl?: string): Promise<void> {
    // Cal.com uses API key auth - we invoke an edge function to validate & store it
    // The UI will prompt for the API key via IntegrationConfigModal
    // This connect() is called after the user enters their key
    const apiKey = prompt('Enter your Cal.com API key (found at cal.com/settings/developer/api-keys):');
    if (!apiKey) {
      throw new Error('Cal.com API key is required');
    }

    const { data, error } = await supabase.functions.invoke('store-calcom-key', {
      method: 'POST',
      body: { apiKey },
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);
  }

  async disconnect(integrationId: string): Promise<void> {
    try {
      await IntegrationService.updateIntegration(integrationId, {
        status: 'disconnected',
        is_active: false,
      });

      await IntegrationService.logIntegrationActivity(
        integrationId,
        'disconnect',
        'success',
        'Cal.com disconnected successfully'
      );
    } catch (error: any) {
      console.error('Error disconnecting Cal.com:', error);
      throw error;
    }
  }

  async refresh(integrationId: string): Promise<void> {
    // Cal.com API keys don't expire, nothing to refresh
    await IntegrationService.logIntegrationActivity(
      integrationId,
      'refresh',
      'success',
      'Cal.com API key does not require refresh'
    );
  }

  async test(integrationId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('store-calcom-key', {
        method: 'POST',
        body: { action: 'test', integrationId },
      });

      if (error || data?.error) {
        await IntegrationService.logIntegrationActivity(
          integrationId,
          'test',
          'failure',
          'Cal.com connection test failed',
          { error: error?.message || data?.error }
        );
        return false;
      }

      await IntegrationService.logIntegrationActivity(
        integrationId,
        'test',
        'success',
        'Cal.com connection test successful'
      );
      return true;
    } catch (error: any) {
      console.error('Error testing Cal.com connection:', error);
      return false;
    }
  }

  getCapabilities(): string[] {
    return ['calendar', 'scheduling'];
  }

  getConfigurationSchema(): Record<string, any> {
    return {
      event_type_slug: {
        type: 'string',
        label: 'Event Type Slug',
        description: 'The Cal.com event type slug to use for bookings (e.g. "30min")',
      },
      default_duration: {
        type: 'number',
        label: 'Default Duration (minutes)',
        description: 'Default appointment duration in minutes',
        default: 30,
        min: 15,
        max: 240,
      },
      username: {
        type: 'string',
        label: 'Cal.com Username',
        description: 'Your Cal.com username for availability lookups',
      },
    };
  }
}
