import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period: string;
  };
  icon: ReactNode;
  loading?: boolean;
  className?: string;
}

export const KPICard = ({ 
  title, 
  value, 
  change, 
  icon, 
  loading, 
  className 
}: KPICardProps) => {
  const getChangeColor = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase':
        return 'text-success';
      case 'decrease':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getChangeIcon = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase':
        return '↗';
      case 'decrease':
        return '↘';
      default:
        return '→';
    }
  };

  if (loading) {
    return (
      <Card className={cn("hover:shadow-card-hover transition-all duration-200", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded w-24"></div>
              <div className="h-8 bg-muted animate-pulse rounded w-16"></div>
              <div className="h-3 bg-muted animate-pulse rounded w-20"></div>
            </div>
            <div className="h-12 w-12 bg-muted animate-pulse rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "hover:shadow-card-hover transition-all duration-200 border-l-4 border-l-primary/20",
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="text-3xl font-bold text-foreground">{value}</div>
            {change && (
              <div className={cn("flex items-center text-sm", getChangeColor(change.type))}>
                <span className="mr-1">{getChangeIcon(change.type)}</span>
                <span>{Math.abs(change.value)}% vs {change.period}</span>
              </div>
            )}
          </div>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};