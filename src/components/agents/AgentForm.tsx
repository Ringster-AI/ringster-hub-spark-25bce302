import { UseFormReturn } from "react-hook-form";
import { Form, FormField } from "@/components/ui/form";
import { BasicAgentInfo } from "./BasicAgentInfo";
import { AgentMessages } from "./AgentMessages";
import { VoiceSelection } from "./VoiceSelection";
import { TransferDirectory } from "./TransferDirectory";
import { FormActions } from "./FormActions";
import { AgentFormData } from "./CreateAgentDialog";

interface AgentFormProps {
  form: UseFormReturn<AgentFormData>;
  onSubmit: (data: AgentFormData) => Promise<void>;
  onCancel: () => void;
  canCustomizeVoice: () => boolean;
}

export const AgentForm = ({ form, onSubmit, onCancel, canCustomizeVoice }: AgentFormProps) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <BasicAgentInfo form={form} />
        <AgentMessages form={form} />
        <FormField
          control={form.control}
          name="voice_id"
          render={({ field }) => (
            <VoiceSelection 
              value={field.value} 
              onChange={field.onChange}
              disabled={!canCustomizeVoice()}
              disabledMessage="Upgrade your plan to customize agent voices"
            />
          )}
        />
        <FormField
          control={form.control}
          name="transfer_directory"
          render={({ field }) => (
            <TransferDirectory value={field.value} onChange={field.onChange} />
          )}
        />
        <FormActions onCancel={onCancel} />
      </form>
    </Form>
  );
};