import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Phone, 
  Calendar,
  BarChart3,
  Settings,
  Users,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  hasAgents: boolean;
}

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  isPrimary?: boolean;
}

const ActionCard = ({ title, description, icon, onClick, isPrimary }: ActionCardProps) => {
  if (isPrimary) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "w-full text-left p-6 rounded-2xl transition-all duration-200",
          "bg-gradient-to-br from-primary to-primary/80",
          "hover:shadow-xl hover:scale-[1.02] active:scale-[0.99]",
          "group"
        )}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="p-2.5 bg-white/20 rounded-xl w-fit">
              {icon}
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-primary-foreground">
                {title}
              </h3>
              <p className="text-sm text-primary-foreground/80">
                {description}
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-primary-foreground/60 group-hover:translate-x-1 transition-transform" />
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 w-full p-4 rounded-xl transition-all duration-200",
        "bg-card hover:bg-muted/50",
        "text-left group"
      )}
    >
      <div className="p-2 bg-muted rounded-lg text-muted-foreground group-hover:text-foreground transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
    </button>
  );
};

export const QuickActions = ({ hasAgents }: QuickActionsProps) => {
  const navigate = useNavigate();

  const secondaryActions = [
    {
      title: "New Campaign",
      description: "Launch an outbound campaign",
      icon: <Phone className="h-4 w-4" />,
      action: () => navigate("/dashboard/campaigns")
    },
    {
      title: "View Calendar",
      description: "Check scheduled appointments",
      icon: <Calendar className="h-4 w-4" />,
      action: () => navigate("/dashboard/calendar")
    },
    {
      title: "Analytics",
      description: "View performance insights",
      icon: <BarChart3 className="h-4 w-4" />,
      action: () => navigate("/dashboard/analytics")
    },
    {
      title: "Manage Team",
      description: "Invite team members",
      icon: <Users className="h-4 w-4" />,
      action: () => navigate("/dashboard/team")
    },
    {
      title: "Settings",
      description: "Configure preferences",
      icon: <Settings className="h-4 w-4" />,
      action: () => navigate("/dashboard/settings")
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
      
      <div className="space-y-3">
        {/* Primary Action */}
        {!hasAgents ? (
          <ActionCard
            title="Create Your First Agent"
            description="Takes about 2 minutes"
            icon={<Plus className="h-5 w-5 text-white" />}
            onClick={() => navigate("/dashboard/agents")}
            isPrimary
          />
        ) : (
          <ActionCard
            title="Create New Agent"
            description="Add another AI agent"
            icon={<Plus className="h-5 w-5 text-white" />}
            onClick={() => navigate("/dashboard/agents")}
            isPrimary
          />
        )}

        {/* Secondary Actions */}
        <div className="space-y-1">
          {secondaryActions.map((action, index) => (
            <ActionCard
              key={index}
              title={action.title}
              description={action.description}
              icon={action.icon}
              onClick={action.action}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
