import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useSubscriptionFeatures } from "@/hooks/useSubscriptionFeatures";
import { DialogHeader } from "./DialogHeader";
import { AgentForm } from "./AgentForm";
import { SubscriptionGate } from "../subscription/SubscriptionGate";
import { useOrganization } from "./hooks/useOrganization";
import { useAgentCount } from "./hooks/useAgentCount";
import { useCreateAgent } from "./hooks/useCreateAgent";
import { useToast } from "@/hooks/use-toast";

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
  const { features } = useSubscriptionFeatures();
  const { toast } = useToast();

  const form = useForm<AgentFormData>({
    defaultValues: {
      voice_id: "9BWtsMINqrJLrRacOk9x", // Default to Aria
      transfer_directory: {},
    },
  });

  const { data: userOrg, isError: isOrgError, error: orgError } = useOrganization(open);
  const { data: agentCount = 0 } = useAgentCount(userOrg?.organization_id, open);
  const { createAgent, isLoading } = useCreateAgent(() => {
    setOpen(false);
    form.reset();
  });

  const onSubmit = async (data: AgentFormData) => {
    if (!userOrg?.organization_id) {
      toast({
        title: "Error",
        description: "Organization data not available. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createAgent(data, userOrg.organization_id, features.limits.maxAgents, agentCount);
    } catch (error) {
      console.error("Error creating agent:", error);
      toast({
        title: "Error",
        description: "Failed to create agent. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle organization fetch error outside of render
  if (isOrgError && open) {
    setTimeout(() => {
      toast({
        title: "Error",
        description: orgError?.message || "Failed to load organization data. Please try logging out and back in.",
        variant: "destructive",
      });
    }, 0);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            onCancel={() => setOpen(false)}
            canCustomizeVoice={() => features.limits.canCustomizeVoices}
            disabled={agentCount >= features.limits.maxAgents || isLoading}
          />
        </SubscriptionGate>
      </DialogContent>
    </Dialog>
  );
};