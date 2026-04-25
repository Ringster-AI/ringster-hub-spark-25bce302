
import { useSubscriptionFeatures } from "@/hooks/useSubscriptionFeatures";
import { useBillingData } from "./hooks/useBillingData";
import { SubscriptionHeader } from "./SubscriptionHeader";
import { CurrentPlanUsage } from "./CurrentPlanUsage";
import { AgentUsageTable } from "./AgentUsageTable";
import { MonthlySummary } from "./MonthlySummary";
import { PricingPlans } from "@/components/subscription/PricingPlans";
import { CreditDisplay } from "@/components/credits/CreditDisplay";
import { CreditTransactionHistory } from "@/components/credits/CreditTransactionHistory";

export const SubscriptionContent = () => {
  const { features, isLoading } = useSubscriptionFeatures();
  const { billingData, isLoadingBilling } = useBillingData();

  const usagePercentage = features.limits.minutesAllowance > 0 ? 
    Math.round(((features.limits.minutesAllowance - features.limits.remainingMinutes) / features.limits.minutesAllowance) * 100) : 0;

  return (
    <div className="w-full">
      <div className="p-4 md:p-6">
        <SubscriptionHeader />

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mb-6 text-sm text-foreground">
          <span className="font-medium">How credits work:</span>{" "}
          <span className="text-muted-foreground">1 credit = 1 minute of talk time.</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <CreditDisplay 
            onUpgrade={() => {
              document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            onTopUp={() => {
              // TODO: Implement credit top-up functionality
              console.log('Top up credits');
            }}
          />
          <CreditTransactionHistory />
        </div>

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

      <div id="pricing-section" className="p-4 md:p-6 pt-0">
        <PricingPlans />
      </div>
    </div>
  );
};
