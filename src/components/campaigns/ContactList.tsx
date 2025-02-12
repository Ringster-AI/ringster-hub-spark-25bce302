
import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload, UserPlus } from "lucide-react";
import Papa from "papaparse";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Contact, ContactListProps } from "./types";
import { useContacts } from "./hooks/useContacts";
import { ContactForm } from "./ContactForm";
import { ContactsTable } from "./ContactsTable";

export function ContactList({ campaignId }: ContactListProps) {
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [newContact, setNewContact] = useState<Partial<Contact>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { contacts, isLoading, addContact, updateContact, deleteContact } = useContacts(campaignId);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !campaignId) return;

      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          const contacts = results.data
            .filter((row: any) => row.firstName && row.lastName && row.phoneNumber)
            .map((row: any) => {
              // Extract the required fields
              const { firstName, lastName, phoneNumber, ...rest } = row;

              // All other columns become customer data that will be passed to the assistant
              const metadata = Object.entries(rest).reduce((acc, [key, value]) => {
                if (value) { // Only include non-empty values
                  acc[key] = value; // Keep original case for the keys
                }
                return acc;
              }, {} as Record<string, any>);

              return {
                campaign_id: campaignId,
                first_name: firstName,
                last_name: lastName,
                phone_number: phoneNumber.replace(/\D/g, ""),
                metadata,
              };
            });

          if (contacts.length === 0) {
            toast({
              title: "Invalid CSV format",
              description:
                "Please ensure your CSV file has firstName, lastName, and phoneNumber columns.",
              variant: "destructive",
            });
            return;
          }

          try {
            const { error } = await supabase.from("campaign_contacts").insert(contacts);

            if (error) throw error;

            queryClient.invalidateQueries({
              queryKey: ["campaign-contacts", campaignId],
            });
            toast({
              title: "Contacts imported",
              description: `Successfully imported ${contacts.length} contacts.`,
            });
          } catch (error) {
            console.error("Error importing contacts:", error);
            toast({
              title: "Error importing contacts",
              description: "Failed to import contacts. Please try again.",
              variant: "destructive",
            });
          }
        },
        error: () => {
          toast({
            title: "Error importing contacts",
            description: "Failed to parse CSV file.",
            variant: "destructive",
          });
        },
      });
    },
    [campaignId, queryClient, toast]
  );

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  if (!campaignId) {
    return (
      <div className="text-center py-8 border rounded-lg">
        <UserPlus className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-semibold">Save the campaign first</h3>
        <p className="text-sm text-muted-foreground">
          You'll be able to add contacts after saving the campaign
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".csv"
          onChange={handleFileUpload}
        />
        <Button variant="outline" onClick={handleUploadClick}>
          <Upload className="mr-2 h-4 w-4" />
          Import CSV
        </Button>
      </div>

      <div className="space-y-2">
        <ContactForm
          contact={newContact}
          onChange={setNewContact}
          onSubmit={() => {
            addContact(newContact);
            setNewContact({});
          }}
        />
      </div>

      {contacts.length > 0 ? (
        <ContactsTable
          contacts={contacts}
          editingContact={editingContact}
          onEdit={setEditingContact}
          onEditSave={updateContact}
          onEditCancel={() => setEditingContact(null)}
          onDelete={deleteContact}
        />
      ) : (
        <div className="text-center py-8 border rounded-lg">
          <UserPlus className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold">No contacts added</h3>
          <p className="text-sm text-muted-foreground">
            Import contacts using CSV or add them manually
          </p>
        </div>
      )}
    </div>
  );
}
