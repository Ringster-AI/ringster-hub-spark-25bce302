import { IntegrationsManagement } from "@/components/integrations/IntegrationsManagement";
import { GoogleOAuthHandler } from "./GoogleOAuthHandler";
import { GoogleCalendarSettingsPanel } from "./GoogleCalendarSettingsPanel";

export function Integrations() {
  const handleGoogleRedirect = async (email: string, scopes: string): Promise<void> => {
    console.log("Google OAuth redirect processed:", { email, scopes });
  };

  return (
    <div className="space-y-6">
      <GoogleOAuthHandler onGoogleRedirect={handleGoogleRedirect} />
      <IntegrationsManagement />
      <GoogleCalendarSettingsPanel />
    </div>
  );
}
