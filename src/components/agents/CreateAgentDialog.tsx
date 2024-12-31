import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useSubscriptionFeatures } from "@/hooks/useSubscriptionFeatures";
import { DialogHeader } from "./DialogHeader";
import { AgentForm } from "./AgentForm";
import { useQuery } from "@tanstack/react-query";
import { SubscriptionGate } from "../subscription/SubscriptionGate";

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
  const { features } = useSubscriptionFeatures();
  const [isLoading, setIsLoading] = useState(false);

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
      setIsLoading(true);

      if (agentCount >= features.limits.maxAgents) {
        toast({
          title: "Agent limit reached",
          description: "Please upgrade your plan to create more agents.",
          variant: "destructive",
        });
        return;
      }

      // 1. Create the agent
      const { data: newAgent, error } = await supabase
        .from("agent_configs")
        .insert([{
          ...data,
          status: "draft",
          config: { voice_id: data.voice_id },
          transfer_directory: data.transfer_directory,
        }])
        .select()
        .single();

      if (error) throw error;

      // 2. Purchase and assign Twilio number
      try {
        const response = await fetch('/.netlify/functions/manage-twilio-number', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ agentId: newAgent.id })
        });

        if (!response.ok) {
          throw new Error('Failed to assign phone number');
        }

        const twilioData = await response.json();
        console.log('Twilio number assigned:', twilioData);
      } catch (twilioError: any) {
        console.error('Error assigning Twilio number:', twilioError);
        toast({
          title: "Warning",
          description: "Agent created but failed to assign phone number. Please try again later.",
          variant: "destructive",
        });
      }

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
    } finally {
      setIsLoading(false);
    }
  };

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