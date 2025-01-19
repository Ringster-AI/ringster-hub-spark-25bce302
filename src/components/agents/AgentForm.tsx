import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { BasicAgentInfo } from "./BasicAgentInfo";
import { AgentMessages } from "./AgentMessages";
import { VoiceSelection } from "./VoiceSelection";
import { TransferDirectory } from "./TransferDirectory";
import { FormActions } from "./FormActions";
import { AdvancedAgentConfig } from "./AdvancedAgentConfig";
import { AgentFormData } from "@/types/agents";

interface AgentFormProps {
  form: UseFormReturn<AgentFormData>;
  onSubmit: (data: AgentFormData) => Promise<void>;
  onCancel: () => void;
  canCustomizeVoice: () => boolean;
  disabled?: boolean;
}

export const AgentForm = ({ form, onSubmit, onCancel, canCustomizeVoice, disabled }: AgentFormProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <BasicAgentInfo form={form} disabled={disabled} />
        <AgentMessages form={form} disabled={disabled} />
        
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <h3 className="text-lg font-medium">Advanced Mode</h3>
            <p className="text-sm text-muted-foreground">
              Configure advanced settings for transcription and voice
            </p>
          </div>
          <Switch
            checked={showAdvanced}
            onCheckedChange={setShowAdvanced}
            disabled={disabled}
          />
        </div>

        {showAdvanced ? (
          <AdvancedAgentConfig form={form} disabled={disabled} />
        ) : (
          <VoiceSelection 
            value={form.watch("voice_id")} 
            onChange={(value) => form.setValue("voice_id", value)}
            disabled={!canCustomizeVoice() || disabled}
            disabledMessage={disabled ? "You've reached your agent limit" : "Upgrade your plan to customize agent voices"}
          />
        )}
        
        <TransferDirectory 
          value={form.watch("transfer_directory")} 
          onChange={(value) => form.setValue("transfer_directory", value)}
          disabled={disabled}
        />
        <FormActions onCancel={onCancel} disabled={disabled} />
      </form>
    </Form>
  );
};