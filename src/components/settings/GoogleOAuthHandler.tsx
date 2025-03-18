
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface GoogleOAuthHandlerProps {
  onGoogleRedirect: (
    email: string, 
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
    const errorMessage = searchParams.get('errorMessage');
    const tab = searchParams.get('tab');
    
    // Handle Google auth redirect data
    const email = searchParams.get('email');
    const googleConnected = searchParams.get('googleConnected');
    const googleScopes = searchParams.get('googleScopes');
    
    console.log("OAuth redirect data received:", { 
      success, error, errorMessage, tab, email, googleConnected, 
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
      
      return !!session;
    };
    
    const handleOAuthData = async () => {
      setIsProcessing(true);
      
      try {
        // Check if user is authenticated first
        const isAuthenticated = await checkAuthentication();
        if (!isAuthenticated) {
          setIsProcessing(false);
          return;
        }
        
        // If we have Google data from the redirect, notify the parent component
        if (googleConnected === 'true' && email) {
          console.log("Google account connected successfully:", email);
          try {
            await onGoogleRedirect(
              email,
              googleScopes || ''
            );
            console.log("Parent component notified of Google connection");
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
            let displayErrorMessage = "Failed to connect your Google Calendar. Please try again.";
            
            // Use the provided error message if available
            if (errorMessage) {
              displayErrorMessage = errorMessage;
            } else {
              // Fallback error messages
              if (error === 'access_denied') {
                displayErrorMessage = "You denied access to your Google account.";
              } else if (error === 'server_config_error') {
                displayErrorMessage = "Server configuration error. Please contact support.";
              } else if (error === 'token_error') {
                displayErrorMessage = "Failed to get access token from Google.";
              } else if (error === 'auth_error') {
                displayErrorMessage = "Authentication error. Please log in and try again.";
              }
            }
            
            console.error("OAuth error:", error, displayErrorMessage);
            
            toast({
              variant: "destructive",
              title: "Connection Failed",
              description: displayErrorMessage,
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
