import { useQuery } from "@tanstack/react-query";
import { Plus, Server, Edit, CheckSquare, XSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreateAgentDialog } from "@/components/agents/CreateAgentDialog";
import { EditAgentDialog } from "@/components/agents/EditAgentDialog";

const Agents = () => {
  const { toast } = useToast();

  // First get the user's organization
  const { data: userOrg } = useQuery({
    queryKey: ["user-organization"],
    queryFn: async () => {
      const { data: teamMember, error } = await supabase
        .from("team_members")
        .select("organization_id")
        .single();
      
      if (error) throw error;
      return teamMember;
    },
  });

  // Then get agents for that organization
  const { data: agents, isLoading, refetch } = useQuery({
    queryKey: ["agents", userOrg?.organization_id],
    queryFn: async () => {
      if (!userOrg?.organization_id) return [];

      const { data, error } = await supabase
        .from("agent_configs")
        .select("*")
        .eq('organization_id', userOrg.organization_id)
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
    enabled: !!userOrg?.organization_id,
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
                <div className="flex items-center gap-2">
                  <EditAgentDialog agent={agent} onUpdate={refetch} />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleStatus(agent.id, agent.status)}
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