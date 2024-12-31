import { Server } from "lucide-react";
import { CreateAgentDialog } from "./CreateAgentDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const EmptyAgentState = () => {
  const createButton = (
    <Button>
      <Plus className="mr-2" />
      Create Agent
    </Button>
  );

  return (
    <div className="flex flex-col items-center justify-center h-96 space-y-4 border-2 border-dashed rounded-lg p-8">
      <Server className="w-12 h-12 text-muted-foreground" />
      <div className="text-center">
        <h3 className="text-lg font-semibold">No agents yet</h3>
        <p className="text-muted-foreground">
          Create your first AI agent to get started
        </p>
      </div>
      <CreateAgentDialog trigger={createButton} />
    </div>
  );
};