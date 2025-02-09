
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ContactList } from "./ContactList";
import { Campaign } from "@/types/database/campaigns";

interface ContactsDialogProps {
  campaign: Campaign & { agent: any } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactsDialog({ campaign, open, onOpenChange }: ContactsDialogProps) {
  if (!campaign) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogTitle>Contacts - {campaign.name}</DialogTitle>
        <ContactList campaignId={campaign.id} />
      </DialogContent>
    </Dialog>
  );
}
