import { useState } from "react";
import { Bar, BarChart, Line, LineChart, Pie, PieChart } from "recharts";
import { Calendar, Download, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useSubscriptionFeatures } from "@/hooks/useSubscriptionFeatures";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const defaultUsageStats = {
  total_calls: 0,
  total_minutes: 0,
  total_transfers: 0
};

const Overview = () => {
  const { features } = useSubscriptionFeatures();
  
  // Get usage statistics
  const { data: usageStats } = useQuery({
    queryKey: ["usage-stats"],
    queryFn: async () => {
      const today = new Date();
      const { data, error } = await supabase
        .from("usage_summary")
        .select("*")
        .eq("year", today.getFullYear())
        .eq("month", today.getMonth() + 1)
        .maybeSingle();
      
      if (error) throw error;
      return data || defaultUsageStats;
    },
  });

  // Get recent call logs
  const { data: recentCalls = [] } = useQuery({
    queryKey: ["recent-calls"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("call_logs")
        .select(`
          *,
          agent:agent_id(name)
        `)
        .order("created_at", { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <div className="flex items-center gap-4">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" /> Last 7 days
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" /> Download Report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageStats?.total_calls || 0}</div>
            <p className="text-xs text-muted-foreground">Total calls this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Minutes</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageStats?.total_minutes || 0}</div>
            <p className="text-xs text-muted-foreground">Minutes used this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Minutes Available</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{features.limits.minutesAllowance}</div>
            <p className="text-xs text-muted-foreground">Monthly allowance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transfer Rate</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageStats?.total_transfers || 0}</div>
            <p className="text-xs text-muted-foreground">Total transfers this month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCalls?.map((call) => (
                  <TableRow key={call.id}>
                    <TableCell>{call.agent?.name || 'Unknown'}</TableCell>
                    <TableCell>{call.duration || 0}s</TableCell>
                    <TableCell>{call.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription & Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="usage">
              <TabsList>
                <TabsTrigger value="usage">Usage</TabsTrigger>
                <TabsTrigger value="subscription">Subscription</TabsTrigger>
              </TabsList>
              <TabsContent value="usage">
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Minutes Used:</span>
                    <span className="font-medium">
                      {usageStats?.total_minutes || 0} / {features.limits.minutesAllowance}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Calls:</span>
                    <span className="font-medium">{usageStats?.total_calls || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Transfers:</span>
                    <span className="font-medium">{usageStats?.total_transfers || 0}</span>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="subscription">
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-medium">
                      {features.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Plan Type:</span>
                    <span className="font-medium">
                      {features.isPaid ? "Paid" : "Free"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Minutes Allowance:</span>
                    <span className="font-medium">
                      {features.limits.minutesAllowance}
                    </span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Overview;
