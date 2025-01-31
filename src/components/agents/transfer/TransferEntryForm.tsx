import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { TransferHours } from "./TransferHours";
import { TransferEntryFormProps } from "./types";

export const TransferEntryForm = ({ value, onUpdate, onRemove, disabled }: TransferEntryFormProps) => {
  const handleUpdateKeywords = (keywords: string) => {
    onUpdate({
      ...value,
      keywords: keywords.split(',').map(k => k.trim()).filter(k => k)
    });
  };

  const handleUpdateHours = (start: string, end: string) => {
    onUpdate({
      ...value,
      transfer_hours: { start, end }
    });
  };

  return (
    <div className="space-y-2 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <Label>Department</Label>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-2">
        <Input 
          value={value.number} 
          placeholder="Phone Number"
          disabled={true}
        />
        
        <Input
          value={value.keywords.join(', ')}
          placeholder="Keywords (comma-separated)"
          onChange={(e) => handleUpdateKeywords(e.target.value)}
          disabled={disabled}
        />

        <TransferHours
          start={value.transfer_hours?.start || "09:00"}
          end={value.transfer_hours?.end || "17:00"}
          onChange={handleUpdateHours}
          disabled={disabled}
        />
      </div>
    </div>
  );
};