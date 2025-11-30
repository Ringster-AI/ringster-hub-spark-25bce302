
import { Switch } from "@/components/ui/switch";
import { AgentFormData } from "@/types/agents";
import { UseFormReturn } from "react-hook-form";

interface CalendarBookingToggleProps {
  isEnabled: boolean;
  form: UseFormReturn<AgentFormData>;
  onToggle: (enabled: boolean, formData: AgentFormData) => void;
  isLoading: boolean;
}

export function CalendarBookingToggle({ 
  isEnabled, 
  form, 
  onToggle, 
  isLoading 
}: CalendarBookingToggleProps) {
  const handleToggle = (checked: boolean) => {
    form.setValue("calendar_booking.enabled", checked);
    onToggle(checked, form.getValues());
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h4 className="font-medium">Enable Calendar Booking</h4>
        <p className="text-sm text-muted-foreground">
          Allow this agent to book calendar appointments during calls
        </p>
      </div>
      <Switch
        checked={isEnabled}
        onCheckedChange={handleToggle}
        disabled={isLoading}
      />
    </div>
  );
}
