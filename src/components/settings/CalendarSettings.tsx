
import { GoogleTokenStatus } from "./GoogleTokenStatus";
import { IntegrationServiceCard } from "./IntegrationServiceCard";
import { useGoogleIntegration } from "@/hooks/useGoogleIntegration";
import { CalendarConfigModal } from "./CalendarConfigModal";

export function CalendarSettings() {
  const { 
    googleIntegration, 
    isConnecting, 
    isLoading, 
    connectGoogle, 
    disconnectGoogle 
  } = useGoogleIntegration();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Calendar Settings</h2>
      <p className="text-muted-foreground">
        Connect your calendar to manage appointments and availability.
      </p>

      <IntegrationServiceCard
        title="Google Calendar"
        description="Connect your Google Calendar to manage appointments and availability."
        icon="calendar"
        connected={!!googleIntegration}
        connectionInfo={googleIntegration ? `Connected to ${googleIntegration.email}` : ""}
        isLoading={isLoading}
        isConnecting={isConnecting}
        onConnect={connectGoogle}
        onDisconnect={disconnectGoogle}
      />

      {googleIntegration && (
        <div className="space-y-6 mt-6">
          <GoogleTokenStatus />
          
          <CalendarConfigModal 
            googleIntegration={googleIntegration}
          />
        </div>
      )}
    </div>
  );
}
