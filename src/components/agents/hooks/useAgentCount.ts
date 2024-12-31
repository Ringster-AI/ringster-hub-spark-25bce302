import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAgentCount = (enabled: boolean) => {
  return useQuery({
    queryKey: ["agents-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("agent_configs")
        .select("*", { count: "exact", head: true });
      
      if (error) throw error;
      return count || 0;
    },
    enabled,
  });
};