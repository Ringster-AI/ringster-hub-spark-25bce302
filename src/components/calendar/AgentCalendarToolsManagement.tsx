
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Settings, Calendar, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CalendarBookingConfig } from "@/components/agents/CalendarBookingConfig";
import { useForm } from "react-hook-form";
import { AgentFormData } from "@/types/agents";

interface AgentCalendarToolsManagementProps {
  agentId: string;
}

export function AgentCalendarToolsManagement({ agentId }: AgentCalendarToolsManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showConfig, setShowConfig] = useState(false);

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

  // Fetch agent data
  const { data: agent, isLoading: agentLoading } = useQuery({
    queryKey: ["agent", agentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_configs")
        .select("*")
        .eq("id", agentId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch calendar tools data
  const { data: calendarTool, isLoading: toolLoading } = useQuery({
    queryKey: ["calendar-tool", agentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calendar_tools")
        .select("*")
        .eq("agent_id", agentId)
        .eq("tool_name", "calendar_booking")
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  // Update form when data is loaded
  useEffect(() => {
    if (agent?.config?.calendar_booking) {
      form.reset({
        calendar_booking: agent.config.calendar_booking
      });
    } else if (calendarTool?.configuration) {
      form.reset({
        calendar_booking: {
          enabled: calendarTool.is_enabled,
          default_duration: calendarTool.configuration.default_duration || 30,
          buffer_time: calendarTool.configuration.buffer_time || 10,
          business_hours_start: calendarTool.configuration.business_hours_start || "09:00",
          business_hours_end: calendarTool.configuration.business_hours_end || "17:00",
          booking_lead_time_hours: calendarTool.configuration.booking_lead_time_hours || 2,
          require_phone_verification: calendarTool.configuration.require_phone_verification ?? true
        }
      });
    }
  }, [agent, calendarTool, form]);

  // Toggle calendar booking
  const toggleMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      if (enabled) {
        // Create or enable calendar tool
        const toolConfig = {
          agent_id: agentId,
          tool_name: 'calendar_booking',
          is_enabled: true,
          configuration: {
            default_duration: form.getValues("calendar_booking.default_duration") || 30,
            buffer_time: form.getValues("calendar_booking.buffer_time") || 10,
            business_hours_start: form.getValues("calendar_booking.business_hours_start") || "09:00",
            business_hours_end: form.getValues("calendar_booking.business_hours_end") || "17:00",
            booking_lead_time_hours: form.getValues("calendar_booking.booking_lead_time_hours") || 2,
            require_phone_verification: form.getValues("calendar_booking.require_phone_verification") ?? true
          }
        };

        const { error } = await supabase
          .from("calendar_tools")
          .upsert(toolConfig, { onConflict: "agent_id,tool_name" });

        if (error) throw error;
      } else {
        // Disable calendar tool
        const { error } = await supabase
          .from("calendar_tools")
          .update({ is_enabled: false })
          .eq("agent_id", agentId)
          .eq("tool_name", "calendar_booking");

        if (error) throw error;
      }

      // Also update agent config
      const { error: agentError } = await supabase
        .from("agent_configs")
        .update({
          config: {
            ...agent?.config,
            calendar_booking: {
              ...form.getValues("calendar_booking"),
              enabled
            }
          }
        })
        .eq("id", agentId);

      if (agentError) throw agentError;
    },
    onSuccess: () => {
      toast({
        title: "Calendar booking updated",
        description: "Calendar booking settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["calendar-tool", agentId] });
      queryClient.invalidateQueries({ queryKey: ["agent", agentId] });
    },
    onError: (error: any) => {
      console.error("Error updating calendar booking:", error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update calendar booking settings.",
        variant: "destructive",
      });
    },
  });

  // Save configuration
  const saveMutation = useMutation({
    mutationFn: async (data: AgentFormData) => {
      const { error: toolError } = await supabase
        .from("calendar_tools")
        .update({
          configuration: {
            default_duration: data.calendar_booking?.default_duration || 30,
            buffer_time: data.calendar_booking?.buffer_time || 10,
            business_hours_start: data.calendar_booking?.business_hours_start || "09:00",
            business_hours_end: data.calendar_booking?.business_hours_end || "17:00",
            booking_lead_time_hours: data.calendar_booking?.booking_lead_time_hours || 2,
            require_phone_verification: data.calendar_booking?.require_phone_verification ?? true
          }
        })
        .eq("agent_id", agentId)
        .eq("tool_name", "calendar_booking");

      if (toolError) throw toolError;

      // Also update agent config
      const { error: agentError } = await supabase
        .from("agent_configs")
        .update({
          config: {
            ...agent?.config,
            calendar_booking: data.calendar_booking
          }
        })
        .eq("id", agentId);

      if (agentError) throw agentError;
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Calendar booking configuration has been saved.",
      });
      setShowConfig(false);
      queryClient.invalidateQueries({ queryKey: ["calendar-tool", agentId] });
      queryClient.invalidateQueries({ queryKey: ["agent", agentId] });
    },
    onError: (error: any) => {
      console.error("Error saving configuration:", error);
      toast({
        title: "Save failed",
        description: error.message || "Failed to save calendar booking configuration.",
        variant: "destructive",
      });
    },
  });

  if (agentLoading || toolLoading) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Calendar Booking for {agent?.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Enable Calendar Booking</h4>
            <p className="text-sm text-muted-foreground">
              Allow this agent to book calendar appointments during calls
            </p>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={(checked) => {
              form.setValue("calendar_booking.enabled", checked);
              toggleMutation.mutate(checked);
            }}
            disabled={toggleMutation.isPending}
          />
        </div>

        {isEnabled && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Calendar booking is enabled for this agent
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfig(!showConfig)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>

            {showConfig && (
              <div className="space-y-4 border-t pt-4">
                <CalendarBookingConfig form={form} />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowConfig(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => saveMutation.mutate(form.getValues())}
                    disabled={saveMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Configuration
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
