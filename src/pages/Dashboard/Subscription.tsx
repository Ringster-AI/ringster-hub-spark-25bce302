
import { useSubscriptionFeatures } from "@/hooks/useSubscriptionFeatures";
import { SubscriptionBadge } from "@/components/subscription/SubscriptionBadge";
import { PricingPlans } from "@/components/subscription/PricingPlans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, PhoneCall } from "lucide-react";

const Subscription = () => {
  const { features, subscription } = useSubscriptionFeatures();

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 shrink-0">
        <div className="mb-6 flex items-center gap-4">
          <h1 className="text-3xl font-bold">Subscription</h1>
          <SubscriptionBadge />
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Current Plan Usage</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg font-medium gap-2">
                  <Clock className="h-5 w-5 text-[#9b87f5]" />
                  Minutes Used
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {features.limits.minutesAllowance - features.limits.remainingMinutes} / {features.limits.minutesAllowance}
                </p>
                <p className="text-sm text-muted-foreground">
                  Minutes remaining: {features.limits.remainingMinutes}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg font-medium gap-2">
                  <PhoneCall className="h-5 w-5 text-[#9b87f5]" />
                  Agents Created
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {features.limits.maxAgents}
                </p>
                <p className="text-sm text-muted-foreground">
                  Maximum allowed agents
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg font-medium gap-2">
                  <Users className="h-5 w-5 text-[#9b87f5]" />
                  Team Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {features.limits.maxTeamMembers}
                </p>
                <p className="text-sm text-muted-foreground">
                  Maximum team size
                </p>
              </CardContent>
            </Card>
          </div>
          
          {features.expiresAt && (
            <Card className="mt-4">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  Plan {features.willExpire ? "expires" : "expired"} on:{" "}
                  {new Date(features.expiresAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-6 pt-0">
          <h2 className="text-2xl font-bold mb-6">Available Plans</h2>
          <PricingPlans />
        </div>
      </div>
    </div>
  );
};

export default Subscription;
