import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Clock } from "lucide-react";
import { TransferEntry } from "@/types/agents";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface TransferDirectoryProps {
  value: Record<string, TransferEntry>;
  onChange: (value: Record<string, TransferEntry>) => void;
  disabled?: boolean;
}

export const TransferDirectory = ({ value, onChange, disabled }: TransferDirectoryProps) => {
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [newKeywords, setNewKeywords] = useState("");
  const [newStartTime, setNewStartTime] = useState("09:00");
  const [newEndTime, setNewEndTime] = useState("17:00");

  const handleAdd = () => {
    if (!newName || !newNumber || disabled) return;
    
    onChange({
      ...value,
      [newName]: {
        keywords: newKeywords.split(',').map(k => k.trim()).filter(k => k),
        number: newNumber,
        transfer_message: "I'll transfer you right away",
        transfer_hours: {
          start: newStartTime,
          end: newEndTime
        }
      }
    });
    
    // Reset form
    setNewName("");
    setNewNumber("");
    setNewKeywords("");
    setNewStartTime("09:00");
    setNewEndTime("17:00");
  };

  const handleRemove = (name: string) => {
    if (disabled) return;
    const newDirectory = { ...value };
    delete newDirectory[name];
    onChange(newDirectory);
  };

  const handleUpdateKeywords = (name: string, keywords: string) => {
    if (disabled) return;
    onChange({
      ...value,
      [name]: {
        ...value[name],
        keywords: keywords.split(',').map(k => k.trim()).filter(k => k)
      }
    });
  };

  const handleUpdateHours = (name: string, start: string, end: string) => {
    if (disabled) return;
    onChange({
      ...value,
      [name]: {
        ...value[name],
        transfer_hours: { start, end }
      }
    });
  };

  return (
    <div className="space-y-4">
      <Label>Transfer Directory</Label>
      <div className="space-y-6">
        {Object.entries(value || {}).map(([name, entry]) => (
          <div key={name} className="space-y-2 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <Label>{name}</Label>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(name)}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <Input 
                value={entry.number} 
                placeholder="Phone Number"
                disabled={true}
              />
              
              <Input
                value={(entry.keywords || []).join(', ')}
                placeholder="Keywords (comma-separated)"
                onChange={(e) => handleUpdateKeywords(name, e.target.value)}
                disabled={disabled}
              />

              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full flex justify-between items-center">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Transfer Hours
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {entry.transfer_hours?.start || "09:00"} - {entry.transfer_hours?.end || "17:00"}
                    </span>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 pt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-sm">Start Time</Label>
                      <Input
                        type="time"
                        value={entry.transfer_hours?.start || "09:00"}
                        onChange={(e) => handleUpdateHours(
                          name,
                          e.target.value,
                          entry.transfer_hours?.end || "17:00"
                        )}
                        disabled={disabled}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">End Time</Label>
                      <Input
                        type="time"
                        value={entry.transfer_hours?.end || "17:00"}
                        onChange={(e) => handleUpdateHours(
                          name,
                          entry.transfer_hours?.start || "09:00",
                          e.target.value
                        )}
                        disabled={disabled}
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        ))}
      </div>
      
      <div className="space-y-2 p-4 border rounded-lg">
        <Label>Add New Department</Label>
        <div className="space-y-2">
          <Input
            placeholder="Department Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={disabled}
          />
          <Input
            placeholder="Phone Number"
            value={newNumber}
            onChange={(e) => setNewNumber(e.target.value)}
            disabled={disabled}
          />
          <Input
            placeholder="Keywords (comma-separated)"
            value={newKeywords}
            onChange={(e) => setNewKeywords(e.target.value)}
            disabled={disabled}
          />
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full flex justify-between items-center">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Transfer Hours
                </span>
                <span className="text-sm text-muted-foreground">
                  {newStartTime} - {newEndTime}
                </span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-sm">Start Time</Label>
                  <Input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    disabled={disabled}
                  />
                </div>
                <div>
                  <Label className="text-sm">End Time</Label>
                  <Input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    disabled={disabled}
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
          <Button 
            onClick={handleAdd} 
            className="w-full" 
            disabled={disabled || !newName || !newNumber}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        </div>
      </div>
    </div>
  );
};