
import { IntegrationProvider } from "@/types/integrations/index";
import { supabase } from "@/integrations/supabase/client";
import { IntegrationService } from "../IntegrationService";

export class CalendlyProvider implements IntegrationProvider {
  async connect(returnUrl?: string): Promise<void> {
    try {
      const currentUrl = returnUrl || window.location.href;

      const { data, error } = await supabase.functions.invoke('connect-calendly', {
        method: 'POST',
        body: { returnUrl: currentUrl },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No redirect URL received from server');
      }
    } catch (error: any) {
      console.error('Error connecting Calendly:', error);
      throw error;
    }
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
        'Calendly disconnected successfully'
      );
    } catch (error: any) {
      console.error('Error disconnecting Calendly:', error);
      throw error;
    }
  }

  async refresh(integrationId: string): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke('calendly-callback', {
        method: 'POST',
        body: { action: 'refresh', integrationId },
      });

      if (error) throw error;

      await IntegrationService.logIntegrationActivity(
        integrationId,
        'refresh',
        'success',
        'Calendly tokens refreshed successfully'
      );
    } catch (error: any) {
      console.error('Error refreshing Calendly:', error);
      await IntegrationService.logIntegrationActivity(
        integrationId,
        'refresh',
        'failure',
        'Failed to refresh Calendly tokens',
        { error: error.message }
      );
      throw error;
    }
  }

  async test(integrationId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('calendly-callback', {
        method: 'POST',
        body: { action: 'test', integrationId },
      });

      if (error || data?.error) {
        await IntegrationService.logIntegrationActivity(
          integrationId,
          'test',
          'failure',
          'Calendly connection test failed',
          { error: error?.message || data?.error }
        );
        return false;
      }

      await IntegrationService.logIntegrationActivity(
        integrationId,
        'test',
        'success',
        'Calendly connection test successful'
      );
      return true;
    } catch (error: any) {
      console.error('Error testing Calendly connection:', error);
      return false;
    }
  }

  getCapabilities(): string[] {
    return ['calendar', 'scheduling'];
  }

  getConfigurationSchema(): Record<string, any> {
    return {
      event_type_uri: {
        type: 'string',
        label: 'Event Type URI',
        description: 'The Calendly event type URI (found in your Calendly dashboard)',
      },
      default_duration: {
        type: 'number',
        label: 'Default Duration (minutes)',
        description: 'Default appointment duration in minutes',
        default: 30,
        min: 15,
        max: 240,
      },
    };
  }
}
