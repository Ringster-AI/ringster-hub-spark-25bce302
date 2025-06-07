
import { IntegrationProvider } from "@/types/integrations";
import { supabase } from "@/integrations/supabase/client";
import { IntegrationService } from "../IntegrationService";

export class GoogleCalendarProvider implements IntegrationProvider {
  async connect(returnUrl?: string): Promise<void> {
    try {
      const currentUrl = returnUrl || window.location.href;
      
      const { data, error } = await supabase.functions.invoke('connect-google', {
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
      console.error('Error connecting Google Calendar:', error);
      throw error;
    }
  }

  async disconnect(integrationId: string): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session found");
      }
      
      // Revoke tokens via edge function
      const { error } = await supabase.functions.invoke('revoke-google-tokens', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) throw error;
      
      // Update integration status
      await IntegrationService.updateIntegration(integrationId, {
        status: 'disconnected',
        is_active: false
      });

      // Log the disconnection
      await IntegrationService.logIntegrationActivity(
        integrationId,
        'disconnect',
        'success',
        'Google Calendar disconnected successfully'
      );
    } catch (error: any) {
      console.error('Error disconnecting Google Calendar:', error);
      throw error;
    }
  }

  async refresh(integrationId: string): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('google-calendar-list');
      
      if (error) throw error;
      
      await IntegrationService.logIntegrationActivity(
        integrationId,
        'refresh',
        'success',
        'Google Calendar tokens refreshed successfully'
      );
    } catch (error: any) {
      console.error('Error refreshing Google Calendar:', error);
      await IntegrationService.logIntegrationActivity(
        integrationId,
        'refresh',
        'failure',
        'Failed to refresh Google Calendar tokens',
        { error: error.message }
      );
      throw error;
    }
  }

  async test(integrationId: string): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke('google-calendar-list');
      
      if (error) {
        await IntegrationService.logIntegrationActivity(
          integrationId,
          'test',
          'failure',
          'Google Calendar connection test failed',
          { error: error.message }
        );
        return false;
      }
      
      await IntegrationService.logIntegrationActivity(
        integrationId,
        'test',
        'success',
        'Google Calendar connection test successful'
      );
      return true;
    } catch (error: any) {
      console.error('Error testing Google Calendar connection:', error);
      await IntegrationService.logIntegrationActivity(
        integrationId,
        'test',
        'failure',
        'Google Calendar connection test failed',
        { error: error.message }
      );
      return false;
    }
  }

  getCapabilities(): string[] {
    return ['calendar', 'scheduling', 'events'];
  }

  getConfigurationSchema(): Record<string, any> {
    return {
      calendar_id: {
        type: 'string',
        label: 'Calendar ID',
        description: 'The Google Calendar ID to use for bookings'
      },
      default_duration: {
        type: 'number',
        label: 'Default Duration (minutes)',
        description: 'Default appointment duration in minutes',
        default: 30,
        min: 15,
        max: 240
      },
      buffer_time: {
        type: 'number',
        label: 'Buffer Time (minutes)',
        description: 'Buffer time between appointments',
        default: 10,
        min: 0,
        max: 60
      },
      availability_start: {
        type: 'time',
        label: 'Availability Start',
        description: 'Start time for availability',
        default: '09:00'
      },
      availability_end: {
        type: 'time',
        label: 'Availability End',
        description: 'End time for availability',
        default: '17:00'
      },
      availability_days: {
        type: 'array',
        label: 'Available Days',
        description: 'Days of the week when appointments can be booked',
        items: {
          type: 'number',
          enum: [1, 2, 3, 4, 5, 6, 7],
          enumNames: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        default: [1, 2, 3, 4, 5]
      }
    };
  }
}
