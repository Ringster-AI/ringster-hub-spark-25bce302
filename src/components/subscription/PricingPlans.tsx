
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PricingHeader } from "./PricingHeader";
import { PlanCard } from "./PlanCard";
import { PricingPlan } from "./types";

export const PricingPlans = () => {
  const { toast } = useToast();
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');

const { data: plans, isLoading } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select(`
          *,
          plan_features(*)
        `)
        .order("price");

      if (error) throw error;
      
      return data?.map(plan => ({
        ...plan,
        features: plan.features as PricingPlan['features']
      })) as PricingPlan[];
    },
  });

  const handleUpgrade = async (priceId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter plans based on billing interval
  // For pay-as-you-go plans, show them regardless of billing interval
  const filteredPlans = plans?.filter(
    (plan) => (plan.is_pay_as_you_go || plan.billing_interval === billingInterval) && plan.is_active
  );

  if (isLoading) {
    return <div className="text-center">Loading plans...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <PricingHeader 
        billingInterval={billingInterval} 
        setBillingInterval={setBillingInterval} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans?.map((plan) => (
          <PlanCard 
            key={plan.id}
            plan={plan}
            billingInterval={billingInterval}
            onUpgrade={handleUpgrade}
          />
        ))}
      </div>
    </div>
  );
};
