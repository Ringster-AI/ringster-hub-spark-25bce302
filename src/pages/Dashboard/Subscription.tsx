
import { useSubscriptionFeatures } from "@/hooks/useSubscriptionFeatures";
import { SubscriptionBadge } from "@/components/subscription/SubscriptionBadge";
import { PricingPlans } from "@/components/subscription/PricingPlans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, PhoneCall, BarChart } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { billingService } from "@/services/billingService";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";

const Subscription = () => {
  const { features, subscription, isLoading } = useSubscriptionFeatures();
  const [billingData, setBillingData] = useState<any>(null);
  const [isLoadingBilling, setIsLoadingBilling] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        setIsLoadingBilling(true);
        const data = await billingService.getDetailedUsageData();
        setBillingData(data);
      } catch (error) {
        console.error("Error fetching billing data:", error);
        toast({
          title: "Error",
          description: "Failed to load billing data",
          variant: "destructive",
        });
      } finally {
        setIsLoadingBilling(false);
      }
    };

    fetchBillingData();
  }, [toast]);

  const remainingMinutes = features.limits.minutesAllowance - (features.limits.minutesAllowance - features.limits.remainingMinutes);
  const usagePercentage = features.limits.minutesAllowance > 0 ? 
    Math.round(((features.limits.minutesAllowance - features.limits.remainingMinutes) / features.limits.minutesAllowance) * 100) : 0;

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 md:p-6 shrink-0">
        <div className="mb-4 md:mb-6 flex items-center gap-2 md:gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">Subscription</h1>
          <SubscriptionBadge />
        </div>

        <div className="mb-6 md:mb-8">
          <h2 className="text-lg font-semibold mb-4">Current Plan Usage</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-base md:text-lg font-medium gap-2">
                  <Clock className="h-5 w-5 text-[#9b87f5]" />
                  Minutes Used
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl md:text-2xl font-bold">
                      {features.limits.minutesAllowance - features.limits.remainingMinutes} / {features.limits.minutesAllowance}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Minutes remaining: {features.limits.remainingMinutes}
                    </p>
                  </div>
                  <div className="w-14 h-14 md:w-16 md:h-16">
                    <CircularProgressbar
                      value={usagePercentage}
                      text={`${usagePercentage}%`}
                      styles={buildStyles({
                        textSize: '22px',
                        pathColor: usagePercentage > 90 ? '#ef4444' : usagePercentage > 75 ? '#f59e0b' : '#9b87f5',
                        textColor: '#64748b',
                        trailColor: '#e2e8f0',
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-base md:text-lg font-medium gap-2">
                  <PhoneCall className="h-5 w-5 text-[#9b87f5]" />
                  Agents Created
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl md:text-2xl font-bold">
                  {billingData?.agents?.length || 0} / {features.limits.maxAgents}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Maximum allowed agents
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-base md:text-lg font-medium gap-2">
                  <Users className="h-5 w-5 text-[#9b87f5]" />
                  Team Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl md:text-2xl font-bold">
                  {features.limits.maxTeamMembers}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Maximum team size
                </p>
              </CardContent>
            </Card>
          </div>
          
          {features.expiresAt && (
            <Card className="mt-4">
              <CardContent className="pt-6">
                <p className="text-xs md:text-sm text-muted-foreground">
                  Plan {features.willExpire ? "expires" : "expired"} on:{" "}
                  {new Date(features.expiresAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {billingData?.agents && billingData.agents.length > 0 && (
          <div className="mb-6 md:mb-8 overflow-x-auto">
            <h2 className="text-lg font-semibold mb-4">Agent Usage</h2>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-base md:text-lg font-medium gap-2">
                  <BarChart className="h-5 w-5 text-[#9b87f5]" />
                  Agent Minutes Used
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                {isMobile ? (
                  <div className="space-y-4">
                    {billingData.agents.map((agent: any) => (
                      <div key={agent.id} className="border rounded p-3">
                        <p className="font-medium">{agent.name}</p>
                        <div className="flex justify-between text-sm mt-1">
                          <span>Current: {agent.minutes_used || 0} min</span>
                          <span>All time: {agent.total_minutes_used || 0} min</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Agent</TableHead>
                        <TableHead>Current Period</TableHead>
                        <TableHead>All Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {billingData.agents.map((agent: any) => (
                        <TableRow key={agent.id}>
                          <TableCell>{agent.name}</TableCell>
                          <TableCell>{agent.minutes_used || 0} minutes</TableCell>
                          <TableCell>{agent.total_minutes_used || 0} minutes</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {billingData?.monthlySummary && (
          <div className="mb-6 md:mb-8">
            <h2 className="text-lg font-semibold mb-4">Monthly Summary</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-muted-foreground text-xs md:text-sm">Total Calls</p>
                    <p className="text-xl md:text-2xl font-bold">{billingData.monthlySummary.total_calls || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs md:text-sm">Total Minutes</p>
                    <p className="text-xl md:text-2xl font-bold">{billingData.monthlySummary.total_minutes || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs md:text-sm">Total Transfers</p>
                    <p className="text-xl md:text-2xl font-bold">{billingData.monthlySummary.total_transfers || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-6 pt-0">
          <PricingPlans />
        </div>
      </div>
    </div>
  );
};

export default Subscription;
