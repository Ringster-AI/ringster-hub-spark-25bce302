import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LiveCoachAccess {
  allowed: boolean;
  sessions_used: number;
  limit: number | null; // null = unlimited
  plan_name: string;
}

export const useLiveCoachAccess = () => {
  return useQuery({
    queryKey: ["live-coach-access"],
    queryFn: async (): Promise<LiveCoachAccess> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return { allowed: false, sessions_used: 0, limit: 0, plan_name: "Free" };
      }

      const { data, error } = await supabase.rpc("has_live_coach_access" as any, {
        p_user_id: session.user.id,
      });

      if (error) {
        console.error("Live coach access check failed:", error);
        return { allowed: false, sessions_used: 0, limit: 0, plan_name: "Free" };
      }

      return data as LiveCoachAccess;
    },
    staleTime: 30_000,
  });
};
