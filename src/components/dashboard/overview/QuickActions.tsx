import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Phone, 
  Users, 
  Calendar,
  BarChart3,
  Settings
} from "lucide-react";

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export const QuickActions = () => {
  const navigate = useNavigate();

  const quickActions: QuickAction[] = [
    {
      title: "Create Agent",
      description: "Set up a new AI agent",
      icon: <Plus className="h-4 w-4" />,
      action: () => navigate("/dashboard/agents"),
      variant: "default"
    },
    {
      title: "New Campaign",
      description: "Launch a new campaign",
      icon: <Phone className="h-4 w-4" />,
      action: () => navigate("/dashboard/campaigns"),
      variant: "outline"
    },
    {
      title: "Manage Team",
      description: "Invite team members",
      icon: <Users className="h-4 w-4" />,
      action: () => navigate("/dashboard/team"),
      variant: "outline"
    },
    {
      title: "View Calendar",
      description: "Check scheduled calls",
      icon: <Calendar className="h-4 w-4" />,
      action: () => navigate("/dashboard/calendar"),
      variant: "outline"
    },
    {
      title: "Analytics",
      description: "View performance data",
      icon: <BarChart3 className="h-4 w-4" />,
      action: () => navigate("/dashboard/analytics"),
      variant: "outline"
    },
    {
      title: "Settings",
      description: "Configure preferences",
      icon: <Settings className="h-4 w-4" />,
      action: () => navigate("/dashboard/settings"),
      variant: "ghost"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              onClick={action.action}
              className="h-auto p-4 flex flex-col items-center space-y-2 text-center hover:scale-105 transition-transform"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                {action.icon}
              </div>
              <div>
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};