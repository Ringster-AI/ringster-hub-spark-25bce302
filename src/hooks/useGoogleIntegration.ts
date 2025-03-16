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
        // Only fetch limited data - never fetch tokens directly in the browser
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
      
      // Use edge function to handle token revocation and secure deletion
      const { error } = await supabase.functions.invoke('revoke-google-tokens', {
        method: 'POST',
      });
      
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

  // Handle Google redirect data securely through an edge function
  const handleGoogleRedirectData = async (
    email: string, 
    accessToken: string, 
    refreshToken: string,
    expiresAt: string,
    scopes: string
  ) => {
    try {
      setIsConnecting(true);
      
      // Use edge function to handle sensitive token storage
      const { error } = await supabase.functions.invoke('store-google-tokens', {
        method: 'POST',
        body: { 
          email,
          accessToken,
          refreshToken,
          expiresAt,
          scopes
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Update local state with non-sensitive information
      // Include timestamp fields with default values to satisfy TypeScript
      const now = new Date().toISOString();
      
      setGoogleIntegration({
        id: '', // Will be fetched on next load
        user_id: '', // Will be fetched on next load
        email,
        access_token: '', // Intentionally not storing in front-end
        refresh_token: '', // Intentionally not storing in front-end
        expires_at: expiresAt,
        scopes,
        created_at: now,
        updated_at: now
      });
      
      toast({
        title: "Integration Successful",
        description: `Your Google Calendar (${email}) has been successfully connected.`,
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
