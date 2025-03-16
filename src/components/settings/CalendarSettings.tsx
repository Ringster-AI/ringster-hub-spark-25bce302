
import { useState, useEffect } from "react";
import { useGoogleIntegration } from "@/hooks/useGoogleIntegration";
import { CalendarConfigModal } from "@/components/settings/CalendarConfigModal";
import { Calendar, Loader2, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function CalendarSettings() {
  const { toast } = useToast();
  const {
    googleIntegration,
    isConnecting,
    isLoading,
    error,
    connectGoogle,
    disconnectGoogle,
  } = useGoogleIntegration();

  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [calendarSettings, setCalendarSettings] = useState<CalendarSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);

  // Fetch calendar settings when integration changes
  useEffect(() => {
    async function fetchCalendarSettings() {
      if (!googleIntegration?.id) return;
      
      try {
        setIsLoadingSettings(true);
        const { data, error } = await supabase
          .from('calendar_settings')
          .select('*')
          .eq('user_id', googleIntegration.user_id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        if (data) {
          setCalendarSettings(data as CalendarSettings);
        }
      } catch (err: any) {
        console.error('Error fetching calendar settings:', err);
        toast({
          variant: "destructive",
          title: "Failed to load calendar settings",
          description: err.message || "An error occurred",
        });
      } finally {
        setIsLoadingSettings(false);
      }
    }
    
    fetchCalendarSettings();
  }, [googleIntegration, toast]);

  const saveCalendarSettings = async (settings: CalendarSettings) => {
    try {
      if (!googleIntegration?.user_id) {
        throw new Error("No Google integration found");
      }
      
      const { error } = await supabase
        .from('calendar_settings')
        .upsert({
          user_id: googleIntegration.user_id,
          ...settings
        });
      
      if (error) throw error;
      
      setCalendarSettings(settings);
      toast({
        title: "Settings Saved",
        description: "Your calendar settings have been updated.",
      });
      
      setIsConfigModalOpen(false);
    } catch (err: any) {
      console.error('Error saving calendar settings:', err);
      toast({
        variant: "destructive",
        title: "Failed to save settings",
        description: err.message || "An error occurred",
      });
    }
  };

  if (isLoading || isLoadingSettings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Calendar Settings</CardTitle>
          <CardDescription>
            Loading your calendar settings...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const isConnected = !!googleIntegration && googleIntegration.calendar_enabled;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar Settings</CardTitle>
        <CardDescription>
          Configure your Google Calendar integration for scheduling appointments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isConnected ? (
          <>
            <Alert className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Google Calendar Connected</AlertTitle>
              <AlertDescription className="text-green-700">
                Your Google account ({googleIntegration.email}) is connected and ready for scheduling.
              </AlertDescription>
            </Alert>
            
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">Calendar Configuration</h3>
                  <p className="text-sm text-muted-foreground">
                    {calendarSettings 
                      ? "Your calendar settings have been configured." 
                      : "You haven't configured your calendar settings yet."}
                  </p>
                  
                  {calendarSettings && (
                    <div className="mt-4 space-y-2 text-sm">
                      <p><span className="font-medium">Selected Calendar:</span> {calendarSettings.calendar_name || "Default Calendar"}</p>
                      <p><span className="font-medium">Default Duration:</span> {calendarSettings.default_duration} minutes</p>
                      <p><span className="font-medium">Buffer Time:</span> {calendarSettings.buffer_time} minutes</p>
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={() => setIsConfigModalOpen(true)}
                  variant={calendarSettings ? "outline" : "default"}
                >
                  {calendarSettings ? "Edit Configuration" : "Configure Calendar"}
                </Button>
              </div>
            </div>
            
            <div className="border-t pt-4 flex justify-between items-center">
              <div>
                <h3 className="font-medium">Google Calendar Connection</h3>
                <p className="text-sm text-muted-foreground">
                  Disconnect your Google Calendar integration
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={disconnectGoogle} 
                disabled={isConnecting}
              >
                {isConnecting ? "Disconnecting..." : "Disconnect"}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-6 space-y-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="font-medium">Connect Google Calendar</h3>
              <p className="text-sm text-muted-foreground max-w-md mt-1">
                Connect your Google Calendar to enable your AI agents to check your availability and schedule appointments.
              </p>
            </div>
            <Button 
              onClick={connectGoogle} 
              disabled={isConnecting} 
              className="mt-2"
            >
              {isConnecting ? "Connecting..." : "Connect Google Calendar"}
            </Button>
          </div>
        )}
      </CardContent>

      <CalendarConfigModal 
        isOpen={isConfigModalOpen} 
        onClose={() => setIsConfigModalOpen(false)}
        onSave={saveCalendarSettings}
        initialSettings={calendarSettings}
        googleIntegration={googleIntegration}
      />
    </Card>
  );
}

export interface CalendarSettings {
  user_id: string;
  calendar_id?: string;
  calendar_name?: string;
  default_duration: number;
  buffer_time: number;
  availability_days: number[];
  availability_start: string;
  availability_end: string;
  created_at?: string;
  updated_at?: string;
}
