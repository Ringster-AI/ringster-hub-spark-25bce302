
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CampaignIntegration } from "@/types/integrations";
import { IntegrationService } from "@/services/integrations/IntegrationService";
import { IntegrationRegistry } from "@/services/integrations/IntegrationRegistry";
import { useIntegrations } from "@/hooks/useIntegrations";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Settings, Plus, Trash2 } from "lucide-react";

interface CampaignIntegrationsProps {
  campaignId: string;
}

export function CampaignIntegrations({ campaignId }: CampaignIntegrationsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { integrations } = useIntegrations();

  const { data: campaignIntegrations, isLoading } = useQuery({
    queryKey: ["campaign-integrations", campaignId],
    queryFn: () => IntegrationService.getCampaignIntegrations(campaignId),
  });

  const addIntegrationMutation = useMutation({
    mutationFn: ({ integrationId, configuration }: { integrationId: string; configuration: Record<string, any> }) =>
      IntegrationService.addCampaignIntegration(campaignId, integrationId, configuration),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-integrations", campaignId] });
      toast({
        title: "Integration Added",
        description: "Integration has been added to the campaign.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Adding Integration",
        description: error.message || "Failed to add integration",
        variant: "destructive",
      });
    },
  });

  const updateIntegrationMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CampaignIntegration> }) =>
      IntegrationService.updateCampaignIntegration(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-integrations", campaignId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error Updating Integration",
        description: error.message || "Failed to update integration",
        variant: "destructive",
      });
    },
  });

  const removeIntegrationMutation = useMutation({
    mutationFn: IntegrationService.removeCampaignIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-integrations", campaignId] });
      toast({
        title: "Integration Removed",
        description: "Integration has been removed from the campaign.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Removing Integration",
        description: error.message || "Failed to remove integration",
        variant: "destructive",
      });
    },
  });

  const availableIntegrations = integrations.filter(integration => 
    integration.status === 'connected' && 
    !campaignIntegrations?.some(ci => ci.integration_id === integration.id)
  );

  const handleAddIntegration = (integrationId: string) => {
    addIntegrationMutation.mutate({ integrationId, configuration: {} });
  };

  const handleToggleIntegration = (campaignIntegration: CampaignIntegration) => {
    updateIntegrationMutation.mutate({
      id: campaignIntegration.id,
      updates: { is_enabled: !campaignIntegration.is_enabled }
    });
  };

  const handleRemoveIntegration = (campaignIntegrationId: string) => {
    removeIntegrationMutation.mutate(campaignIntegrationId);
  };

  if (isLoading) {
    return <div>Loading campaign integrations...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Campaign Integrations</h3>
      
      {/* Active Integrations */}
      {campaignIntegrations && campaignIntegrations.length > 0 ? (
        <div className="grid gap-4">
          {campaignIntegrations.map((campaignIntegration) => {
            const integration = campaignIntegration.integration;
            const integrationType = integration ? IntegrationRegistry.getTypeByKey(integration.integration_type) : null;
            const Icon = integrationType?.icon;

            return (
              <Card key={campaignIntegration.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {Icon && <Icon className="h-5 w-5 text-primary" />}
                      <div>
                        <h4 className="font-medium">{integration?.display_name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={integration?.status === 'connected' ? 'default' : 'secondary'}>
                            {integration?.status}
                          </Badge>
                          <Badge variant={campaignIntegration.is_enabled ? 'default' : 'secondary'}>
                            {campaignIntegration.is_enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={campaignIntegration.is_enabled}
                        onCheckedChange={() => handleToggleIntegration(campaignIntegration)}
                        disabled={updateIntegrationMutation.isPending}
                      />
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {}}
                        disabled={true} // TODO: Implement configuration
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveIntegration(campaignIntegration.id)}
                        disabled={removeIntegrationMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Plus className="mx-auto h-12 w-12 mb-4" />
              <p>No integrations added to this campaign yet</p>
              <p className="text-sm">Add integrations to enhance your campaign capabilities</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Integrations to Add */}
      {availableIntegrations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {availableIntegrations.map((integration) => {
                const integrationType = IntegrationRegistry.getTypeByKey(integration.integration_type);
                const Icon = integrationType?.icon;

                return (
                  <div key={integration.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-3">
                      {Icon && <Icon className="h-4 w-4 text-primary" />}
                      <span className="font-medium">{integration.display_name}</span>
                      <div className="flex gap-1">
                        {integrationType?.capabilities.map((capability) => (
                          <Badge key={capability} variant="secondary" className="text-xs">
                            {capability}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => handleAddIntegration(integration.id)}
                      disabled={addIntegrationMutation.isPending}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
