import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow } from "date-fns";
import { 
  Phone, 
  Users, 
  Calendar,
  UserPlus,
  Settings,
  CreditCard,
  AlertCircle
} from "lucide-react";

interface Activity {
  id: string;
  type: 'call' | 'campaign' | 'booking' | 'agent' | 'subscription' | 'credit';
  title: string;
  description: string;
  timestamp: Date;
  status?: 'success' | 'pending' | 'failed' | 'warning';
}

const getActivityIcon = (type: Activity['type']) => {
  const iconMap = {
    call: <Phone className="h-4 w-4" />,
    campaign: <Users className="h-4 w-4" />,
    booking: <Calendar className="h-4 w-4" />,
    agent: <UserPlus className="h-4 w-4" />,
    subscription: <CreditCard className="h-4 w-4" />,
    credit: <CreditCard className="h-4 w-4" />
  };
  return iconMap[type];
};

const getStatusColor = (status?: Activity['status']) => {
  switch (status) {
    case 'success':
      return 'bg-dashboard-success/10 text-dashboard-success border-dashboard-success/20';
    case 'pending':
      return 'bg-dashboard-pending/10 text-dashboard-pending border-dashboard-pending/20';
    case 'failed':
      return 'bg-dashboard-failed/10 text-dashboard-failed border-dashboard-failed/20';
    case 'warning':
      return 'bg-warning/10 text-warning border-warning/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const ActivityTimeline = () => {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["recent-activities"],
    queryFn: async () => {
      const activities: Activity[] = [];
      
      // Fetch recent call logs
      const { data: callLogs } = await supabase
        .from("call_logs")
        .select("*, agent_configs(name)")
        .order("created_at", { ascending: false })
        .limit(5);

      if (callLogs) {
        callLogs.forEach(call => {
          activities.push({
            id: call.id,
            type: 'call',
            title: `Call ${call.status === 'completed' ? 'completed' : 'attempted'}`,
            description: `Agent: ${call.agent_configs?.name || 'Unknown'} • ${call.duration || 0}s`,
            timestamp: new Date(call.created_at),
            status: call.status === 'completed' ? 'success' : call.status === 'failed' ? 'failed' : 'pending'
          });
        });
      }

      // Fetch recent campaigns
      const { data: campaigns } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);

      if (campaigns) {
        campaigns.forEach(campaign => {
          activities.push({
            id: campaign.id,
            type: 'campaign',
            title: `Campaign ${campaign.status}`,
            description: campaign.name,
            timestamp: new Date(campaign.created_at),
            status: campaign.status === 'active' ? 'success' : campaign.status === 'paused' ? 'warning' : 'pending'
          });
        });
      }

      // Fetch recent bookings
      const { data: bookings } = await supabase
        .from("calendar_bookings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);

      if (bookings) {
        bookings.forEach(booking => {
          activities.push({
            id: booking.id,
            type: 'booking',
            title: 'New booking',
            description: `${booking.attendee_name} • ${format(new Date(booking.appointment_datetime), 'MMM d, HH:mm')}`,
            timestamp: new Date(booking.created_at),
            status: booking.booking_status === 'confirmed' ? 'success' : 'pending'
          });
        });
      }

      // Sort all activities by timestamp
      return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 8);
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-muted animate-pulse rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                  <div className="h-3 bg-muted animate-pulse rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No recent activity</p>
            <p className="text-sm text-muted-foreground mt-1">
              Activity will appear here once you start using Ringster
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground truncate">
                    {activity.title}
                  </p>
                  {activity.status && (
                    <Badge variant="outline" className={getStatusColor(activity.status)}>
                      {activity.status}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {activity.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};