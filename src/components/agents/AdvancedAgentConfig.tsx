import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { AgentFormData } from "@/types/agents";

const TRANSCRIBER_PROVIDERS = [
  { value: "deepgram", label: "Deepgram" },
  { value: "talkscriber", label: "Talkscriber" },
  { value: "gladia", label: "Gladia" },
  { value: "assembly-ai", label: "Assembly AI" }
];

const VOICE_PROVIDERS = [
  { value: "11labs", label: "Eleven Labs" },
  { value: "cartesia", label: "Cartesia" },
  { value: "rime-ai", label: "Rime AI" },
  { value: "playht", label: "Play HT" },
  { value: "lmnt", label: "LMNT" },
  { value: "deepbram", label: "Deepbram" },
  { value: "openai", label: "OpenAI" },
  { value: "azure", label: "Azure" },
  { value: "neets", label: "Neets" },
  { value: "tavus", label: "Tavus" },
  { value: "smallest-ai", label: "Smallest AI" }
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "nl", label: "Dutch" },
  { value: "pl", label: "Polish" },
  { value: "ru", label: "Russian" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "zh", label: "Chinese" }
];

const DEEPGRAM_MODELS = [
  { value: "nova-2", label: "Nova 2" },
  { value: "nova", label: "Nova" },
  { value: "enhanced", label: "Enhanced" },
  { value: "base", label: "Base" }
];

interface AdvancedAgentConfigProps {
  form: UseFormReturn<AgentFormData>;
  disabled?: boolean;
}

export const AdvancedAgentConfig = ({ form, disabled }: AdvancedAgentConfigProps) => {
  const advancedConfig = form.watch("advanced_config");
  const useCustomVoiceId = form.watch("advanced_config.voice.useCustomVoiceId");

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Transcriber Settings</h3>
        <FormField
          control={form.control}
          name="advanced_config.transcriber.provider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Provider</FormLabel>
              <Select
                disabled={disabled}
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TRANSCRIBER_PROVIDERS.map((provider) => (
                    <SelectItem key={provider.value} value={provider.value}>
                      {provider.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="advanced_config.transcriber.model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model</FormLabel>
              <Select
                disabled={disabled}
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DEEPGRAM_MODELS.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="advanced_config.transcriber.language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Language</FormLabel>
              <Select
                disabled={disabled}
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {LANGUAGES.map((language) => (
                    <SelectItem key={language.value} value={language.value}>
                      {language.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Voice Settings</h3>
        <FormField
          control={form.control}
          name="advanced_config.voice.provider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Voice Provider</FormLabel>
              <Select
                disabled={disabled}
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {VOICE_PROVIDERS.map((provider) => (
                    <SelectItem key={provider.value} value={provider.value}>
                      {provider.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="advanced_config.voice.useCustomVoiceId"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Custom Voice ID</FormLabel>
                <FormDescription>
                  Manually enter a voice ID from your provider
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {useCustomVoiceId && (
          <FormField
            control={form.control}
            name="advanced_config.voice.customVoiceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Voice ID</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter voice ID"
                    {...field}
                    disabled={disabled}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );
};