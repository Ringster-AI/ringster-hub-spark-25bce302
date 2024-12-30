import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { VoiceSelection } from "./VoiceSelection";
import { TransferDirectory } from "./TransferDirectory";
import { BasicAgentInfo } from "./BasicAgentInfo";
import { AgentMessages } from "./AgentMessages";
import { useSubscription } from "@/hooks/useSubscription";

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
        <DialogHeader>
          <DialogTitle>Create New AI Agent</DialogTitle>
          {subscription && (
            <div className="text-sm text-muted-foreground">
              Agents allowed: {subscription.plan.max_agents} on your {subscription.plan.name} plan
            </div>
          )}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <BasicAgentInfo form={form} />
            <AgentMessages form={form} />
            <FormField
              control={form.control}
              name="voice_id"
              render={({ field }) => (
                <VoiceSelection 
                  value={field.value} 
                  onChange={field.onChange}
                  disabled={!canCustomizeVoice()}
                  disabledMessage="Upgrade your plan to customize agent voices"
                />
              )}
            />
            <FormField
              control={form.control}
              name="transfer_directory"
              render={({ field }) => (
                <TransferDirectory value={field.value} onChange={field.onChange} />
              )}
            />
            <div className="flex justify-end space-x-2 sticky bottom-0 bg-background py-4 border-t">
              <Button variant="outline" onClick={() => setOpen(false)} type="button">
                Cancel
              </Button>
              <Button type="submit">Create Agent</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};