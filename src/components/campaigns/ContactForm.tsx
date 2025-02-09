
import { Contact } from "./types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface ContactFormProps {
  contact: Partial<Contact>;
  onChange: (contact: Partial<Contact>) => void;
  onSubmit: () => void;
}

export function ContactForm({ contact, onChange, onSubmit }: ContactFormProps) {
  return (
    <div className="flex gap-2">
      <Input
        placeholder="First Name"
        value={contact.firstName || ""}
        onChange={(e) => onChange({ ...contact, firstName: e.target.value })}
      />
      <Input
        placeholder="Last Name"
        value={contact.lastName || ""}
        onChange={(e) => onChange({ ...contact, lastName: e.target.value })}
      />
      <Input
        placeholder="Phone Number"
        value={contact.phoneNumber || ""}
        onChange={(e) => onChange({ ...contact, phoneNumber: e.target.value })}
      />
      <Button
        onClick={onSubmit}
        disabled={!contact.firstName || !contact.lastName || !contact.phoneNumber}
      >
        <UserPlus className="h-4 w-4" />
      </Button>
    </div>
  );
}
