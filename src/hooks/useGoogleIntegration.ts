
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GoogleIntegration } from "@/types/integrations";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function useGoogleIntegration() {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [googleIntegration, setGoogleIntegration] = useState<GoogleIntegration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch existing integrations on component mount
  useEffect(() => {
    async function fetchIntegrations() {
      try {
        setIsLoading(true);
        
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log("No active session, skipping integration fetch");
          setIsLoading(false);
          return;
        }
        
        console.log("Fetching Google integrations for user:", session.user.id);
        
        // Use type assertion to work around TypeScript checking
        // Only fetch limited data - never fetch tokens directly in the browser
        const { data, error } = await (supabase
          .from('google_integrations')
          .select('id, user_id, email, created_at, updated_at, scopes')
          .eq('user_id', session.user.id)
          .single() as any);
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          console.error("Error fetching integrations:", error);
          throw error;
        }
        
        if (data) {
          console.log("Google integration found:", data);
          setGoogleIntegration(data as GoogleIntegration);
        } else {
          console.log("No Google integration found for user");
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
      setError(null);
      
      // Verify user is authenticated before proceeding
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("No active session found");
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "You must be logged in to connect your Google account",
        });
        navigate("/login");
        return;
      }
      
      console.log("Starting Google OAuth flow for user:", session.user.id);
      
      // Get current URL as return URL
      const currentUrl = window.location.href;
      
      // Call the Supabase Edge Function to start the OAuth flow
      const { data, error } = await supabase.functions.invoke('connect-google', {
        method: 'POST',
        body: { returnUrl: currentUrl },
      });
      
      if (error) {
        console.error("Error invoking connect-google function:", error);
        throw error;
      }
      
      // Redirect to Google's OAuth page
      if (data?.url) {
        console.log("Redirecting to Google OAuth:", data.url);
        window.location.href = data.url;
      } else {
        console.error("No redirect URL received from server");
        throw new Error('No redirect URL received from server');
      }
    } catch (error: any) {
      console.error('Error connecting Google account:', error);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error.message || "Failed to connect Google account. Please try again.",
      });
      setError(error.message || "Failed to connect Google account");
      setIsConnecting(false);
    }
  };
  
  // Function to disconnect Google account
  const disconnectGoogle = async () => {
    try {
      setIsConnecting(true);
      
      // Get the current session to include the auth token in the request
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session found");
      }
      
      // Use edge function to handle token revocation and secure deletion
      // Include the proper authorization header with the JWT token
      const { error } = await supabase.functions.invoke('revoke-google-tokens', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) {
        console.error("Error calling revoke-google-tokens:", error);
        throw error;
      }
      
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

  // Handle Google redirect data securely
  const handleGoogleRedirectData = async (
    email: string,
    scopes: string
  ) => {
    try {
      setIsConnecting(true);
      
      console.log("Handling Google redirect data", { email, scopes });
      
      // Create integration info for UI only (tokens are securely stored server-side)
      const now = new Date().toISOString();
      
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("No active session found when handling redirect");
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "You must be logged in to connect your Google account",
        });
        navigate("/login");
        return;
      }
      
      console.log("User is authenticated:", session.user.id);
      
      // Fetch the latest Google integration data to ensure we have up-to-date info
      const { data, error } = await supabase
        .from('google_integrations')
        .select('id, user_id, email, created_at, updated_at, scopes')
        .eq('email', email)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching integration details:", error);
        throw new Error("Failed to retrieve integration details");
      }
      
      if (data) {
        console.log("Integration found after redirect:", data);
        // Update local state with data from database
        // Fix TypeScript error with proper type assertion
        setGoogleIntegration(data as unknown as GoogleIntegration);
      } else {
        console.log("No integration found for email:", email);
        
        // Verify user session to get userId
        const userId = session.user.id;
        
        // Create a minimal representation for UI
        setGoogleIntegration({
          id: '', // Will be populated on next page load
          user_id: userId,
          email,
          access_token: '',  // Intentionally not storing in front-end
          refresh_token: '', // Intentionally not storing in front-end
          expires_at: '', // Managed server-side
          scopes,
          created_at: now,
          updated_at: now
        });
      }
      
      toast({
        title: "Integration Successful",
        description: `Your Google Calendar (${email}) has been successfully connected.`,
      });
      
      // Clean up URL parameters
      navigate("/dashboard/settings?tab=integrations", { replace: true });
      
    } catch (err: any) {
      console.error("Error handling Google integration:", err);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: err.message || "Failed to update your Google account information.",
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
