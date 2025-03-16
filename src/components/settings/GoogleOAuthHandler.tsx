import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface GoogleOAuthHandlerProps {
  onGoogleRedirect: (
    email: string, 
    accessToken: string, 
    refreshToken: string,
    expiresAt: string,
    scopes: string
  ) => Promise<void>;
}

export function GoogleOAuthHandler({ onGoogleRedirect }: GoogleOAuthHandlerProps) {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const tab = searchParams.get('tab');
    
    // Handle Google auth redirect data
    const email = searchParams.get('email');
    const googleConnected = searchParams.get('googleConnected');
    const googleToken = searchParams.get('googleToken');
    const googleRefreshToken = searchParams.get('googleRefreshToken');
    const googleExpiresAt = searchParams.get('googleExpiresAt');
    const googleScopes = searchParams.get('googleScopes');
    
    console.log("OAuth redirect data:", { 
      success, error, tab, email, googleConnected, 
      hasToken: !!googleToken, 
      hasRefreshToken: !!googleRefreshToken,
      expiresAt: googleExpiresAt,
      scopes: googleScopes
    });
    
    // Prevent double processing
    if (isProcessing) return;
    
    const checkAuthentication = async () => {
      // Verify user is authenticated before proceeding
      const { data: { session } } = await supabase.auth.getSession();
      if (!session && googleConnected === 'true') {
        console.error("No active session found but Google data is present");
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "You must be logged in to connect your Google account",
        });
        navigate("/login", { replace: true });
        return false;
      }
      
      // If we have a session but it's close to expiring, refresh it
      if (session) {
        try {
          // Try to refresh the session to ensure it doesn't expire during OAuth process
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            console.warn("Session refresh warning:", refreshError);
          } else {
            console.log("Session refreshed successfully");
          }
        } catch (refreshErr) {
          console.error("Error refreshing session:", refreshErr);
        }
      }
      
      return !!session;
    };
    
    const handleOAuthData = async () => {
      setIsProcessing(true);
      
      try {
        const isAuthenticated = await checkAuthentication();
        if (!isAuthenticated) {
          setIsProcessing(false);
          return;
        }
        
        // If we have Google data from the redirect, store it
        if (googleConnected === 'true' && email && googleToken) {
          console.log("Attempting to store Google tokens...");
          try {
            await onGoogleRedirect(
              email, 
              googleToken, 
              googleRefreshToken || '', 
              googleExpiresAt || '', 
              googleScopes || ''
            );
            console.log("Google token storage completed successfully");
          } catch (err) {
            console.error("Error handling Google redirect:", err);
            toast({
              variant: "destructive",
              title: "Integration Failed",
              description: "Failed to save Google integration data. Please try again.",
            });
          }
        }
        
        // If there are URL parameters, show appropriate toast and clean URL
        if (success || error) {
          if (success) {
            toast({
              title: "Calendar Integration Successful",
              description: "Your Google Calendar has been successfully connected.",
            });
          }
          
          if (error) {
            let errorMessage = "Failed to connect your Google Calendar. Please try again.";
            if (error === 'access_denied') {
              errorMessage = "You denied access to your Google account.";
            } else if (error === 'server_config_error') {
              errorMessage = "Server configuration error. Please contact support.";
            } else if (error === 'token_error') {
              errorMessage = "Failed to get access token from Google.";
            } else if (error === 'auth_error') {
              errorMessage = "Authentication error. Please log in and try again.";
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
      } finally {
        setIsProcessing(false);
      }
    };
    
    if (googleConnected === 'true' || success || error) {
      handleOAuthData();
    }
  }, [searchParams, toast, navigate, onGoogleRedirect, isProcessing]);

  return null;
}
