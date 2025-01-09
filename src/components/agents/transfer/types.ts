import { TransferEntry } from "@/types/agents";

export interface TransferHoursProps {
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
  disabled?: boolean;
}

export interface TransferEntryFormProps {
  value: TransferEntry;
  onUpdate: (value: TransferEntry) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export interface NewTransferEntryFormProps {
  onAdd: (entry: TransferEntry) => void;
  disabled?: boolean;
}

export interface TransferDirectoryProps {
  value: Record<string, TransferEntry>;
  onChange: (value: Record<string, TransferEntry>) => void;
  disabled?: boolean;
}