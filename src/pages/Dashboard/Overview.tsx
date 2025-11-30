
import { useCredits } from "@/hooks/useCredits";
import { useSubscriptionFeatures } from "@/hooks/useSubscriptionFeatures";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KPICard } from "@/components/dashboard/overview/KPICard";
import { QuickActions } from "@/components/dashboard/overview/QuickActions";
import { ActivityTimeline } from "@/components/dashboard/overview/ActivityTimeline";
import { UsageAlerts } from "@/components/dashboard/overview/UsageAlerts";
import { 
  Phone, 
  Users, 
  Calendar,
  CreditCard,
  TrendingUp,
  Clock
} from "lucide-react";

interface DashboardStats {
  totalCalls: number;
  activeAgents: number;
  scheduledBookings: number;
  callsToday: number;
  avgCallDuration: number;
  conversionRate: number;
}

const Overview = () => {
  const { creditStatus, isLoading: creditsLoading } = useCredits();
  const { features, isLoading: featuresLoading } = useSubscriptionFeatures();
  
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async (): Promise<DashboardStats> => {
      // Fetch call statistics
      const { data: callLogs, count: totalCalls } = await supabase
        .from("call_logs")
        .select("*", { count: "exact" });

      // Fetch today's calls
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: callsToday } = await supabase
        .from("call_logs")
        .select("*", { count: "exact" })
        .gte("created_at", today.toISOString());

      // Fetch active agents
      const { count: activeAgents } = await supabase
        .from("agent_configs")
        .select("*", { count: "exact" })
        .eq("status", "active");

      // Fetch scheduled bookings
      const { count: scheduledBookings } = await supabase
        .from("calendar_bookings")
        .select("*", { count: "exact" })
        .eq("booking_status", "confirmed")
        .gte("appointment_datetime", new Date().toISOString());

      // Calculate average call duration
      const avgCallDuration = callLogs && callLogs.length > 0
        ? Math.round(callLogs.reduce((sum, call) => sum + (call.duration || 0), 0) / callLogs.length)
        : 0;

      // Calculate conversion rate (completed calls / total calls)
      const completedCalls = callLogs?.filter(call => call.status === 'completed').length || 0;
      const conversionRate = totalCalls && totalCalls > 0 
        ? Math.round((completedCalls / totalCalls) * 100)
        : 0;

      return {
        totalCalls: totalCalls || 0,
        activeAgents: activeAgents || 0,
        scheduledBookings: scheduledBookings || 0,
        callsToday: callsToday || 0,
        avgCallDuration,
        conversionRate
      };
    },
    refetchInterval: 60000 // Refresh every minute
  });

  const isLoading = creditsLoading || featuresLoading || statsLoading;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your Ringster account.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KPICard
          title="Total Calls"
          value={stats?.totalCalls || 0}
          icon={<Phone className="h-6 w-6" />}
          loading={isLoading}
          change={{
            value: 12,
            type: 'increase',
            period: 'last week'
          }}
        />
        <KPICard
          title="Calls Today"
          value={stats?.callsToday || 0}
          icon={<TrendingUp className="h-6 w-6" />}
          loading={isLoading}
        />
        <KPICard
          title="Active Agents"
          value={stats?.activeAgents || 0}
          icon={<Users className="h-6 w-6" />}
          loading={isLoading}
        />
        <KPICard
          title="Scheduled Bookings"
          value={stats?.scheduledBookings || 0}
          icon={<Calendar className="h-6 w-6" />}
          loading={isLoading}
        />
        <KPICard
          title="Avg Call Duration"
          value={`${stats?.avgCallDuration || 0}s`}
          icon={<Clock className="h-6 w-6" />}
          loading={isLoading}
        />
        <KPICard
          title="Conversion Rate"
          value={`${stats?.conversionRate || 0}%`}
          icon={<TrendingUp className="h-6 w-6" />}
          loading={isLoading}
          change={{
            value: 5,
            type: 'increase',
            period: 'last month'
          }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Quick Actions & Alerts */}
        <div className="space-y-6">
          <QuickActions />
          <UsageAlerts />
        </div>

        {/* Right Column - Activity Timeline */}
        <div className="lg:col-span-2">
          <ActivityTimeline />
        </div>
      </div>
    </div>
  );
};

export default Overview;
