
import { useSubscriptionFeatures } from "@/hooks/useSubscriptionFeatures";
import { useBillingData } from "./hooks/useBillingData";
import { SubscriptionHeader } from "./SubscriptionHeader";
import { CurrentPlanUsage } from "./CurrentPlanUsage";
import { AgentUsageTable } from "./AgentUsageTable";
import { MonthlySummary } from "./MonthlySummary";
import { PricingPlans } from "@/components/subscription/PricingPlans";

export const SubscriptionContent = () => {
  const { features, isLoading } = useSubscriptionFeatures();
  const { billingData, isLoadingBilling } = useBillingData();

  const usagePercentage = features.limits.minutesAllowance > 0 ? 
    Math.round(((features.limits.minutesAllowance - features.limits.remainingMinutes) / features.limits.minutesAllowance) * 100) : 0;

  return (
    <div className="w-full">
      <div className="p-4 md:p-6">
        <SubscriptionHeader />

        <CurrentPlanUsage 
          features={features} 
          billingData={billingData} 
          usagePercentage={usagePercentage} 
        />

        <AgentUsageTable billingData={billingData} />

        {billingData?.monthlySummary && (
          <MonthlySummary monthlySummary={billingData.monthlySummary} />
        )}
      </div>

      <div className="p-4 md:p-6 pt-0">
        <PricingPlans />
      </div>
    </div>
  );
};
