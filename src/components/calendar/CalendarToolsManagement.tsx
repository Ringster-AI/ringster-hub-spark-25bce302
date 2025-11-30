import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Phone, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/types/database";

interface CalendarToolConfiguration {
  requirePhoneVerification: boolean;
  allowedTimeSlots: string[];
  bufferMinutes: number;
  maxAdvanceBookingDays: number;
  reminderSettings: {
    enabled: boolean;
    timings: string[];
  };
}

interface CalendarTool {
  id: string;
  agent_id: string;
  campaign_id?: string;
  tool_name: string;
  configuration: Json;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface CalendarToolsManagementProps {
  agentId: string;
}

export function CalendarToolsManagement({ agentId }: CalendarToolsManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: calendarTool, isLoading } = useQuery({
    queryKey: ["calendar-tool", agentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calendar_tools")
        .select("*")
        .eq("agent_id", agentId)
        .is("campaign_id", null)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }
      return data as CalendarTool | null;
    },
  });

  const createCalendarTool = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("calendar_tools")
        .insert({
          agent_id: agentId,
          tool_name: "calendar_booking",
          is_enabled: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-tool", agentId] });
      toast({
        title: "Calendar Tool Created",
        description: "Calendar booking tool has been enabled for this agent.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create calendar tool",
        variant: "destructive",
      });
    },
  });

  const updateCalendarTool = useMutation({
    mutationFn: async (updates: Partial<CalendarTool>) => {
      if (!calendarTool) return;

      const { data, error } = await supabase
        .from("calendar_tools")
        .update(updates)
        .eq("id", calendarTool.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-tool", agentId] });
      toast({
        title: "Settings Updated",
        description: "Calendar tool settings have been updated.",
      });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update calendar tool",
        variant: "destructive",
      });
    },
  });

  const handleToggleEnabled = (enabled: boolean) => {
    updateCalendarTool.mutate({ is_enabled: enabled });
  };

  const handleConfigurationUpdate = (newConfig: CalendarToolConfiguration) => {
    updateCalendarTool.mutate({ configuration: newConfig as unknown as Json });
  };

  const getConfiguration = (): CalendarToolConfiguration => {
    if (!calendarTool?.configuration || typeof calendarTool.configuration !== 'object') {
      return {
        requirePhoneVerification: true,
        allowedTimeSlots: ["09:00-17:00"],
        bufferMinutes: 15,
        maxAdvanceBookingDays: 30,
        reminderSettings: {
          enabled: true,
          timings: ["24h", "2h"]
        }
      };
    }

    const config = calendarTool.configuration as Record<string, any>;
    return {
      requirePhoneVerification: config.requirePhoneVerification ?? true,
      allowedTimeSlots: config.allowedTimeSlots ?? ["09:00-17:00"],
      bufferMinutes: config.bufferMinutes ?? 15,
      maxAdvanceBookingDays: config.maxAdvanceBookingDays ?? 30,
      reminderSettings: {
        enabled: config.reminderSettings?.enabled ?? true,
        timings: config.reminderSettings?.timings ?? ["24h", "2h"]
      }
    };
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Loading calendar tool settings...</div>
        </CardContent>
      </Card>
    );
  }

  if (!calendarTool) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendar Booking Tool
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Enable calendar booking functionality for this agent. This allows callers to schedule appointments during calls.
          </p>
          <Button 
            onClick={() => createCalendarTool.mutate()}
            disabled={createCalendarTool.isPending}
          >
            Enable Calendar Tool
          </Button>
        </CardContent>
      </Card>
    );
  }

  const configuration = getConfiguration();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendar Booking Tool
              <Badge variant={calendarTool.is_enabled ? "default" : "secondary"}>
                {calendarTool.is_enabled ? "Enabled" : "Disabled"}
              </Badge>
            </CardTitle>
            <Switch
              checked={calendarTool.is_enabled}
              onCheckedChange={handleToggleEnabled}
              disabled={updateCalendarTool.isPending}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-sm">
                  {configuration.requirePhoneVerification ? "Phone verification required" : "No phone verification"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm">
                  {configuration.bufferMinutes} min buffer time
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm">
                  {configuration.maxAdvanceBookingDays} days advance booking
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Settings className="h-4 w-4 mr-1" />
                Configure
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Calendar Tool Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <CalendarToolConfigForm
              configuration={configuration}
              onSave={handleConfigurationUpdate}
              onCancel={() => setIsEditing(false)}
              isLoading={updateCalendarTool.isPending}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface CalendarToolConfigFormProps {
  configuration: CalendarToolConfiguration;
  onSave: (config: CalendarToolConfiguration) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function CalendarToolConfigForm({ configuration, onSave, onCancel, isLoading }: CalendarToolConfigFormProps) {
  const [config, setConfig] = useState(configuration);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Switch
            id="phone-verification"
            checked={config.requirePhoneVerification}
            onCheckedChange={(checked) =>
              setConfig({ ...config, requirePhoneVerification: checked })
            }
          />
          <Label htmlFor="phone-verification">
            Require phone verification for bookings
          </Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="buffer-minutes">Buffer time between appointments (minutes)</Label>
        <Input
          id="buffer-minutes"
          type="number"
          min="0"
          max="120"
          value={config.bufferMinutes}
          onChange={(e) =>
            setConfig({ ...config, bufferMinutes: parseInt(e.target.value) || 0 })
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="advance-booking">Maximum advance booking (days)</Label>
        <Input
          id="advance-booking"
          type="number"
          min="1"
          max="365"
          value={config.maxAdvanceBookingDays}
          onChange={(e) =>
            setConfig({ ...config, maxAdvanceBookingDays: parseInt(e.target.value) || 30 })
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="time-slots">Allowed time slots (one per line, format: HH:MM-HH:MM)</Label>
        <Textarea
          id="time-slots"
          value={config.allowedTimeSlots.join('\n')}
          onChange={(e) =>
            setConfig({ 
              ...config, 
              allowedTimeSlots: e.target.value.split('\n').filter(slot => slot.trim()) 
            })
          }
          placeholder="09:00-17:00"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Switch
            id="reminders"
            checked={config.reminderSettings.enabled}
            onCheckedChange={(checked) =>
              setConfig({ 
                ...config, 
                reminderSettings: { ...config.reminderSettings, enabled: checked } 
              })
            }
          />
          <Label htmlFor="reminders">
            Enable appointment reminders
          </Label>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          Save Configuration
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
