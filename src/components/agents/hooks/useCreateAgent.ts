
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AgentFormData } from "@/types/agents";

export const useCreateAgent = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: AgentFormData) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      // Prepare the agent config data with proper type casting
      const agentConfig = {
        name: formData.name,
        description: formData.description,
        greeting: formData.greeting,
        goodbye: formData.goodbye,
        voice_id: formData.voice_id,
        phone_number: formData.phone_number,
        transfer_directory: formData.transfer_directory as any, // Cast to Json
        agent_type: formData.agent_type || 'inbound',
        advanced_config: formData.advanced_config as any, // Cast to Json
        config: {
          ...formData.config,
          calendar_booking: formData.calendar_booking
        } as any, // Cast to Json
        user_id: session.user.id,
        status: 'inactive'
      };

      // Create the agent in the database
      const { data: agent, error } = await supabase
        .from("agent_configs")
        .insert(agentConfig)
        .select()
        .single();

      if (error) {
        console.error("Error creating agent:", error);
        throw error;
      }

      // If calendar booking is enabled, create calendar tools entry
      if (formData.calendar_booking?.enabled) {
        const calendarToolConfig = {
          agent_id: agent.id,
          tool_name: 'calendar_booking',
          is_enabled: true,
          configuration: {
            default_duration: formData.calendar_booking.default_duration || 30,
            buffer_time: formData.calendar_booking.buffer_time || 10,
            business_hours_start: formData.calendar_booking.business_hours_start || '09:00',
            business_hours_end: formData.calendar_booking.business_hours_end || '17:00',
            booking_lead_time_hours: formData.calendar_booking.booking_lead_time_hours || 2,
            require_phone_verification: formData.calendar_booking.require_phone_verification ?? true,
            allowed_days: formData.calendar_booking.allowed_days || [1, 2, 3, 4, 5]
          }
        };

        const { error: toolError } = await supabase
          .from("calendar_tools")
          .insert(calendarToolConfig);

        if (toolError) {
          console.error("Error creating calendar tool:", toolError);
          // Don't throw here as the agent was created successfully
        }
      }

      return agent;
    },
    onSuccess: () => {
      toast({
        title: "Agent created successfully",
        description: "Your AI agent has been created and is ready to configure.",
      });
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
    onError: (error: any) => {
      console.error("Error creating agent:", error);
      toast({
        title: "Failed to create agent",
        description: error.message || "An error occurred while creating the agent.",
        variant: "destructive",
      });
    },
  });
};
