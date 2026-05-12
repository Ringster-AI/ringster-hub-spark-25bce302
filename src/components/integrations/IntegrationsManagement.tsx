
import { useState } from "react";
import { Integration } from "@/types/integrations/index";
import { IntegrationRegistry } from "@/services/integrations/IntegrationRegistry";
import { useIntegrations } from "@/hooks/useIntegrations";
import { useGoogleIntegration } from "@/hooks/useGoogleIntegration";
import { IntegrationCard } from "./IntegrationCard";
import { IntegrationConfigModal } from "./IntegrationConfigModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function IntegrationsManagement() {
  const {
    integrations,
    isLoading,
    connectIntegration,
    disconnectIntegration,
    testIntegration,
    updateIntegration
  } = useIntegrations();

  const {
    googleIntegration,
    isConnecting: isGoogleBusy,
    connectGoogle,
    disconnectGoogle,
  } = useGoogleIntegration();

  const [configIntegration, setConfigIntegration] = useState<Integration | null>(null);

  const availableTypes = IntegrationRegistry.getAvailableTypes();
  const allTypes = IntegrationRegistry.getAllTypes();
  const upcomingTypes = allTypes.filter(type => !type.isAvailable);

  // Build a virtual Integration row for Google Calendar based on the
  // legacy google_integrations table so the card reflects real status
  // even if the unified `integrations` row is missing.
  const googleVirtual: Integration | undefined = googleIntegration
    ? {
        id: googleIntegration.id,
        user_id: googleIntegration.user_id,
        integration_type: "google_calendar",
        provider_name: "google",
        display_name: googleIntegration.email || "Google Calendar",
        status: "connected",
        configuration: {},
        credentials: {},
        metadata: {},
        capabilities: [],
        is_active: true,
        last_sync_at: null,
        expires_at: googleIntegration.expires_at || null,
        created_at: googleIntegration.created_at || new Date().toISOString(),
        updated_at: googleIntegration.updated_at || new Date().toISOString(),
      }
    : undefined;

  const getIntegrationForType = (type: string) => {
    if (type === "google_calendar") {
      return integrations.find((i) => i.integration_type === type) || googleVirtual;
    }
    return integrations.find((integration) => integration.integration_type === type);
  };

  const handleConnect = async (type: string) => {
    if (type === "google_calendar") {
      await connectGoogle();
      return;
    }
    await connectIntegration(type, window.location.href);
  };

  const handleDisconnect = async (integration: Integration) => {
    if (integration.integration_type === "google_calendar" && googleIntegration) {
      await disconnectGoogle();
      return;
    }
    await disconnectIntegration(integration);
  };

  const handleTest = async (integration: Integration) => {
    await testIntegration(integration);
  };

  const handleConfigure = (integration: Integration) => {
    setConfigIntegration(integration);
  };

  const handleConfigSave = async (integration: Integration, configuration: Record<string, any>) => {
    updateIntegration({
      id: integration.id,
      updates: { configuration }
    });
    setConfigIntegration(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Loading integrations...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>
            Connect your favorite tools and services to enhance your campaigns
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="available" className="space-y-4">
        <TabsList>
          <TabsTrigger value="available">Available ({availableTypes.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Coming Soon ({upcomingTypes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {availableTypes.map((type) => {
              const integration = getIntegrationForType(type.type);
              return (
                <IntegrationCard
                  key={type.type}
                  integration={integration}
                  type={type}
                  onConnect={() => handleConnect(type.type)}
                  onDisconnect={() => integration && handleDisconnect(integration)}
                  onTest={() => integration && handleTest(integration)}
                  onConfigure={() => integration && handleConfigure(integration)}
                />
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingTypes.map((type) => (
              <IntegrationCard
                key={type.type}
                type={type}
                onConnect={() => {}}
                onDisconnect={() => {}}
                onTest={() => {}}
                onConfigure={() => {}}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {configIntegration && (
        <IntegrationConfigModal
          integration={configIntegration}
          onSave={handleConfigSave}
          onClose={() => setConfigIntegration(null)}
        />
      )}
    </div>
  );
}
