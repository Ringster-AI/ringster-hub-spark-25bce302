
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Mail, Calendar, Check, ExternalLink, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams, useNavigate } from "react-router-dom";

interface GoogleIntegration {
  id: string;
  user_id: string;
  email: string;
  scopes: string;
  created_at: string;
  updated_at: string;
}

export function Integrations() {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [googleIntegration, setGoogleIntegration] = useState<GoogleIntegration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const searchParams = useSearchParams()[0];
  const navigate = useNavigate();
  
  // Check URL parameters for success or error messages
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const tab = searchParams.get('tab');
    
    // If there are URL parameters, show appropriate toast and clean URL
    if (success || error) {
      if (success) {
        toast({
          title: "Integration Successful",
          description: "Your Google account has been successfully connected.",
        });
      }
      
      if (error) {
        let errorMessage = "Failed to connect your Google account. Please try again.";
        if (error === 'access_denied') {
          errorMessage = "You denied access to your Google account.";
        }
        
        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: errorMessage,
        });
      }
      
      // Clean up URL params but keep the tab
      if (tab) {
        navigate(`/dashboard/settings?tab=${tab}`, { replace: true });
      } else {
        navigate("/dashboard/settings", { replace: true });
      }
    }
  }, [searchParams, toast, navigate]);
  
  // Fetch existing integrations on component mount
  useEffect(() => {
    async function fetchIntegrations() {
      try {
        setIsLoading(true);
        
        // Use type assertion to work around TypeScript checking
        const { data, error } = await (supabase
          .from('google_integrations' as any)
          .select('id, user_id, email, created_at, updated_at, scopes')
          .single() as any);
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          throw error;
        }
        
        if (data) {
          setGoogleIntegration(data as GoogleIntegration);
        }
      } catch (err: any) {
        console.error('Error fetching integrations:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchIntegrations();
  }, []);
  
  // Function to initiate Google OAuth flow
  const connectGoogle = async () => {
    try {
      setIsConnecting(true);
      
      // Call the Supabase Edge Function to start the OAuth flow
      const { data, error } = await supabase.functions.invoke('connect-google', {
        method: 'POST',
      });
      
      if (error) throw error;
      
      // Redirect to Google's OAuth page
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No redirect URL received from server');
      }
    } catch (error: any) {
      console.error('Error connecting Google account:', error);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error.message || "Failed to connect Google account. Please try again.",
      });
      setIsConnecting(false);
    }
  };
  
  // Function to disconnect Google account
  const disconnectGoogle = async () => {
    try {
      setIsConnecting(true);
      
      // Use type assertion to work around TypeScript checking
      const { error } = await (supabase
        .from('google_integrations' as any)
        .delete()
        .is('user_id', 'not.null') as any);
      
      if (error) throw error;
      
      setGoogleIntegration(null);
      
      toast({
        title: "Account Disconnected",
        description: "Your Google account has been successfully disconnected.",
      });
    } catch (error: any) {
      console.error('Error disconnecting Google account:', error);
      toast({
        variant: "destructive",
        title: "Disconnection Failed",
        description: error.message || "Failed to disconnect Google account. Please try again.",
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
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
          <div className="flex items-start justify-between border p-4 rounded-lg">
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Google Mail</h3>
                <p className="text-sm text-muted-foreground">
                  Allow your agents to send emails on your behalf
                </p>
                {googleConnected && googleIntegration.scopes.includes('gmail.send') && (
                  <p className="text-xs text-green-600 mt-1">
                    <Check className="inline h-3 w-3 mr-1" />
                    Connected with {googleIntegration.email}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant={googleConnected ? "outline" : "default"}
              onClick={googleConnected ? disconnectGoogle : connectGoogle}
              disabled={isConnecting}
              className="min-w-[120px]"
            >
              {googleConnected ? (
                isConnecting ? "Disconnecting..." : "Disconnect"
              ) : isConnecting ? (
                "Connecting..."
              ) : (
                "Connect"
              )}
            </Button>
          </div>
          
          <div className="flex items-start justify-between border p-4 rounded-lg">
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Google Calendar</h3>
                <p className="text-sm text-muted-foreground">
                  Allow your agents to schedule appointments on your calendar
                </p>
                {googleConnected && googleIntegration.scopes.includes('calendar') && (
                  <p className="text-xs text-green-600 mt-1">
                    <Check className="inline h-3 w-3 mr-1" />
                    Connected with {googleIntegration.email}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant={googleConnected ? "outline" : "default"}
              onClick={googleConnected ? disconnectGoogle : connectGoogle}
              disabled={isConnecting}
              className="min-w-[120px]"
            >
              {googleConnected ? (
                isConnecting ? "Disconnecting..." : "Disconnect"
              ) : isConnecting ? (
                "Connecting..."
              ) : (
                "Connect"
              )}
            </Button>
          </div>
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
