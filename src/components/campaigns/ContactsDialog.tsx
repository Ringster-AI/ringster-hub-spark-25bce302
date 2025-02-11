
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ContactList } from "./ContactList";
import { Campaign } from "@/types/database/campaigns";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useContacts } from "./hooks/useContacts";
import Papa from "papaparse";

interface ContactsDialogProps {
  campaign: Campaign & { agent: any } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactsDialog({ campaign, open, onOpenChange }: ContactsDialogProps) {
  const { contacts } = useContacts(campaign?.id);

  const handleExport = () => {
    if (!contacts || contacts.length === 0) return;

    // Get all unique metadata keys
    const metadataKeys = Array.from(
      new Set(contacts.flatMap((contact) => Object.keys(contact.metadata || {})))
    ).sort();

    // Transform contacts into CSV format
    const csvData = contacts.map((contact) => ({
      firstName: contact.firstName,
      lastName: contact.lastName,
      phoneNumber: contact.phoneNumber,
      ...metadataKeys.reduce((acc, key) => ({
        ...acc,
        [key]: contact.metadata[key] || ''
      }), {})
    }));

    // Generate CSV
    const csv = Papa.unparse(csvData);
    
    // Create and trigger download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${campaign?.name || 'campaign'}-contacts.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!campaign) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Contacts - {campaign.name}</DialogTitle>
          {contacts && contacts.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={handleExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
        </DialogHeader>
        <ContactList campaignId={campaign.id} />
      </DialogContent>
    </Dialog>
  );
}
