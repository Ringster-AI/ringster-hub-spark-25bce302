
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Mail, Calendar, Check, ExternalLink, AlertCircle } from "lucide-react";
import { useGoogleIntegration } from "@/hooks/useGoogleIntegration";
import { GoogleOAuthHandler } from "./GoogleOAuthHandler";
import { IntegrationServiceCard } from "./IntegrationServiceCard";

export function Integrations() {
  const {
    googleIntegration,
    isConnecting,
    isLoading,
    error,
    connectGoogle,
    disconnectGoogle,
    handleGoogleRedirectData
  } = useGoogleIntegration();
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>
            Loading your connected accounts...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  const googleConnected = !!googleIntegration;
  
  return (
    <Card>
      <GoogleOAuthHandler onGoogleRedirect={handleGoogleRedirectData} />
      
      <CardHeader>
        <CardTitle>Integrations</CardTitle>
        <CardDescription>
          Connect your accounts to enable your AI agents to perform actions on your behalf
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        {googleConnected && (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertTitle>Google Account Connected</AlertTitle>
            <AlertDescription>
              Your Google account ({googleIntegration.email}) is connected and your agents can now access your email and calendar.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          <IntegrationServiceCard
            icon={<Mail className="h-6 w-6 text-primary" />}
            title="Google Mail"
            description="Allow your agents to send emails on your behalf"
            isConnected={googleConnected}
            connectedEmail={googleIntegration?.email}
            scopeCheck={googleIntegration?.scopes?.includes('gmail.send') ? 'gmail.send' : ''}
            isConnecting={isConnecting}
            onConnect={connectGoogle}
            onDisconnect={disconnectGoogle}
          />
          
          <IntegrationServiceCard
            icon={<Calendar className="h-6 w-6 text-primary" />}
            title="Google Calendar"
            description="Allow your agents to schedule appointments on your calendar"
            isConnected={googleConnected}
            connectedEmail={googleIntegration?.email}
            scopeCheck={googleIntegration?.scopes?.includes('calendar') ? 'calendar' : ''}
            isConnecting={isConnecting}
            onConnect={connectGoogle}
            onDisconnect={disconnectGoogle}
          />
        </div>
        
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Your agents won't have direct access to your accounts. All operations are performed securely through our servers.
            <a href="#" className="text-primary flex items-center mt-2 hover:underline">
              Learn more about our security practices
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
