import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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
  const searchParams = useSearchParams()[0];
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
    
    // If we have Google data from the redirect, store it
    if (googleConnected === 'true' && email && googleToken) {
      onGoogleRedirect(
        email, 
        googleToken, 
        googleRefreshToken || '', 
        googleExpiresAt || '', 
        googleScopes || ''
      );
    }
    
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
  }, [searchParams, toast, navigate, onGoogleRedirect]);

  return null;
}
