import { useQuery } from "@tanstack/react-query";
import { Plus, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { CreateAgentDialog } from "@/components/agents/CreateAgentDialog";

const Agents = () => {
  const { toast } = useToast();

  const { data: agents, isLoading } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_configs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error loading agents",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse">Loading agents...</div>
      </div>
    );
  }

  const createButton = (
    <Button>
      <Plus className="mr-2" />
      Create Agent
    </Button>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Agents</h1>
          <p className="text-muted-foreground">
            Manage your AI agents and their configurations
          </p>
        </div>
        <CreateAgentDialog trigger={createButton} />
      </div>

      {agents?.length === 0 ? (
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
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="border rounded-lg p-6 space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{agent.name}</h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    agent.status === "active"
                      ? "bg-green-100 text-green-700"
                      : agent.status === "draft"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {agent.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {agent.description || "No description provided"}
              </p>
              <div className="text-sm text-muted-foreground">
                <p>Minutes used: {agent.minutes_used || 0}</p>
                <p>Total minutes: {agent.total_minutes_used || 0}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Agents;