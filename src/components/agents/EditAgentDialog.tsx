import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Edit } from "lucide-react";
import { VoiceSelection } from "./VoiceSelection";
import { TransferDirectory } from "./TransferDirectory";
import { BasicAgentInfo } from "./BasicAgentInfo";
import { AgentMessages } from "./AgentMessages";
import { AgentFormData } from "@/types/agents";

interface EditAgentDialogProps {
  agent: any;
  onUpdate: () => void;
}

export const EditAgentDialog = ({ agent, onUpdate }: EditAgentDialogProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<AgentFormData>({
    defaultValues: {
      name: agent.name,
      description: agent.description,
      greeting: agent.greeting,
      goodbye: agent.goodbye,
      voice_id: agent.voice_id || "9BWtsMINqrJLrRacOk9x",
      transfer_directory: agent.transfer_directory || {},
    },
  });

  const onSubmit = async (data: AgentFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from("agent_configs")
        .update({
          ...data,
          config: { voice_id: data.voice_id },
          transfer_directory: data.transfer_directory,
          user_id: user.id
        })
        .eq('id', agent.id);

      if (error) throw error;

      toast({
        title: "Agent updated",
        description: "Your AI agent has been updated successfully.",
      });

      onUpdate();
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Error updating agent",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Edit agent">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit AI Agent</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <BasicAgentInfo form={form} />
            <AgentMessages form={form} />
            <VoiceSelection value={form.watch("voice_id")} onChange={(value) => form.setValue("voice_id", value)} />
            <TransferDirectory value={form.watch("transfer_directory")} onChange={(value) => form.setValue("transfer_directory", value)} />
            <div className="flex justify-end space-x-2 sticky bottom-0 bg-background py-4 border-t">
              <Button variant="outline" onClick={() => setOpen(false)} type="button">
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};