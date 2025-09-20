
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Users, Zap } from "lucide-react";
import { PricingPlan } from "./types";

interface PlanCardProps {
  plan: PricingPlan;
  billingInterval: 'month' | 'year';
  onUpgrade: (priceId: string) => void;
  isCurrentPlan?: boolean;
}

export const PlanCard = ({ plan, billingInterval, onUpgrade, isCurrentPlan }: PlanCardProps) => {
  const isPopular = plan.name === 'Professional';
  const features = Array.isArray(plan.features?.features) ? plan.features.features : [];

  const displayPrice = billingInterval === 'year' ? plan.price * 12 * 0.8 : plan.price;
  const monthlyPrice = billingInterval === 'year' ? displayPrice / 12 : displayPrice;

  return (
    <Card className={`relative ${isPopular ? 'ring-2 ring-primary shadow-lg' : ''}`}>
      {isPopular && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
          Most Popular
        </Badge>
      )}
      
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <div className="mt-4">
          <div className="text-3xl font-bold">
            ${Math.round(monthlyPrice)}
            <span className="text-lg font-normal text-muted-foreground">/mo</span>
          </div>
          {billingInterval === 'year' && (
            <div className="text-sm text-muted-foreground">
              ${Math.round(displayPrice)}/year (Save 20%)
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Credits */}
          <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
            <CreditCard className="h-5 w-5 text-primary" />
            <div>
              <div className="font-semibold">{plan.credits_allowance.toLocaleString()} Credits</div>
              <div className="text-sm text-muted-foreground">Monthly allowance</div>
            </div>
          </div>

          {/* Agents */}
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm">Up to {plan.max_agents} AI agent{plan.max_agents > 1 ? 's' : ''}</span>
          </div>

          {/* Team Members */}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm">Up to {plan.max_team_members} team member{plan.max_team_members > 1 ? 's' : ''}</span>
          </div>

          {/* Features */}
          <div className="space-y-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <Button
            className="w-full mt-6"
            variant={isCurrentPlan ? "outline" : isPopular ? "default" : "outline"}
            onClick={() => plan.stripe_price_id && onUpgrade(plan.stripe_price_id)}
            disabled={isCurrentPlan || !plan.stripe_price_id}
          >
            {isCurrentPlan ? 'Current Plan' : 'Upgrade to ' + plan.name}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
