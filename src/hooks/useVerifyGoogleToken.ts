
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useVerifyGoogleToken() {
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);

  /**
   * Verifies if the user has a valid Google integration with valid tokens
   * If force refresh is true, it will trigger the token refresh regardless of expiration
   */
  const verifyGoogleToken = async (forceRefresh = false): Promise<boolean> => {
    try {
      setIsVerifying(true);

      // First check if we have a session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No active session, cannot verify token");
        return false;
      }

      // Check if we have an integration
      const { data: integration, error } = await supabase
        .from('google_integrations')
        .select('id, email, expires_at, scopes')
        .single();

      if (error || !integration) {
        console.error("No Google integration found:", error);
        return false;
      }

      // If not forcing refresh, check if token is still valid
      if (!forceRefresh) {
        const now = new Date();
        const expiresAt = new Date(integration.expires_at);
        
        // Add a 5 minute buffer to be safe
        const fiveMinutes = 5 * 60 * 1000;
        expiresAt.setTime(expiresAt.getTime() - fiveMinutes);
        
        // If token is still valid, return true
        if (now < expiresAt) {
          console.log("Google token is still valid until:", expiresAt);
          return true;
        }
      }

      // Token is expired or force refresh requested, try to refresh
      console.log("Refreshing Google token...");
      
      // Call our calendar list function which handles token refresh
      const { error: refreshError } = await supabase.functions.invoke('google-calendar-list');
      
      if (refreshError) {
        console.error("Error refreshing token:", refreshError);
        toast({
          variant: "destructive",
          title: "Connection Issue",
          description: "Your Google connection needs to be refreshed. Please reconnect your account.",
        });
        return false;
      }
      
      console.log("Google token refreshed successfully");
      return true;
    } catch (err) {
      console.error("Error verifying Google token:", err);
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    verifyGoogleToken,
    isVerifying
  };
}
