import { Label } from "@/components/ui/label";
import { TransferEntry } from "@/types/agents";
import { TransferEntryForm } from "./transfer/TransferEntryForm";
import { NewTransferEntryForm } from "./transfer/NewTransferEntryForm";
import { TransferDirectoryProps } from "./transfer/types";

export const TransferDirectory = ({ value, onChange, disabled }: TransferDirectoryProps) => {
  const handleAdd = (name: string, entry: TransferEntry) => {
    onChange({
      ...value,
      [name]: entry
    });
  };

  const handleUpdate = (name: string, entry: TransferEntry) => {
    onChange({
      ...value,
      [name]: entry
    });
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
      <div className="space-y-6">
        {Object.entries(value || {}).map(([name, entry]) => (
          <TransferEntryForm
            key={name}
            name={name}
            value={entry}
            onUpdate={(updatedEntry) => handleUpdate(name, updatedEntry)}
            onRemove={() => handleRemove(name)}
            disabled={disabled}
          />
        ))}
      </div>
      
      <NewTransferEntryForm
        onAdd={handleAdd}
        disabled={disabled}
      />
    </div>
  );
};