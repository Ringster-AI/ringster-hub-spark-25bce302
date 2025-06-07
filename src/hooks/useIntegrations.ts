
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Integration } from "@/types/integrations";
import { IntegrationService } from "@/services/integrations/IntegrationService";
import { IntegrationRegistry } from "@/services/integrations/IntegrationRegistry";
import { useToast } from "@/hooks/use-toast";

export function useIntegrations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: integrations, isLoading, error } = useQuery({
    queryKey: ["integrations"],
    queryFn: IntegrationService.getUserIntegrations,
  });

  const createIntegrationMutation = useMutation({
    mutationFn: IntegrationService.createIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      toast({
        title: "Integration Created",
        description: "Integration has been successfully created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Integration",
        description: error.message || "Failed to create integration",
        variant: "destructive",
      });
    },
  });

  const updateIntegrationMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Integration> }) =>
      IntegrationService.updateIntegration(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      toast({
        title: "Integration Updated",
        description: "Integration has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Updating Integration",
        description: error.message || "Failed to update integration",
        variant: "destructive",
      });
    },
  });

  const deleteIntegrationMutation = useMutation({
    mutationFn: IntegrationService.deleteIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      toast({
        title: "Integration Deleted",
        description: "Integration has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Deleting Integration",
        description: error.message || "Failed to delete integration",
        variant: "destructive",
      });
    },
  });

  const connectIntegration = async (type: string, returnUrl?: string) => {
    try {
      const provider = IntegrationRegistry.getProvider(type);
      if (!provider) {
        throw new Error(`Provider not found for integration type: ${type}`);
      }
      
      await provider.connect(returnUrl);
    } catch (error: any) {
      console.error('Error connecting integration:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect integration",
        variant: "destructive",
      });
    }
  };

  const disconnectIntegration = async (integration: Integration) => {
    try {
      const provider = IntegrationRegistry.getProvider(integration.integration_type);
      if (!provider) {
        throw new Error(`Provider not found for integration type: ${integration.integration_type}`);
      }
      
      await provider.disconnect(integration.id);
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      
      toast({
        title: "Integration Disconnected",
        description: `${integration.display_name} has been successfully disconnected.`,
      });
    } catch (error: any) {
      console.error('Error disconnecting integration:', error);
      toast({
        title: "Disconnection Failed",
        description: error.message || "Failed to disconnect integration",
        variant: "destructive",
      });
    }
  };

  const testIntegration = async (integration: Integration): Promise<boolean> => {
    try {
      const provider = IntegrationRegistry.getProvider(integration.integration_type);
      if (!provider) {
        throw new Error(`Provider not found for integration type: ${integration.integration_type}`);
      }
      
      const isWorking = await provider.test(integration.id);
      
      toast({
        title: isWorking ? "Connection Test Successful" : "Connection Test Failed",
        description: isWorking 
          ? `${integration.display_name} is working correctly.`
          : `${integration.display_name} connection test failed.`,
        variant: isWorking ? "default" : "destructive",
      });
      
      return isWorking;
    } catch (error: any) {
      console.error('Error testing integration:', error);
      toast({
        title: "Test Failed",
        description: error.message || "Failed to test integration",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    integrations: integrations || [],
    isLoading,
    error,
    createIntegration: createIntegrationMutation.mutate,
    updateIntegration: updateIntegrationMutation.mutate,
    deleteIntegration: deleteIntegrationMutation.mutate,
    connectIntegration,
    disconnectIntegration,
    testIntegration,
    isCreating: createIntegrationMutation.isPending,
    isUpdating: updateIntegrationMutation.isPending,
    isDeleting: deleteIntegrationMutation.isPending,
  };
}
