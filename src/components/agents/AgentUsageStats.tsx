
interface AgentUsageStatsProps {
  minutesUsed: number | null;
  totalMinutesUsed: number | null;
}

export const AgentUsageStats = ({ minutesUsed, totalMinutesUsed }: AgentUsageStatsProps) => {
  return (
    <div className="text-sm text-muted-foreground">
      <p>Minutes used: {minutesUsed || 0}</p>
      <p>Total minutes: {totalMinutesUsed || 0}</p>
    </div>
  );
};
