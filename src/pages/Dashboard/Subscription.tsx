
import { useSubscriptionFeatures } from "@/hooks/useSubscriptionFeatures";
import { SubscriptionBadge } from "@/components/subscription/SubscriptionBadge";
import { PricingPlans } from "@/components/subscription/PricingPlans";

const Subscription = () => {
  const { features, subscription } = useSubscriptionFeatures();

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <h1 className="text-3xl font-bold">Subscription</h1>
        <SubscriptionBadge />
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Current Plan Usage</h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Minutes Used: {features.limits.minutesAllowance - features.limits.remainingMinutes} / {features.limits.minutesAllowance}</p>
          <p>Agents Created: {features.limits.maxAgents}</p>
          <p>Team Members: {features.limits.maxTeamMembers}</p>
          {features.expiresAt && (
            <p>
              Plan {features.willExpire ? "expires" : "expired"} on:{" "}
              {new Date(features.expiresAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6">Available Plans</h2>
        <PricingPlans />
      </div>
    </div>
  );
};

export default Subscription;
