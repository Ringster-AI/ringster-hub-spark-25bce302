import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSubscriptionFeatures } from "@/hooks/useSubscriptionFeatures";
import { DialogHeader } from "./DialogHeader";
import { AgentForm } from "./AgentForm";
import { useToast } from "@/hooks/use-toast";
import { AgentFormData, AgentConfigInsert } from "@/types/agents";
import { supabase } from "@/integrations/supabase/client";

interface EditAgentDialogProps {
  agent: any;
  trigger: React.ReactNode;
  onUpdate: () => void;
}

export const EditAgentDialog = ({ agent, trigger, onUpdate }: EditAgentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { features } = useSubscriptionFeatures();
  const { toast } = useToast();

  const form = useForm<AgentFormData>({
    defaultValues: {
      name: agent.name,
      description: agent.description,
      greeting: agent.greeting,
      goodbye: agent.goodbye,
      voice_id: agent.config?.voice_id || "9BWtsMINqrJLrRacOk9x",
      transfer_directory: agent.transfer_directory || {},
    },
  });

  const onSubmit = async (data: AgentFormData) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const updateData: Partial<AgentConfigInsert> = {
        name: data.name,
        description: data.description,
        greeting: data.greeting,
        goodbye: data.goodbye,
        config: { voice_id: data.voice_id },
        transfer_directory: data.transfer_directory as Json,
      };

      const { error } = await supabase
        .from('agent_configs')
        .update(updateData)
        .eq('id', agent.id);

      if (error) throw error;

      toast({
        title: "Agent updated",
        description: "Your AI agent has been updated successfully.",
      });

      onUpdate();
      setOpen(false);
    } catch (error: any) {
      console.error("Error updating agent:", error);
      toast({
        title: "Error updating agent",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (isLoading) return;
      setOpen(newOpen);
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader title="Edit Agent" description="Update your AI agent's configuration." />
        <AgentForm 
          form={form} 
          onSubmit={onSubmit} 
          onCancel={() => !isLoading && setOpen(false)}
          canCustomizeVoice={() => features.limits.canCustomizeVoices}
          disabled={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};