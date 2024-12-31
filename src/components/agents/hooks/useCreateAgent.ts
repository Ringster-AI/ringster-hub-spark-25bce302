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

      console.log("Creating new agent in database...");
      const { data: newAgent, error } = await supabase
        .from("agent_configs")
        .insert([{
          ...data,
          status: "draft",
          config: { voice_id: data.voice_id },
          transfer_directory: data.transfer_directory,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      console.log("Agent created successfully:", newAgent);

      console.log("Requesting Twilio number assignment...");
      const response = await fetch('/.netlify/functions/manage-twilio-number', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agentId: newAgent.id })
      });

      console.log("Twilio number assignment response status:", response.status);
      const responseData = await response.json();
      console.log("Twilio number assignment response:", responseData);

      if (!response.ok) {
        console.error('Failed to assign phone number:', responseData);
        toast({
          title: "Warning",
          description: "Agent created but failed to assign phone number. Please try again later.",
          variant: "destructive",
        });
      } else {
        console.log('Twilio number assigned:', responseData);
        toast({
          title: "Agent created",
          description: "Your new AI agent has been created successfully.",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["agents-count"] });
      onSuccess();
    } catch (error: any) {
      console.error("Error in createAgent:", error);
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