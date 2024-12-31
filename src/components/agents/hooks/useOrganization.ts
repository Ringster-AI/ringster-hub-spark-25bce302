import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useOrganization = (enabled: boolean) => {
  return useQuery({
    queryKey: ["user-organization"],
    queryFn: async () => {
      const { data: teamMember, error } = await supabase
        .from("team_members")
        .select("organization_id")
        .single();
      
      if (error) {
        console.error("Error fetching organization:", error);
        throw new Error("Failed to fetch organization data");
      }
      
      if (!teamMember?.organization_id) {
        throw new Error("No organization found");
      }
      
      return teamMember;
    },
    enabled,
  });
};