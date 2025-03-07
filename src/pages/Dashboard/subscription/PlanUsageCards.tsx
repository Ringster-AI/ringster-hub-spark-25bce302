
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { Clock, PhoneCall, Users } from "lucide-react";
import { SubscriptionFeatures } from "@/types/subscription/plans";
import { useIsMobile } from "@/hooks/use-mobile";

interface PlanUsageCardsProps {
  features: SubscriptionFeatures;
  billingData: any;
  usagePercentage: number;
}

export const PlanUsageCards = ({ features, billingData, usagePercentage }: PlanUsageCardsProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
      <Card>
        <CardHeader className="pb-2 px-4 sm:px-6">
          <CardTitle className="flex items-center text-sm sm:text-base md:text-lg font-medium gap-2">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-[#9b87f5]" />
            Minutes Used
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg sm:text-xl md:text-2xl font-bold">
                {features.limits.minutesAllowance - features.limits.remainingMinutes} / {features.limits.minutesAllowance}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">
                Minutes remaining: {features.limits.remainingMinutes}
              </p>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16">
              <CircularProgressbar
                value={usagePercentage}
                text={`${usagePercentage}%`}
                styles={buildStyles({
                  textSize: isMobile ? '24px' : '22px',
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
        <CardHeader className="pb-2 px-4 sm:px-6">
          <CardTitle className="flex items-center text-sm sm:text-base md:text-lg font-medium gap-2">
            <PhoneCall className="h-4 w-4 sm:h-5 sm:w-5 text-[#9b87f5]" />
            Agents Created
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <p className="text-lg sm:text-xl md:text-2xl font-bold">
            {billingData?.agents?.length || 0} / {features.limits.maxAgents}
          </p>
          <p className="text-xs md:text-sm text-muted-foreground">
            Maximum allowed agents
          </p>
        </CardContent>
      </Card>
      
      <Card className="sm:col-span-2 md:col-span-1">
        <CardHeader className="pb-2 px-4 sm:px-6">
          <CardTitle className="flex items-center text-sm sm:text-base md:text-lg font-medium gap-2">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-[#9b87f5]" />
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <p className="text-lg sm:text-xl md:text-2xl font-bold">
            {features.limits.maxTeamMembers}
          </p>
          <p className="text-xs md:text-sm text-muted-foreground">
            Maximum team size
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
