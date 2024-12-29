import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { AgentFormData } from "./CreateAgentDialog";

interface AgentMessagesProps {
  form: UseFormReturn<AgentFormData>;
}

export const AgentMessages = ({ form }: AgentMessagesProps) => {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="greeting"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Greeting Message</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Hello! How can I assist you today?"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="goodbye"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Goodbye Message</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Thank you for chatting with me. Have a great day!"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};