
import { useState } from "react";
import { GoogleTokenStatus } from "./GoogleTokenStatus";
import { IntegrationServiceCard } from "./IntegrationServiceCard";
import { useGoogleIntegration } from "@/hooks/useGoogleIntegration";
import { CalendarConfigModal } from "./CalendarConfigModal";
import { CalendarSettingsType } from "@/types/calendar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "lucide-react";

export function CalendarSettings() {
  const { 
    googleIntegration, 
    isConnecting, 
    isLoading, 
    connectGoogle, 
    disconnectGoogle 
  } = useGoogleIntegration();
  
  const { toast } = useToast();
  const [calendarSettings, setCalendarSettings] = useState<CalendarSettingsType | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  
  // Function to save calendar settings
  const saveCalendarSettings = async (settings: CalendarSettingsType) => {
    try {
      // Save settings to database
      const { error } = await supabase.from('google_integrations')
        .update({
          calendar_id: settings.calendar_id,
          calendar_name: settings.calendar_name,
          default_duration: settings.default_duration,
          buffer_time: settings.buffer_time,
          availability_days: settings.availability_days,
          availability_start: settings.availability_start,
          availability_end: settings.availability_end
        })
        .eq('id', googleIntegration?.id);
      
      if (error) throw error;
      
      setCalendarSettings(settings);
      setIsConfigOpen(false);
      
      toast({
        title: "Settings Saved",
        description: "Your calendar settings have been updated successfully."
      });
    } catch (err: any) {
      console.error("Error saving calendar settings:", err);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: err.message || "Failed to save calendar settings"
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Calendar Settings</h2>
      <p className="text-muted-foreground">
        Connect your calendar to manage appointments and availability.
      </p>

      <IntegrationServiceCard
        title="Google Calendar"
        description="Connect your Google Calendar to manage appointments and availability."
        icon={<Calendar className="h-6 w-6 text-primary" />}
        isConnected={!!googleIntegration}
        connectedEmail={googleIntegration ? googleIntegration.email : ""}
        isLoading={isLoading}
        isConnecting={isConnecting}
        onConnect={connectGoogle}
        onDisconnect={disconnectGoogle}
      />

      {googleIntegration && (
        <div className="space-y-6 mt-6">
          <GoogleTokenStatus />
          
          <div className="flex justify-end">
            <button 
              onClick={() => setIsConfigOpen(true)}
              className="text-primary hover:underline"
            >
              Configure Calendar Settings
            </button>
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
        </div>
      )}
    </div>
  );
}
