import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TransferHoursProps } from "./types";

export const TransferHours = ({ start, end, onChange, disabled }: TransferHoursProps) => {
  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full flex justify-between items-center">
          <span className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Transfer Hours
          </span>
          <span className="text-sm text-muted-foreground">
            {start} - {end}
          </span>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 pt-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-sm">Start Time</Label>
            <Input
              type="time"
              value={start}
              onChange={(e) => onChange(e.target.value, end)}
              disabled={disabled}
            />
          </div>
          <div>
            <Label className="text-sm">End Time</Label>
            <Input
              type="time"
              value={end}
              onChange={(e) => onChange(start, e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};