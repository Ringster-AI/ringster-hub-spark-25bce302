import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  minutes_allowance: number;
  features: {
    features: string[];
    max_agents: number;
  };
  max_team_members: number;
  max_agents: number;
}

export interface UserSubscription {
  id: string;
  plan_id: string;
  status: string;
  plan: SubscriptionPlan;
}

export const useSubscription = () => {
  const { data: subscription, isLoading } = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from("user_subscriptions")
        .select(`
          id,
          plan_id,
          status,
          plan:subscription_plans (
            id,
            name,
            price,
            minutes_allowance,
            features,
            max_team_members,
            max_agents
          )
        `)
        .single();

      if (subscriptionError) {
        throw subscriptionError;
      }

      return subscriptionData as UserSubscription;
    },
  });

  const canCreateAgent = () => {
    if (!subscription) return false;
    const { data: agentCount } = await supabase
      .from("agent_configs")
      .select("id", { count: true });
    
    return (agentCount || 0) < subscription.plan.max_agents;
  };

  const canCustomizeVoice = () => {
    if (!subscription) return false;
    return subscription.plan.price > 0; // Only paid plans can customize voices
  };

  const canAddTeamMembers = () => {
    if (!subscription) return false;
    const { data: teamCount } = await supabase
      .from("team_members")
      .select("id", { count: true });
    
    return (teamCount || 0) < subscription.plan.max_team_members;
  };

  const getRemainingMinutes = () => {
    if (!subscription) return 0;
    return subscription.plan.minutes_allowance;
  };

  return {
    subscription,
    isLoading,
    canCreateAgent,
    canCustomizeVoice,
    canAddTeamMembers,
    getRemainingMinutes,
  };
};