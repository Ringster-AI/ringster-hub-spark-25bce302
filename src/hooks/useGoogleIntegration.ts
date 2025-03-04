
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GoogleIntegration } from "@/types/integrations";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";

export function useGoogleIntegration() {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [googleIntegration, setGoogleIntegration] = useState<GoogleIntegration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

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
      
      // Get current URL as return URL
      const currentUrl = window.location.href;
      
      // Call the Supabase Edge Function to start the OAuth flow
      const { data, error } = await supabase.functions.invoke('connect-google', {
        method: 'POST',
        body: { returnUrl: currentUrl },
      });
      
      if (error) throw error;
      
      // Redirect to Google's OAuth page
      if (data?.url) {
        console.log("Redirecting to Google OAuth:", data.url);
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

  // Handle Google redirect data by storing tokens in Supabase
  const handleGoogleRedirectData = async (
    email: string, 
    accessToken: string, 
    refreshToken: string,
    expiresAt: string,
    scopes: string
  ) => {
    try {
      setIsConnecting(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      console.log("Storing Google integration for user:", user.id, "with email:", email);
      
      // Store the Google integration data
      const { error: dbError } = await (supabase
        .from('google_integrations' as any)
        .upsert({
          user_id: user.id,
          email: email,
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: expiresAt,
          scopes: scopes,
        }) as any);
      
      if (dbError) {
        console.error("Database error storing integration:", dbError);
        throw dbError;
      }
      
      // Update local state with the new integration
      setGoogleIntegration({
        id: '', // We don't know the ID yet, will be fetched on next load
        user_id: user.id,
        email,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt,
        scopes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      
      toast({
        title: "Integration Successful",
        description: `Your Google account (${email}) has been successfully connected.`,
      });
      
      // Clean up URL parameters
      navigate("/dashboard/settings?tab=integrations", { replace: true });
      
    } catch (err: any) {
      console.error("Error storing Google integration:", err);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: err.message || "Failed to store your Google account information.",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return {
    googleIntegration,
    isConnecting,
    isLoading,
    error,
    connectGoogle,
    disconnectGoogle,
    handleGoogleRedirectData
  };
}
