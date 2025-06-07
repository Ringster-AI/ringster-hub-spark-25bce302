
import { IntegrationsManagement } from "@/components/integrations/IntegrationsManagement";
import { GoogleOAuthHandler } from "./GoogleOAuthHandler";

export function Integrations() {
  return (
    <div className="space-y-6">
      <GoogleOAuthHandler onGoogleRedirect={() => {}} />
      <IntegrationsManagement />
    </div>
  );
}
