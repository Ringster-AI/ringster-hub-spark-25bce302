import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Toggle } from "@/components/ui/toggle";
import { useState } from "react";

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  billing_interval: string | null;
  features: {
    features: string[];
    max_agents: number;
  };
  stripe_price_id: string | null;
  max_agents: number;
  max_team_members: number;
  minutes_allowance: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  prod_id?: string;
}

export const PricingPlans = () => {
  const { toast } = useToast();
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');

  const { data: plans, isLoading } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
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

  const filteredPlans = plans?.filter(
    (plan) => plan.billing_interval === billingInterval && plan.is_active
  );

  if (isLoading) {
    return <div className="text-center">Loading plans...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold">Choose Your Plan</h2>
        <p className="text-muted-foreground mt-2">
          Select the perfect plan for your needs
        </p>
        <div className="flex items-center justify-center mt-6 space-x-4">
          <Toggle
            pressed={billingInterval === 'month'}
            onPressedChange={() => setBillingInterval('month')}
            className="data-[state=on]:bg-primary"
          >
            Monthly
          </Toggle>
          <Toggle
            pressed={billingInterval === 'year'}
            onPressedChange={() => setBillingInterval('year')}
            className="data-[state=on]:bg-primary"
          >
            Yearly
            <span className="ml-2 text-xs text-green-500 font-medium">Save 20%</span>
          </Toggle>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans?.map((plan) => (
          <Card key={plan.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                ${plan.price.toFixed(2)}/{billingInterval}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2">
                {plan.features.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {plan.stripe_price_id ? (
                <Button
                  className="w-full"
                  onClick={() => handleUpgrade(plan.stripe_price_id!)}
                >
                  Upgrade to {plan.name}
                </Button>
              ) : (
                <Button className="w-full" disabled>
                  Current Plan
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};