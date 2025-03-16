import { useEffect } from "react";
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
    const calendarEnabled = searchParams.get('calendarEnabled');
    
    console.log("OAuth redirect data:", { 
      success, error, tab, email, googleConnected, 
      hasToken: !!googleToken, 
      hasRefreshToken: !!googleRefreshToken,
      expiresAt: googleExpiresAt,
      scopes: googleScopes,
      calendarEnabled
    });
    
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
      return true;
    };
    
    const handleOAuthData = async () => {
      const isAuthenticated = await checkAuthentication();
      if (!isAuthenticated) return;
      
      // If we have Google data from the redirect, store it
      if (googleConnected === 'true' && email && googleToken) {
        onGoogleRedirect(
          email, 
          googleToken, 
          googleRefreshToken || '', 
          googleExpiresAt || '', 
          googleScopes || ''
        ).catch(err => {
          console.error("Error handling Google redirect:", err);
          toast({
            variant: "destructive",
            title: "Integration Failed",
            description: "Failed to save Google integration data",
          });
        });
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
    };
    
    if (googleConnected === 'true' || success || error) {
      handleOAuthData();
    }
  }, [searchParams, toast, navigate, onGoogleRedirect]);

  return null;
}
