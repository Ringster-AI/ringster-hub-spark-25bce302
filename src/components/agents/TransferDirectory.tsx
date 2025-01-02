import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";

interface TransferEntry {
  keywords: string[];
  number: string;
  transfer_message: string;
}

interface TransferDirectoryProps {
  value: Record<string, TransferEntry>;
  onChange: (value: Record<string, TransferEntry>) => void;
  disabled?: boolean;
}

export const TransferDirectory = ({ value, onChange, disabled }: TransferDirectoryProps) => {
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [newKeywords, setNewKeywords] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const handleAdd = () => {
    if (!newName || !newNumber || disabled) return;
    
    onChange({
      ...value,
      [newName]: {
        keywords: newKeywords.split(',').map(k => k.trim()).filter(k => k),
        number: newNumber,
        transfer_message: newMessage || `I'll transfer you to our ${newName} team.`
      }
    });
    
    // Reset form
    setNewName("");
    setNewNumber("");
    setNewKeywords("");
    setNewMessage("");
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

  const handleUpdateMessage = (name: string, message: string) => {
    if (disabled) return;
    onChange({
      ...value,
      [name]: {
        ...value[name],
        transfer_message: message
      }
    });
  };

  return (
    <div className="space-y-4">
      <Label>Transfer Directory</Label>
      <div className="space-y-6">
        {Object.entries(value).map(([name, entry]) => (
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
                value={entry.keywords.join(', ')}
                placeholder="Keywords (comma-separated)"
                onChange={(e) => handleUpdateKeywords(name, e.target.value)}
                disabled={disabled}
              />
              
              <Textarea
                value={entry.transfer_message}
                placeholder="Transfer Message"
                onChange={(e) => handleUpdateMessage(name, e.target.value)}
                disabled={disabled}
              />
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
          <Textarea
            placeholder="Transfer Message (optional)"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={disabled}
          />
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