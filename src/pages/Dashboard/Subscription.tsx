import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useSubscriptionFeatures } from "@/hooks/useSubscriptionFeatures";
import { PricingPlans } from "@/components/subscription/PricingPlans";
import { SubscriptionBadge } from "@/components/subscription/SubscriptionBadge";
import { Bot, Users, Clock } from "lucide-react";

const SubscriptionPage = () => {
  const { features, subscription, isLoading } = useSubscriptionFeatures();

  if (isLoading) {
    return <div>Loading subscription details...</div>;
  }

  const calculateUsagePercentage = (used: number, total: number) => {
    return Math.min((used / total) * 100, 100);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription and usage
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Plan
            </CardTitle>
            <SubscriptionBadge />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscription?.plan.name || 'No Plan'}
            </div>
            <p className="text-xs text-muted-foreground">
              {features.willExpire 
                ? `Expires on ${features.expiresAt?.toLocaleDateString()}`
                : 'Active subscription'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {features.limits.maxAgents} agents
            </div>
            <Progress 
              value={calculateUsagePercentage(0, features.limits.maxAgents)} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              0 of {features.limits.maxAgents} agents used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Minutes Used</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {features.limits.minutesAllowance} minutes
            </div>
            <Progress 
              value={calculateUsagePercentage(
                features.limits.minutesAllowance - features.limits.remainingMinutes,
                features.limits.minutesAllowance
              )} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {features.limits.remainingMinutes} minutes remaining
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>
            Choose the plan that best fits your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PricingPlans />
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionPage;