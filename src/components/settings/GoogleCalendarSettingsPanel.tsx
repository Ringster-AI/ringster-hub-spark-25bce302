import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, RefreshCw, Settings as SettingsIcon } from "lucide-react";
import { useGoogleIntegration } from "@/hooks/useGoogleIntegration";
import { GoogleTokenStatus } from "./GoogleTokenStatus";
import { CalendarConfigModal } from "./CalendarConfigModal";
import { CalendarSettingsType } from "@/types/calendar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function GoogleCalendarSettingsPanel() {
  const { googleIntegration, isLoading, refetch } = useGoogleIntegration();
  const { toast } = useToast();
  const [calendarSettings, setCalendarSettings] = useState<CalendarSettingsType | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  if (!googleIntegration) return null;

  const saveCalendarSettings = async (settings: CalendarSettingsType) => {
    try {
      const { error } = await supabase
        .from("google_integrations")
        .update({
          calendar_id: settings.calendar_id,
          calendar_name: settings.calendar_name,
          default_duration: settings.default_duration,
          buffer_time: settings.buffer_time,
          availability_days: settings.availability_days,
          availability_start: settings.availability_start,
          availability_end: settings.availability_end,
        })
        .eq("id", googleIntegration.id);

      if (error) throw error;

      setCalendarSettings(settings);
      setIsConfigOpen(false);

      toast({
        title: "Settings Saved",
        description: "Your calendar settings have been updated successfully.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: err.message || "Failed to save calendar settings",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Google Calendar Settings
          </CardTitle>
          <CardDescription>
            Default availability, duration and buffer used when agents book appointments.
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <GoogleTokenStatus />
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setIsConfigOpen(true)}>
            <SettingsIcon className="h-4 w-4 mr-2" />
            Configure Calendar Settings
          </Button>
        </div>
        {isConfigOpen && (
          <CalendarConfigModal
            isOpen={isConfigOpen}
            onClose={() => setIsConfigOpen(false)}
            onSave={saveCalendarSettings}
            initialSettings={calendarSettings}
            googleIntegration={googleIntegration}
          />
        )}
      </CardContent>
    </Card>
  );
}
