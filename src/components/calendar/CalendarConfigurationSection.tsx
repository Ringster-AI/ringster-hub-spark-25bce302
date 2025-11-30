
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, Settings } from "lucide-react";
import { CalendarBookingConfig } from "@/components/agents/CalendarBookingConfig";
import { AgentFormData } from "@/types/agents";
import { UseFormReturn } from "react-hook-form";

interface CalendarConfigurationSectionProps {
  form: UseFormReturn<AgentFormData>;
  onSave: (data: AgentFormData) => void;
  isSaving: boolean;
}

export function CalendarConfigurationSection({ 
  form, 
  onSave, 
  isSaving 
}: CalendarConfigurationSectionProps) {
  const [showConfig, setShowConfig] = useState(false);

  const handleSave = () => {
    onSave(form.getValues());
    setShowConfig(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Calendar booking is enabled for this agent
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowConfig(!showConfig)}
        >
          <Settings className="h-4 w-4 mr-2" />
          Configure
        </Button>
      </div>

      {showConfig && (
        <div className="space-y-4 border-t pt-4">
          <CalendarBookingConfig form={form} />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfig(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
