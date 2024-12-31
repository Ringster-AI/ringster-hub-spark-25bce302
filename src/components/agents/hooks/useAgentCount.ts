import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAgentCount = (organizationId: string | undefined, enabled: boolean) => {
  return useQuery({
    queryKey: ["agents-count", organizationId],
    queryFn: async () => {
      if (!organizationId) return 0;

      const { count, error } = await supabase
        .from("agent_configs")
        .select("*", { count: "exact", head: true })
        .eq('organization_id', organizationId);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!organizationId && enabled,
  });
};