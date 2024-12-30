import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";

interface TransferDirectoryProps {
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  disabled?: boolean;
}

export const TransferDirectory = ({ value, onChange, disabled }: TransferDirectoryProps) => {
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");

  const handleAdd = () => {
    if (!newName || !newNumber || disabled) return;
    onChange({ ...value, [newName]: newNumber });
    setNewName("");
    setNewNumber("");
  };

  const handleRemove = (name: string) => {
    if (disabled) return;
    const newDirectory = { ...value };
    delete newDirectory[name];
    onChange(newDirectory);
  };

  return (
    <div className="space-y-4">
      <Label>Transfer Directory</Label>
      <div className="space-y-4">
        {Object.entries(value).map(([name, number]) => (
          <div key={name} className="flex items-center gap-2">
            <Input value={name} disabled />
            <Input value={number} disabled />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemove(name)}
              className="shrink-0"
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Name"
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
        <Button onClick={handleAdd} className="shrink-0" disabled={disabled}>
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>
    </div>
  );
};