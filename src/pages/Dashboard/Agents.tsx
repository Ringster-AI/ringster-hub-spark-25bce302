
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreateAgentDialog } from "@/components/agents/CreateAgentDialog";
import { EmptyAgentState } from "@/components/agents/EmptyAgentState";
import { AgentCard } from "@/components/agents/AgentCard";
import { AgentConfig } from "@/types/database/agents";

const Agents = () => {
  const { toast } = useToast();

  const { data: agents, isLoading, refetch } = useQuery({
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

      // Explicitly cast the agent_type to ensure it matches the AgentConfig type
      return data.map((agent) => ({
        ...agent,
        agent_type: agent.agent_type as 'inbound' | 'outbound'
      })) as AgentConfig[];
    },
  });

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const { error } = await supabase
      .from('agent_configs')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Status updated",
      description: `Agent is now ${newStatus}`,
    });
    refetch();
  };

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

      {!agents || agents.length === 0 ? (
        <EmptyAgentState />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onToggleStatus={toggleStatus}
              onUpdate={refetch}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Agents;
