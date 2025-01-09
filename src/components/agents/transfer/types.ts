import { TransferEntry } from "@/types/agents";

export interface TransferHoursProps {
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
  disabled?: boolean;
}

export interface TransferEntryFormProps {
  name: string; // Added name prop
  value: TransferEntry;
  onUpdate: (updatedEntry: TransferEntry) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export interface NewTransferEntryFormProps {
  onAdd: (name: string, entry: TransferEntry) => void; // Updated signature
  disabled?: boolean;
}

export interface TransferDirectoryProps {
  value: Record<string, TransferEntry>;
  onChange: (value: Record<string, TransferEntry>) => void;
  disabled?: boolean;
}