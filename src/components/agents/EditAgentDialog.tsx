import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useSubscriptionFeatures } from "@/hooks/useSubscriptionFeatures";
import { DialogHeader } from "./DialogHeader";
import { AgentForm } from "./AgentForm";
import { useToast } from "@/hooks/use-toast";
import { AgentFormData } from "@/types/agents";
import { supabase } from "@/integrations/supabase/client";
import { AgentConfig } from "@/types/database/agents";
import { Json } from "@/types/database/auth";

interface EditAgentDialogProps {
  agent: AgentConfig;
  onUpdate: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditAgentDialog = ({ agent, onUpdate, open, onOpenChange }: EditAgentDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { features } = useSubscriptionFeatures();
  const { toast } = useToast();

  const form = useForm<AgentFormData>({
    defaultValues: {
      name: agent.name,
      description: agent.description || "",
      greeting: agent.greeting || "",
      goodbye: agent.goodbye || "",
      voice_id: ((agent.config as any)?.voice_id as string) || "9BWtsMINqrJLrRacOk9x",
      transfer_directory: (agent.transfer_directory as Record<string, { keywords: string[]; number: string; transfer_message: string }>) || {},
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

      const { error } = await supabase
        .from('agent_configs')
        .update({
          name: data.name,
          description: data.description,
          greeting: data.greeting,
          goodbye: data.goodbye,
          config: { voice_id: data.voice_id } as unknown as Json,
          transfer_directory: data.transfer_directory as unknown as Json,
        })
        .eq('id', agent.id);

      if (error) throw error;

      toast({
        title: "Agent updated",
        description: "Your AI agent has been updated successfully.",
      });

      onUpdate();
      onOpenChange(false);
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
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">Edit AI Agent</DialogTitle>
        <DialogHeader 
          features={features} 
          currentAgentCount={0}
        />
        <AgentForm 
          form={form} 
          onSubmit={onSubmit} 
          onCancel={() => !isLoading && onOpenChange(false)}
          canCustomizeVoice={() => features.limits.canCustomizeVoices}
          disabled={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};