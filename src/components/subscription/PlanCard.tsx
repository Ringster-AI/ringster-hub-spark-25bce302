
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlanFeature } from "./PlanFeature";
import { PricingPlan } from "./types";

interface PlanCardProps {
  plan: PricingPlan;
  billingInterval: 'month' | 'year';
  onUpgrade: (priceId: string) => void;
}

export const PlanCard = ({ plan, billingInterval, onUpgrade }: PlanCardProps) => {
  return (
    <Card key={plan.id} className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{plan.name}</CardTitle>
            {plan.is_pay_as_you_go ? (
              <CardDescription className="mt-2">
                ${plan.number_rental_fee?.toFixed(2)}/month per phone number
                <br />
                ${plan.per_minute_rate?.toFixed(2)}/minute
              </CardDescription>
            ) : (
              <CardDescription>
                ${plan.price.toFixed(2)}/{billingInterval}
              </CardDescription>
            )}
          </div>
          {plan.is_pay_as_you_go && (
            <Badge className="bg-blue-500 hover:bg-blue-600" variant="secondary">
              Pay As You Go
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-2">
          {plan.features.features.map((feature, i) => (
            <PlanFeature key={i} feature={feature} />
          ))}
          {plan.is_pay_as_you_go && (
            <>
              <PlanFeature feature="No monthly commitment" />
              <PlanFeature feature="Only pay for what you use" />
            </>
          )}
        </ul>
      </CardContent>
      <CardFooter>
        {plan.stripe_price_id ? (
          <Button
            className="w-full"
            onClick={() => onUpgrade(plan.stripe_price_id!)}
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
  );
};
