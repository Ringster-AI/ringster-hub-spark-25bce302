
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormData, formSchema } from "./FormSchema";
import { Campaign } from "@/types/database/campaigns";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseCampaignFormProps {
  initialData?: Campaign & { agent: any };
  onSuccess: () => void;
}

export function useCampaignForm({ initialData, onSuccess }: UseCampaignFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description || "",
          scheduledStart: initialData.scheduled_start
            ? new Date(initialData.scheduled_start)
            : undefined,
          agent: {
            name: initialData.agent?.name || "",
            description: initialData.agent?.description || "",
            greeting: initialData.agent?.greeting || "",
            goodbye: initialData.agent?.goodbye || "",
            voice_id: initialData.agent?.voice_id || "",
          },
        }
      : {
          name: "",
          description: "",
        },
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please log in to manage campaigns.",
          variant: "destructive",
        });
        navigate("/login");
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Not authenticated");
      }

      if (initialData) {
        // Update existing campaign and agent
        const { error: agentError } = await supabase
          .from("agent_configs")
          .update({
            name: data.agent.name,
            description: data.agent.description,
            greeting: data.agent.greeting,
            goodbye: data.agent.goodbye,
            voice_id: data.agent.voice_id,
          })
          .eq('id', initialData.agent_id);

        if (agentError) throw agentError;

        const { error: campaignError } = await supabase
          .from("campaigns")
          .update({
            name: data.name,
            description: data.description,
            scheduled_start: data.scheduledStart?.toISOString(),
          })
          .eq('id', initialData.id);

        if (campaignError) throw campaignError;
      } else {
        // Create new campaign and agent
        const { data: agent, error: agentError } = await supabase
          .from("agent_configs")
          .insert({
            name: data.agent.name,
            description: data.agent.description,
            greeting: data.agent.greeting,
            goodbye: data.agent.goodbye,
            voice_id: data.agent.voice_id,
            agent_type: "outbound",
            status: "draft",
            user_id: session.user.id,
          })
          .select()
          .single();

        if (agentError) throw agentError;

        const { error: campaignError } = await supabase
          .from("campaigns")
          .insert({
            name: data.name,
            description: data.description,
            scheduled_start: data.scheduledStart?.toISOString(),
            agent_id: agent.id,
            status: "draft",
            user_id: session.user.id,
          });

        if (campaignError) throw campaignError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: `Error ${initialData ? 'updating' : 'creating'} campaign`,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    form,
    mutation,
  };
}
