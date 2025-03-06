
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface AgentUsageStatsProps {
  minutesUsed: number | null;
  totalMinutesUsed: number | null;
  minutesAllowance?: number | null;
}

export const AgentUsageStats = ({ 
  minutesUsed, 
  totalMinutesUsed, 
  minutesAllowance = 0 
}: AgentUsageStatsProps) => {
  const used = minutesUsed || 0;
  const allowance = minutesAllowance || 0;
  const percentage = allowance > 0 ? Math.min(100, Math.round((used / allowance) * 100)) : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          <p>Minutes used: {used}</p>
          <p>Total minutes: {totalMinutesUsed || 0}</p>
          {allowance > 0 && (
            <p className="text-xs mt-1">
              {used} of {allowance} minutes ({percentage}%)
            </p>
          )}
        </div>
        
        {allowance > 0 && (
          <div className="w-16 h-16">
            <CircularProgressbar
              value={percentage}
              text={`${percentage}%`}
              styles={buildStyles({
                textSize: '22px',
                pathColor: percentage > 90 ? '#ef4444' : percentage > 75 ? '#f59e0b' : '#9b87f5',
                textColor: '#64748b',
                trailColor: '#e2e8f0',
              })}
            />
          </div>
        )}
      </div>
    </div>
  );
};
