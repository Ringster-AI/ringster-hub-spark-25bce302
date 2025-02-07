
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

interface AgentConfigProps {
  form: UseFormReturn<any>;
}

export function AgentConfig({ form }: AgentConfigProps) {
  return (
    <div className="space-y-4">
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
    </div>
  );
}
