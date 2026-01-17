import { Phone, PhoneOff, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardStats {
  totalCalls: number;
  callsThisWeek: number;
  activeAgents: number;
  missedCalls: number;
  afterHoursCalls: number;
  scheduledBookings: number;
}

interface PrimaryKPIsProps {
  stats?: DashboardStats;
  isLoading: boolean;
  hasAgents: boolean;
}

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  accentColor: "primary" | "success" | "muted";
  loading?: boolean;
}

const KPICard = ({ title, value, subtitle, icon, accentColor, loading }: KPICardProps) => {
  const accentStyles = {
    primary: "text-primary bg-primary/8",
    success: "text-success bg-success/8",
    muted: "text-muted-foreground bg-muted"
  };

  if (loading) {
    return (
      <div className="bg-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-muted animate-pulse rounded w-24" />
          <div className="h-10 w-10 bg-muted animate-pulse rounded-xl" />
        </div>
        <div className="space-y-2">
          <div className="h-10 bg-muted animate-pulse rounded w-20" />
          <div className="h-4 bg-muted animate-pulse rounded w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6 space-y-4 transition-all duration-200 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className={cn("p-2.5 rounded-xl", accentStyles[accentColor])}>
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-4xl font-semibold tracking-tight text-foreground">
          {value}
        </div>
        <p className="text-sm text-muted-foreground">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export const PrimaryKPIs = ({ stats, isLoading, hasAgents }: PrimaryKPIsProps) => {
  // Determine the calls handled subtitle
  const getCallsHandledSubtitle = () => {
    if (!hasAgents) {
      return "Your agent is ready to receive calls";
    }
    if (stats?.callsThisWeek === 0) {
      return "No calls yet. Share your Ringster number to start receiving calls.";
    }
    return "Last 7 days";
  };

  // Determine the missed calls value and subtitle
  const getMissedCallsInfo = () => {
    if (!hasAgents) {
      return { value: "—", subtitle: "Set up an agent to start tracking" };
    }
    if (stats?.missedCalls === 0 && stats?.afterHoursCalls === 0) {
      return { value: "0", subtitle: "0 missed calls this week" };
    }
    if (stats?.afterHoursCalls && stats.afterHoursCalls > 0) {
      return { 
        value: stats.afterHoursCalls.toString(), 
        subtitle: `${stats.afterHoursCalls} calls answered after hours` 
      };
    }
    return { 
      value: stats?.missedCalls?.toString() || "0", 
      subtitle: `${stats?.missedCalls || 0} missed calls this week` 
    };
  };

  // Determine agent status subtitle
  const getAgentStatusSubtitle = () => {
    if (!hasAgents) {
      return "Create your first agent to get started";
    }
    if (stats?.activeAgents === 0) {
      return "No active agents. Activate an agent to start.";
    }
    return "Standing by 24/7";
  };

  const missedInfo = getMissedCallsInfo();

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <KPICard
        title="Calls Handled"
        value={hasAgents ? (stats?.callsThisWeek || 0) : "—"}
        subtitle={getCallsHandledSubtitle()}
        icon={<Phone className="h-5 w-5" />}
        accentColor="primary"
        loading={isLoading}
      />
      
      <KPICard
        title="Calls Saved"
        value={missedInfo.value}
        subtitle={missedInfo.subtitle}
        icon={<PhoneOff className="h-5 w-5" />}
        accentColor={hasAgents && stats?.missedCalls === 0 ? "success" : "muted"}
        loading={isLoading}
      />
      
      <KPICard
        title="Agent Status"
        value={hasAgents ? `${stats?.activeAgents || 0} active` : "—"}
        subtitle={getAgentStatusSubtitle()}
        icon={
          <div className="relative">
            <Bot className="h-5 w-5" />
            {hasAgents && (stats?.activeAgents || 0) > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-success rounded-full animate-pulse" />
            )}
          </div>
        }
        accentColor={hasAgents && (stats?.activeAgents || 0) > 0 ? "success" : "muted"}
        loading={isLoading}
      />
    </div>
  );
};
