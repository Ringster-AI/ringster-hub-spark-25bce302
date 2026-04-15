
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { AgentFormData } from "@/types/agents";
import { useAgentCalendarData } from "./hooks/useAgentCalendarData";
import { CalendarBookingToggle } from "./CalendarBookingToggle";
import { CalendarConfigurationSection } from "./CalendarConfigurationSection";
import { useIntegrations } from "@/hooks/useIntegrations";

interface AgentCalendarToolsManagementProps {
  agentId: string;
}

export function AgentCalendarToolsManagement({ agentId }: AgentCalendarToolsManagementProps) {
  const { agent, calendarTool, isLoading, toggleMutation, saveMutation } = useAgentCalendarData(agentId);
  const { integrations } = useIntegrations();

  // Determine which calendar provider is connected
  const connectedCalendarProvider = integrations.find(
    i => ['google_calendar', 'cal_com', 'calendly'].includes(i.integration_type) && i.status === 'connected' && i.is_active
  );

  const providerLabels: Record<string, string> = {
    google_calendar: 'Google Calendar',
    cal_com: 'Cal.com',
    calendly: 'Calendly',
  };

  const form = useForm<AgentFormData>({
    defaultValues: {
      calendar_booking: {
        enabled: false,
        default_duration: 30,
        buffer_time: 10,
        business_hours_start: "09:00",
        business_hours_end: "17:00",
        booking_lead_time_hours: 2,
        require_phone_verification: true
      }
    }
  });

  // Update form when data is loaded
  useEffect(() => {
    if (agent?.config) {
      // Safely parse the config JSON
      const parseConfig = (configData: any) => {
        if (!configData) return {};
        if (typeof configData === 'object') return configData;
        try {
          return JSON.parse(configData);
        } catch {
          return {};
        }
      };

      const parsedConfig = parseConfig(agent.config);
      
      if (parsedConfig?.calendar_booking) {
        form.reset({
          calendar_booking: parsedConfig.calendar_booking
        });
      }
    } else if (calendarTool?.configuration) {
      // Safely parse the configuration
      const parseConfiguration = (configData: any) => {
        if (!configData) return {};
        if (typeof configData === 'object') return configData;
        try {
          return JSON.parse(configData);
        } catch {
          return {};
        }
      };

      const parsedConfiguration = parseConfiguration(calendarTool.configuration);
      
      form.reset({
        calendar_booking: {
          enabled: calendarTool.is_enabled,
          default_duration: parsedConfiguration.default_duration || 30,
          buffer_time: parsedConfiguration.buffer_time || 10,
          business_hours_start: parsedConfiguration.business_hours_start || "09:00",
          business_hours_end: parsedConfiguration.business_hours_end || "17:00",
          booking_lead_time_hours: parsedConfiguration.booking_lead_time_hours || 2,
          require_phone_verification: parsedConfiguration.require_phone_verification ?? true
        }
      });
    }
  }, [agent, calendarTool, form]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="animate-pulse">Loading calendar settings...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isEnabled = form.watch("calendar_booking.enabled") || calendarTool?.is_enabled || false;

  const handleToggle = (enabled: boolean, formData: AgentFormData) => {
    toggleMutation.mutate({ enabled, formData });
  };

  const handleSave = (data: AgentFormData) => {
    saveMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Calendar Booking for {agent?.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <CalendarBookingToggle
          isEnabled={isEnabled}
          form={form}
          onToggle={handleToggle}
          isLoading={toggleMutation.isPending}
        />

        {isEnabled && (
          <CalendarConfigurationSection
            form={form}
            onSave={handleSave}
            isSaving={saveMutation.isPending}
          />
        )}
      </CardContent>
    </Card>
  );
}
