
import { Integration, IntegrationType } from "@/types/integrations/index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, TestTube, Unplug, AlertCircle, CheckCircle } from "lucide-react";

interface IntegrationCardProps {
  integration?: Integration;
  type: IntegrationType;
  onConnect: () => void;
  onDisconnect: () => void;
  onTest: () => void;
  onConfigure: () => void;
  isLoading?: boolean;
}

export function IntegrationCard({
  integration,
  type,
  onConnect,
  onDisconnect,
  onTest,
  onConfigure,
  isLoading = false
}: IntegrationCardProps) {
  const isConnected = integration?.status === 'connected';
  const hasError = integration?.status === 'error';
  const Icon = type.icon;

  const getStatusColor = () => {
    if (!integration) return 'gray';
    switch (integration.status) {
      case 'connected': return 'green';
      case 'error': return 'red';
      case 'pending': return 'yellow';
      default: return 'gray';
    }
  };

  const getStatusIcon = () => {
    if (!integration) return null;
    switch (integration.status) {
      case 'connected': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Icon className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="text-base">{type.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{type.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge variant={getStatusColor() as any}>
              {integration?.status || 'Not Connected'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1">
            {type.capabilities.map((capability) => (
              <Badge key={capability} variant="secondary" className="text-xs">
                {capability}
              </Badge>
            ))}
          </div>
          
          {integration && (
            <div className="text-sm text-muted-foreground">
              <p>Connected: {new Date(integration.created_at).toLocaleDateString()}</p>
              {integration.last_sync_at && (
                <p>Last sync: {new Date(integration.last_sync_at).toLocaleDateString()}</p>
              )}
            </div>
          )}
          
          <div className="flex gap-2">
            {!isConnected ? (
              <Button
                onClick={onConnect}
                disabled={isLoading || !type.isAvailable}
                className="flex-1"
              >
                {!type.isAvailable ? 'Coming Soon' : 'Connect'}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onTest}
                  disabled={isLoading}
                >
                  <TestTube className="h-4 w-4 mr-1" />
                  Test
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onConfigure}
                  disabled={isLoading}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Configure
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDisconnect}
                  disabled={isLoading}
                >
                  <Unplug className="h-4 w-4 mr-1" />
                  Disconnect
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
