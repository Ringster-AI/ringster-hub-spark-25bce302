
import { SubscriptionFeatures } from "@/types/subscription/plans";
import { PlanUsageCards } from "./PlanUsageCards";
import { ExpirationCard } from "./ExpirationCard";

interface CurrentPlanUsageProps {
  features: SubscriptionFeatures;
  billingData: any;
  usagePercentage: number;
}

export const CurrentPlanUsage = ({ features, billingData, usagePercentage }: CurrentPlanUsageProps) => {
  return (
    <div className="mb-6 md:mb-8">
      <h2 className="text-lg font-semibold mb-4">Current Plan Usage</h2>
      <PlanUsageCards features={features} billingData={billingData} usagePercentage={usagePercentage} />
      <ExpirationCard features={features} />
    </div>
  );
};
