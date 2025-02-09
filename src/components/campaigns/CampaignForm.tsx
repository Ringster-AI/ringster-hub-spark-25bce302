
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ContactList } from "./ContactList";
import { AgentConfig } from "./AgentConfig";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Campaign } from "@/types/database/campaigns";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  scheduledStart: z.date().optional(),
  agent: z.object({
    name: z.string().min(1, "Agent name is required"),
    description: z.string().optional(),
    greeting: z.string().optional(),
    goodbye: z.string().optional(),
    voice_id: z.string().optional(),
  }),
});

type FormData = z.infer<typeof formSchema>;

interface CampaignFormProps {
  onSuccess: () => void;
  initialData?: Campaign & { agent: any };
}

export function CampaignForm({ onSuccess, initialData }: CampaignFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description || "",
      scheduledStart: initialData.scheduled_start ? new Date(initialData.scheduled_start) : undefined,
      agent: {
        name: initialData.agent?.name || "",
        description: initialData.agent?.description || "",
        greeting: initialData.agent?.greeting || "",
        goodbye: initialData.agent?.goodbye || "",
        voice_id: initialData.agent?.voice_id || "",
      }
    } : {
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

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Campaign Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scheduledStart"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-semibold mb-4">Agent Configuration</h3>
          <AgentConfig form={form} />
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-semibold mb-4">Contact List</h3>
          <ContactList campaignId={initialData?.id} />
        </div>

        <div className="sticky bottom-0 bg-background pt-4 border-t flex justify-end gap-4">
          <Button type="submit" disabled={mutation.isPending}>
            {initialData ? 'Update' : 'Create'} Campaign
          </Button>
        </div>
      </form>
    </Form>
  );
}
