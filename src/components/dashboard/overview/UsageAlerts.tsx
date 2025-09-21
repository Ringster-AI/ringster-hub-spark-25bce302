import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCredits } from "@/hooks/useCredits";
import { useSubscriptionFeatures } from "@/hooks/useSubscriptionFeatures";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  AlertTriangle, 
  AlertCircle, 
  Info,
  CreditCard,
  Clock,
  TrendingUp
} from "lucide-react";

export const UsageAlerts = () => {
  const { creditStatus, isLoading: creditsLoading } = useCredits();
  const { features, subscription, isLoading: featuresLoading } = useSubscriptionFeatures();
  const navigate = useNavigate();

  // Query for current agent count
  const { data: currentAgents = 0 } = useQuery({
    queryKey: ["current-agents-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("agent_configs")
        .select("*", { count: "exact" });
      return count || 0;
    }
  });

  if (creditsLoading || featuresLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Usage & Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-16 bg-muted animate-pulse rounded"></div>
            <div className="h-16 bg-muted animate-pulse rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const alerts = [];

  // Credit-based alerts
  if (creditStatus) {
    const usagePercentage = creditStatus.totalCredits > 0 
      ? (creditStatus.usedCredits / creditStatus.totalCredits) * 100 
      : 0;

    if (creditStatus.remainingCredits <= 0) {
      alerts.push({
        type: 'error' as const,
        icon: <AlertCircle className="h-4 w-4" />,
        title: 'Credits Exhausted',
        description: 'You have no remaining credits. Upgrade your plan or purchase add-on credits to continue.',
        action: () => navigate('/dashboard/subscription'),
        actionLabel: 'Upgrade Plan'
      });
    } else if (usagePercentage >= 90) {
      alerts.push({
        type: 'warning' as const,
        icon: <AlertTriangle className="h-4 w-4" />,
        title: 'Low Credits Warning',
        description: `You've used ${usagePercentage.toFixed(0)}% of your credits. Consider upgrading to avoid service interruption.`,
        action: () => navigate('/dashboard/subscription'),
        actionLabel: 'Add Credits'
      });
    } else if (usagePercentage >= 75) {
      alerts.push({
        type: 'info' as const,
        icon: <Info className="h-4 w-4" />,
        title: 'Credit Usage Notice',
        description: `You've used ${usagePercentage.toFixed(0)}% of your credits this month.`,
        action: () => navigate('/dashboard/subscription'),
        actionLabel: 'View Details'
      });
    }
  }

  // Subscription-based alerts
  if (features && subscription) {
    // Trial expiration warning
    if (features.isTrialing && subscription.current_period_end) {
      const trialEndDate = new Date(subscription.current_period_end);
      const now = new Date();
      const daysLeft = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysLeft <= 0) {
        alerts.push({
          type: 'error' as const,
          icon: <Clock className="h-4 w-4" />,
          title: 'Trial Expired',
          description: 'Your free trial has ended. Subscribe to continue using Ringster.',
          action: () => navigate('/dashboard/subscription'),
          actionLabel: 'Subscribe Now'
        });
      } else if (daysLeft <= 3) {
        alerts.push({
          type: 'warning' as const,
          icon: <Clock className="h-4 w-4" />,
          title: 'Trial Ending Soon',
          description: `Your free trial ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`,
          action: () => navigate('/dashboard/subscription'),
          actionLabel: 'Choose Plan'
        });
      }
    }

    // Agent limit warning
    if (features.limits.maxAgents > 0 && currentAgents > 0) {
      const agentUsagePercentage = (currentAgents / features.limits.maxAgents) * 100;
      if (agentUsagePercentage >= 90) {
        alerts.push({
          type: 'info' as const,
          icon: <TrendingUp className="h-4 w-4" />,
          title: 'Agent Limit Approaching',
          description: `You're using ${currentAgents} of ${features.limits.maxAgents} available agents.`,
          action: () => navigate('/dashboard/subscription'),
          actionLabel: 'Upgrade Plan'
        });
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Usage & Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="h-6 w-6 text-success" />
            </div>
            <p className="text-sm font-medium text-foreground">All systems good!</p>
            <p className="text-xs text-muted-foreground mt-1">
              No alerts or warnings at this time.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <Alert key={index} className={
                alert.type === 'error' 
                  ? 'border-destructive/50 bg-destructive/5' 
                  : alert.type === 'warning'
                  ? 'border-warning/50 bg-warning/5'
                  : 'border-primary/50 bg-primary/5'
              }>
                <div className={
                  alert.type === 'error' 
                    ? 'text-destructive' 
                    : alert.type === 'warning'
                    ? 'text-warning'
                    : 'text-primary'
                }>
                  {alert.icon}
                </div>
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription className="mt-2">
                  {alert.description}
                  {alert.action && (
                    <Button
                      variant={alert.type === 'error' ? 'destructive' : 'default'}
                      size="sm"
                      onClick={alert.action}
                      className="ml-4"
                    >
                      {alert.actionLabel}
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            ))}

            {/* Credit usage progress */}
            {creditStatus && creditStatus.totalCredits > 0 && (
              <div className="mt-4 p-4 border rounded-lg bg-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Credit Usage</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {creditStatus.remainingCredits} / {creditStatus.totalCredits}
                  </span>
                </div>
                <Progress 
                  value={(creditStatus.usedCredits / creditStatus.totalCredits) * 100} 
                  className="w-full"
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};