
import { IntegrationsManagement } from "@/components/integrations/IntegrationsManagement";
import { GoogleOAuthHandler } from "./GoogleOAuthHandler";

export function Integrations() {
  const handleGoogleRedirect = async (email: string, scopes: string): Promise<void> => {
    // This function is called when Google OAuth redirect is processed
    console.log('Google OAuth redirect processed:', { email, scopes });
  };

  return (
    <div className="space-y-6">
      <GoogleOAuthHandler onGoogleRedirect={handleGoogleRedirect} />
      <IntegrationsManagement />
    </div>
  );
}
