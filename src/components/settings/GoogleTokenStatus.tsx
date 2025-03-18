
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useVerifyGoogleToken } from "@/hooks/useVerifyGoogleToken";
import { useGoogleIntegration } from "@/hooks/useGoogleIntegration";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, CheckCircle, RefreshCcw, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

export function GoogleTokenStatus() {
  const { googleIntegration, isLoading } = useGoogleIntegration();
  const { verifyGoogleToken, isVerifying } = useVerifyGoogleToken();
  const { toast } = useToast();
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  
  useEffect(() => {
    // If we have an integration, verify the token
    if (googleIntegration && !isLoading) {
      checkTokenStatus();
    }
  }, [googleIntegration, isLoading]);
  
  const checkTokenStatus = async () => {
    if (!googleIntegration) return;
    
    const isValid = await verifyGoogleToken();
    setTokenValid(isValid);
    setLastChecked(new Date());
  };
  
  const handleForceRefresh = async () => {
    if (!googleIntegration) return;
    
    const result = await verifyGoogleToken(true);
    setTokenValid(result);
    setLastChecked(new Date());
    
    if (result) {
      toast({
        title: "Token Refreshed",
        description: "Your Google access token has been successfully refreshed.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Refresh Failed",
        description: "Unable to refresh your Google access token. Please reconnect your account.",
      });
    }
  };
  
  if (!googleIntegration || isLoading) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Google Integration Status
        </CardTitle>
        <CardDescription>
          Verify the connection status with your Google account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Connected Account:</span>
            <span className="font-medium">{googleIntegration.email}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Token Status:</span>
            <span className="flex items-center gap-1">
              {tokenValid === null && "Not checked"}
              {tokenValid === true && (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">Valid</span>
                </>
              )}
              {tokenValid === false && (
                <>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-600">Invalid</span>
                </>
              )}
            </span>
          </div>
          
          {lastChecked && (
            <div className="flex items-center justify-between">
              <span>Last Verified:</span>
              <span className="text-sm text-muted-foreground">
                {lastChecked.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={checkTokenStatus}
          disabled={isVerifying}
        >
          Check Status
        </Button>
        <Button 
          variant="default" 
          size="sm"
          onClick={handleForceRefresh}
          disabled={isVerifying}
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh Token
        </Button>
      </CardFooter>
    </Card>
  );
}
