
import { Edit, CheckSquare, XSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AgentHeaderProps {
  name: string;
  id: string;
  status: string;
  onEdit: () => void;
  onToggleStatus: (id: string, currentStatus: string) => Promise<void>;
}

export const AgentHeader = ({ name, id, status, onEdit, onToggleStatus }: AgentHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h3 className="font-semibold">{name}</h3>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          title="Edit agent"
        >
          <Edit className="h-5 w-5 text-gray-600" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggleStatus(id, status)}
          title={`Click to ${status === 'active' ? 'deactivate' : 'activate'}`}
        >
          {status === 'active' ? (
            <CheckSquare className="h-5 w-5 text-green-600" />
          ) : (
            <XSquare className="h-5 w-5 text-gray-400" />
          )}
        </Button>
      </div>
    </div>
  );
};
