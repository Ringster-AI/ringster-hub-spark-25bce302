import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionFeatures, UserSubscription } from "@/types/subscription/plans";

export const useSubscriptionFeatures = () => {
  const { data: subscription, isLoading } = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from("user_subscriptions")
        .select(`
          id,
          user_id,
          plan_id,
          status,
          current_period_start,
          current_period_end,
          stripe_subscription_id,
          stripe_customer_id,
          plan:subscription_plans (
            id,
            name,
            price,
            minutes_allowance,
            features,
            max_team_members,
            max_agents,
            billing_interval,
            stripe_price_id,
            is_active
          )
        `)
        .maybeSingle();

      if (subscriptionError) {
        throw subscriptionError;
      }

      return subscriptionData as UserSubscription | null;
    },
  });

  const getFeatures = (): SubscriptionFeatures => {
    if (!subscription) {
      return {
        limits: {
          maxAgents: 0,
          maxTeamMembers: 0,
          minutesAllowance: 0,
          canCustomizeVoices: false,
          remainingMinutes: 0,
        },
        isActive: false,
        isPaid: false,
        isTrialing: false,
        willExpire: false,
      };
    }

    const now = new Date();
    const periodEnd = subscription.current_period_end ? new Date(subscription.current_period_end) : undefined;

    return {
      limits: {
        maxAgents: subscription.plan?.max_agents ?? 0,
        maxTeamMembers: subscription.plan?.max_team_members ?? 0,
        minutesAllowance: subscription.plan?.minutes_allowance ?? 0,
        canCustomizeVoices: (subscription.plan?.price ?? 0) > 0,
        remainingMinutes: subscription.plan?.minutes_allowance ?? 0, // TODO: Implement actual usage tracking
      },
      isActive: subscription.status === 'active',
      isPaid: (subscription.plan?.price ?? 0) > 0,
      isTrialing: subscription.status === 'trialing',
      willExpire: !!periodEnd && periodEnd > now,
      expiresAt: periodEnd,
    };
  };

  const features = getFeatures();

  return {
    features,
    subscription,
    isLoading,
  };
};