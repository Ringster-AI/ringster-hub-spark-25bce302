import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AgentFormData } from "@/types/agents";
import { Json } from "@/types/database/auth";

export const useCreateAgent = (onSuccess: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createAgent = async (data: AgentFormData, maxAgents: number, currentCount: number) => {
    if (isLoading) {
      console.log('Creation already in progress, skipping');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Starting agent creation process');

      if (currentCount >= maxAgents) {
        toast({
          title: "Agent limit reached",
          description: "Please upgrade your plan to create more agents.",
          variant: "destructive",
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      console.log("Creating new agent in database...");
      const insertData = {
        name: data.name,
        description: data.description,
        greeting: data.greeting,
        goodbye: data.goodbye,
        status: "draft",
        config: { voice_id: data.voice_id } as Json,
        transfer_directory: data.transfer_directory as unknown as Json,
        user_id: user.id
      };

      const { data: newAgent, error } = await supabase
        .from("agent_configs")
        .insert(insertData)
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

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Failed to assign phone number. Response:', errorData);
        throw new Error(`Failed to assign phone number: ${errorData}`);
      }

      const responseData = await response.json();
      console.log("Twilio number assignment response:", responseData);

      toast({
        title: "Agent created",
        description: "Your new AI agent has been created successfully.",
      });

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

      if (error.message.includes('Failed to assign phone number')) {
        console.log('Cleaning up failed agent...');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { createAgent, isLoading };
};