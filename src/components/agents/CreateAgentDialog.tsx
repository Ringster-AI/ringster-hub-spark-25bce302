import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useSubscription } from "@/hooks/useSubscription";
import { DialogHeader } from "./DialogHeader";
import { AgentForm } from "./AgentForm";
import { useQuery } from "@tanstack/react-query";

export type AgentFormData = {
  name: string;
  description: string;
  greeting: string;
  goodbye: string;
  voice_id: string;
  transfer_directory: Record<string, string>;
};

export const CreateAgentDialog = ({ trigger }: { trigger: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { subscription, canCreateAgent, canCustomizeVoice } = useSubscription();

  // Get current agent count
  const { data: agentCount = 0 } = useQuery({
    queryKey: ["agents-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("agent_configs")
        .select("*", { count: "exact", head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });

  const form = useForm<AgentFormData>({
    defaultValues: {
      voice_id: "9BWtsMINqrJLrRacOk9x", // Default to Aria
      transfer_directory: {},
    },
  });

  const onSubmit = async (data: AgentFormData) => {
    try {
      const canCreate = await canCreateAgent();
      if (!canCreate) {
        toast({
          title: "Subscription limit reached",
          description: "Please upgrade your plan to create more agents.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("agent_configs")
        .insert([{
          ...data,
          status: "draft",
          config: { voice_id: data.voice_id },
          transfer_directory: data.transfer_directory,
        }]);

      if (error) throw error;

      toast({
        title: "Agent created",
        description: "Your new AI agent has been created successfully.",
      });

      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["agents-count"] });
      setOpen(false);
      form.reset();
    } catch (error: any) {
      toast({
        title: "Error creating agent",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader subscription={subscription} currentAgentCount={agentCount} />
        <AgentForm 
          form={form} 
          onSubmit={onSubmit} 
          onCancel={() => setOpen(false)}
          canCustomizeVoice={canCustomizeVoice}
          disabled={agentCount >= (subscription?.plan.max_agents || 0)}
        />
      </DialogContent>
    </Dialog>
  );
};