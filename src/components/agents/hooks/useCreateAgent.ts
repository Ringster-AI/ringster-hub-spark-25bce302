import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AgentFormData } from "../CreateAgentDialog";

export const useCreateAgent = (onSuccess: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createAgent = async (data: AgentFormData, maxAgents: number, currentCount: number) => {
    try {
      setIsLoading(true);

      if (currentCount >= maxAgents) {
        toast({
          title: "Agent limit reached",
          description: "Please upgrade your plan to create more agents.",
          variant: "destructive",
        });
        return;
      }

      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data: newAgent, error } = await supabase
        .from("agent_configs")
        .insert([{
          ...data,
          status: "draft",
          config: { voice_id: data.voice_id },
          transfer_directory: data.transfer_directory,
          user_id: user.id // Set the user_id here
        }])
        .select()
        .single();

      if (error) throw error;

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
      onSuccess();
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

  return { createAgent, isLoading };
};