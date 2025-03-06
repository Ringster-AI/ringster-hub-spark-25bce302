
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreateAgentDialog } from "@/components/agents/CreateAgentDialog";
import { EmptyAgentState } from "@/components/agents/EmptyAgentState";
import { AgentCard } from "@/components/agents/AgentCard";
import { AgentConfig } from "@/types/database/agents";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Agents = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please log in to view your agents.",
          variant: "destructive",
        });
        navigate("/login");
      }
    };
    
    checkAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const { data: agents, isLoading, refetch } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase
        .from("agent_configs")
        .select("*")
        .eq('user_id', session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching agents:", error);
        toast({
          title: "Error loading agents",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data.map((agent) => ({
        ...agent,
        agent_type: agent.agent_type as 'inbound' | 'outbound'
      })) as AgentConfig[];
    },
    enabled: true // The query will automatically run when the component mounts
  });

  const toggleStatus = async (id: string, currentStatus: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('agent_configs')
      .update({ status: currentStatus === 'active' ? 'inactive' : 'active' })
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Status updated",
      description: `Agent is now ${currentStatus === 'active' ? 'inactive' : 'active'}`,
    });
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 md:h-96">
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
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">AI Agents</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage your AI agents and their configurations
          </p>
        </div>
        <CreateAgentDialog trigger={createButton} />
      </div>

      {!agents || agents.length === 0 ? (
        <EmptyAgentState />
      ) : (
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
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
