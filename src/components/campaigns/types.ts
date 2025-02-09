
import { Json } from "@/types/database/auth";

export interface Contact {
  id?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  metadata: Record<string, any>;
}

export interface ContactListProps {
  campaignId?: string;
}
