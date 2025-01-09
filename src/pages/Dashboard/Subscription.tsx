import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useSubscriptionFeatures } from "@/hooks/useSubscriptionFeatures";
import { PricingPlans } from "@/components/subscription/PricingPlans";
import { SubscriptionBadge } from "@/components/subscription/SubscriptionBadge";
import { Bot, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const SubscriptionPage = () => {
  const { features, subscription, isLoading } = useSubscriptionFeatures();

  const { data: agentCount = 0 } = useQuery({
    queryKey: ["agents-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("agent_configs")
        .select("*", { count: "exact", head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: minutesUsed = 0 } = useQuery({
    queryKey: ["minutes-used"],
    queryFn: async () => {
      // First get the user's agents
      const { data: userAgents, error: agentsError } = await supabase
        .from("agent_configs")
        .select("id");
      
      if (agentsError) throw agentsError;
      
      const agentIds = userAgents?.map(agent => agent.id) || [];
      
      // Then get call logs only for those agents
      const { data: calls, error: callsError } = await supabase
        .from("call_logs")
        .select("duration")
        .eq("status", "completed")
        .in("agent_id", agentIds);
      
      if (callsError) throw callsError;
      
      // Convert seconds to minutes and round up
      const totalMinutes = calls?.reduce((acc, call) => acc + (call.duration || 0), 0) || 0;
      return Math.ceil(totalMinutes / 60);
    },
  });

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
              value={calculateUsagePercentage(agentCount, features.limits.maxAgents)} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {agentCount} of {features.limits.maxAgents} agents used
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
              value={calculateUsagePercentage(minutesUsed, features.limits.minutesAllowance)} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {minutesUsed} of {features.limits.minutesAllowance} minutes used
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