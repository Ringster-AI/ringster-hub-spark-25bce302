import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useSubscriptionFeatures } from "@/hooks/useSubscriptionFeatures";
import { DialogHeader } from "./DialogHeader";
import { AgentForm } from "./AgentForm";
import { SubscriptionGate } from "../subscription/SubscriptionGate";
import { useAgentCount } from "./hooks/useAgentCount";
import { useCreateAgent } from "./hooks/useCreateAgent";
import { useToast } from "@/hooks/use-toast";
import { AgentFormData } from "@/types/agents";

export const CreateAgentDialog = ({ trigger }: { trigger: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const { features } = useSubscriptionFeatures();
  const { toast } = useToast();

  const form = useForm<AgentFormData>({
    defaultValues: {
      voice_id: "9BWtsMINqrJLrRacOk9x", // Default to Aria
      transfer_directory: {},
    },
  });

  const { data: agentCount = 0 } = useAgentCount(open);
  const { createAgent, isLoading } = useCreateAgent(() => {
    setOpen(false);
    form.reset();
  });

  const onSubmit = async (data: AgentFormData) => {
    if (isLoading) return;
    try {
      await createAgent(data, features.limits.maxAgents, agentCount);
    } catch (error) {
      console.error("Error creating agent:", error);
      toast({
        title: "Error",
        description: "Failed to create agent. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (isLoading) return;
      setOpen(newOpen);
    }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <SubscriptionGate requirement={{ type: "agents", value: agentCount + 1 }}>
          <DialogHeader 
            features={features}
            currentAgentCount={agentCount} 
          />
          <AgentForm 
            form={form} 
            onSubmit={onSubmit} 
            onCancel={() => !isLoading && setOpen(false)}
            canCustomizeVoice={() => features.limits.canCustomizeVoices}
            disabled={agentCount >= features.limits.maxAgents || isLoading}
          />
        </SubscriptionGate>
      </DialogContent>
    </Dialog>
  );
};