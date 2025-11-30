
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { IntegrationService } from "@/services/integrations/IntegrationService";

export function useIntegrationMigration() {
  const { data: hasLegacyIntegrations } = useQuery({
    queryKey: ["legacy-google-integrations"],
    queryFn: async () => {
      // Check if user has legacy Google integrations
      const { data: legacyIntegrations, error } = await supabase
        .from('google_integrations')
        .select('id')
        .limit(1);

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking legacy integrations:', error);
        return false;
      }

      return legacyIntegrations && legacyIntegrations.length > 0;
    },
  });

  const { data: hasNewIntegrations } = useQuery({
    queryKey: ["new-integrations"],
    queryFn: async () => {
      const integrations = await IntegrationService.getUserIntegrations();
      return integrations.some(i => i.integration_type === 'google_calendar');
    },
    enabled: hasLegacyIntegrations === true,
  });

  useEffect(() => {
    // If user has legacy integrations but no new integrations, trigger migration
    if (hasLegacyIntegrations && !hasNewIntegrations) {
      console.log('Legacy Google integrations detected, migration should have been handled by the database function');
    }
  }, [hasLegacyIntegrations, hasNewIntegrations]);

  return {
    hasLegacyIntegrations,
    hasNewIntegrations,
    needsMigration: hasLegacyIntegrations && !hasNewIntegrations
  };
}
