import { CheckSquare, XSquare, Phone, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditAgentDialog } from "./EditAgentDialog";
import { AgentConfig } from "@/types/database";

interface AgentCardProps {
  agent: AgentConfig;
  onToggleStatus: (id: string, currentStatus: string) => Promise<void>;
  onUpdate: () => void;
}

export const AgentCard = ({ agent, onToggleStatus, onUpdate }: AgentCardProps) => {
  return (
    <div className="border rounded-lg p-6 space-y-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{agent.name}</h3>
        <div className="flex items-center gap-2">
          <EditAgentDialog agent={agent} onUpdate={onUpdate} />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleStatus(agent.id, agent.status)}
            title={`Click to ${agent.status === 'active' ? 'deactivate' : 'activate'}`}
          >
            {agent.status === 'active' ? (
              <CheckSquare className="h-5 w-5 text-green-600" />
            ) : (
              <XSquare className="h-5 w-5 text-gray-400" />
            )}
          </Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2">
        {agent.description || "No description provided"}
      </p>
      {agent.phone_number && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-4 w-4" />
          <span>{agent.phone_number}</span>
        </div>
      )}
      <div className="text-sm text-muted-foreground">
        <p>Minutes used: {agent.minutes_used || 0}</p>
        <p>Total minutes: {agent.total_minutes_used || 0}</p>
      </div>
    </div>
  );
};