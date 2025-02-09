
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VoiceSelection } from "../agents/VoiceSelection";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AgentConfigProps {
  form: UseFormReturn<any>;
}

export function AgentConfig({ form }: AgentConfigProps) {
  const navigate = useNavigate();

  const { data: outboundAgents, isLoading } = useQuery({
    queryKey: ["outbound-agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_configs")
        .select("*")
        .eq("agent_type", "outbound");

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading agents...</div>;
  }

  if (!outboundAgents?.length) {
    return (
      <Alert>
        <AlertDescription className="flex items-center justify-between">
          <span>You need to create an outbound agent first.</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/dashboard/agents")}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Create Agent
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="agent_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Select Agent</FormLabel>
            <FormControl>
              <Select 
                value={field.value} 
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an outbound agent" />
                </SelectTrigger>
                <SelectContent>
                  {outboundAgents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {form.watch("agent_id") && (
        <>
          <FormField
            control={form.control}
            name="agent.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agent Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="agent.description"
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
            name="agent.greeting"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Greeting Message</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="agent.goodbye"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Goodbye Message</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="agent.voice_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Voice</FormLabel>
                <FormControl>
                  <VoiceSelection
                    value={field.value}
                    onChange={field.onChange}
                    disabled={false}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </div>
  );
}
