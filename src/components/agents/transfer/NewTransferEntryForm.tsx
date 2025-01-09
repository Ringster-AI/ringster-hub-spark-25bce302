import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { TransferHours } from "./TransferHours";
import { NewTransferEntryFormProps } from "./types";

export const NewTransferEntryForm = ({ onAdd, disabled }: NewTransferEntryFormProps) => {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [keywords, setKeywords] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  const handleAdd = () => {
    if (!name || !number || disabled) return;
    
    onAdd({
      keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
      number: number,
      transfer_message: "I'll transfer you right away",
      transfer_hours: {
        start: startTime,
        end: endTime
      }
    });
    
    setName("");
    setNumber("");
    setKeywords("");
    setStartTime("09:00");
    setEndTime("17:00");
  };

  return (
    <div className="space-y-2 p-4 border rounded-lg">
      <Label>Add New Department</Label>
      <div className="space-y-2">
        <Input
          placeholder="Department Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={disabled}
        />
        <Input
          placeholder="Phone Number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          disabled={disabled}
        />
        <Input
          placeholder="Keywords (comma-separated)"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          disabled={disabled}
        />
        <TransferHours
          start={startTime}
          end={endTime}
          onChange={(start, end) => {
            setStartTime(start);
            setEndTime(end);
          }}
          disabled={disabled}
        />
        <Button 
          onClick={handleAdd} 
          className="w-full" 
          disabled={disabled || !name || !number}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Department
        </Button>
      </div>
    </div>
  );
};