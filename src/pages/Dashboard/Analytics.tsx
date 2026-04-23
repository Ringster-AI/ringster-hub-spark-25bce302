import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, Clock, ArrowRightLeft, TrendingUp, Calendar as CalendarIcon, CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";

interface DailyMetric {
  date: string;
  calls: number;
  minutes: number;
}

const STATUS_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--destructive))", "hsl(var(--muted-foreground))"];

const useAnalyticsData = () => {
  return useQuery({
    queryKey: ["analytics-overview"],
    queryFn: async () => {
      const since = subDays(startOfDay(new Date()), 30).toISOString();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get user's agents
      const { data: agents } = await supabase
        .from("agent_configs")
        .select("id, name")
        .eq("user_id", user.id);

      const agentIds = (agents || []).map((a) => a.id);
      const agentMap = (agents || []).reduce((acc, a) => {
        acc[a.id] = a.name;
        return acc;
      }, {} as Record<string, string>);

      if (agentIds.length === 0) {
        return {
          totalCalls: 0,
          totalMinutes: 0,
          totalTransfers: 0,
          completionRate: 0,
          dailyMetrics: [] as DailyMetric[],
          statusBreakdown: [] as { name: string; value: number }[],
          agentPerformance: [] as { name: string; calls: number; minutes: number }[],
          totalBookings: 0,
        };
      }

      const { data: calls } = await supabase
        .from("call_logs")
        .select("id, agent_id, duration, start_time, status, transfer_count")
        .in("agent_id", agentIds)
        .gte("start_time", since)
        .order("start_time", { ascending: true });

      const callsArr = calls || [];

      const totalCalls = callsArr.length;
      const totalDurationSec = callsArr.reduce((s, c) => s + (c.duration || 0), 0);
      const totalMinutes = Math.round(totalDurationSec / 60);
      const totalTransfers = callsArr.reduce((s, c) => s + (c.transfer_count || 0), 0);
      const completed = callsArr.filter((c) => c.status === "completed").length;
      const completionRate = totalCalls > 0 ? Math.round((completed / totalCalls) * 100) : 0;

      // Daily metrics
      const dailyMap: Record<string, { calls: number; durationSec: number }> = {};
      for (let i = 29; i >= 0; i--) {
        const day = format(subDays(new Date(), i), "yyyy-MM-dd");
        dailyMap[day] = { calls: 0, durationSec: 0 };
      }
      callsArr.forEach((c) => {
        if (!c.start_time) return;
        const day = format(new Date(c.start_time), "yyyy-MM-dd");
        if (dailyMap[day]) {
          dailyMap[day].calls += 1;
          dailyMap[day].durationSec += c.duration || 0;
        }
      });
      const dailyMetrics: DailyMetric[] = Object.entries(dailyMap).map(([date, v]) => ({
        date: format(new Date(date), "MMM d"),
        calls: v.calls,
        minutes: Math.round(v.durationSec / 60),
      }));

      // Status breakdown
      const statusMap: Record<string, number> = {};
      callsArr.forEach((c) => {
        const s = c.status || "unknown";
        statusMap[s] = (statusMap[s] || 0) + 1;
      });
      const statusBreakdown = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

      // Per-agent performance
      const agentStats: Record<string, { calls: number; durationSec: number }> = {};
      callsArr.forEach((c) => {
        if (!c.agent_id) return;
        if (!agentStats[c.agent_id]) agentStats[c.agent_id] = { calls: 0, durationSec: 0 };
        agentStats[c.agent_id].calls += 1;
        agentStats[c.agent_id].durationSec += c.duration || 0;
      });
      const agentPerformance = Object.entries(agentStats)
        .map(([id, v]) => ({
          name: agentMap[id] || "Unknown",
          calls: v.calls,
          minutes: Math.round(v.durationSec / 60),
        }))
        .sort((a, b) => b.calls - a.calls);

      // Calendar bookings count
      const { data: campaigns } = await supabase
        .from("campaigns")
        .select("id")
        .eq("user_id", user.id);
      const campaignIds = (campaigns || []).map((c) => c.id);

      let totalBookings = 0;
      if (campaignIds.length > 0) {
        const { count } = await supabase
          .from("calendar_bookings")
          .select("id", { count: "exact", head: true })
          .in("campaign_id", campaignIds)
          .gte("created_at", since);
        totalBookings = count || 0;
      }

      return {
        totalCalls,
        totalMinutes,
        totalTransfers,
        completionRate,
        dailyMetrics,
        statusBreakdown,
        agentPerformance,
        totalBookings,
      };
    },
  });
};

const KpiCard = ({
  label,
  value,
  icon: Icon,
  suffix,
}: {
  label: string;
  value: number | string;
  icon: typeof Phone;
  suffix?: string;
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold mt-2">
            {value}
            {suffix && <span className="text-base font-normal text-muted-foreground ml-1">{suffix}</span>}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const Analytics = () => {
  const { data, isLoading } = useAnalyticsData();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">Last 30 days of call activity</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Calls" value={data.totalCalls} icon={Phone} />
        <KpiCard label="Talk Time" value={data.totalMinutes} icon={Clock} suffix="min" />
        <KpiCard label="Transfers" value={data.totalTransfers} icon={ArrowRightLeft} />
        <KpiCard label="Bookings" value={data.totalBookings} icon={CalendarIcon} />
      </div>

      <Tabs defaultValue="volume" className="w-full">
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <TabsList className="w-max md:w-auto">
            <TabsTrigger value="volume">Call Volume</TabsTrigger>
            <TabsTrigger value="status">Outcomes</TabsTrigger>
            <TabsTrigger value="agents">By Agent</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="volume">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Daily call volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={data.dailyMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="calls" stroke="hsl(var(--primary))" strokeWidth={2} name="Calls" />
                  <Line type="monotone" dataKey="minutes" stroke="hsl(var(--accent))" strokeWidth={2} name="Minutes" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Completion rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-primary">{data.completionRate}%</div>
                <p className="text-sm text-muted-foreground mt-2">
                  {data.totalCalls} total calls in the last 30 days
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Call outcomes</CardTitle>
              </CardHeader>
              <CardContent>
                {data.statusBreakdown.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={data.statusBreakdown}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {data.statusBreakdown.map((_, idx) => (
                          <Cell key={idx} fill={STATUS_COLORS[idx % STATUS_COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents">
          <Card>
            <CardHeader>
              <CardTitle>Per-agent activity</CardTitle>
            </CardHeader>
            <CardContent>
              {data.agentPerformance.length === 0 ? (
                <p className="text-sm text-muted-foreground">No call data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={data.agentPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="calls" fill="hsl(var(--primary))" name="Calls" />
                    <Bar dataKey="minutes" fill="hsl(var(--accent))" name="Minutes" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
