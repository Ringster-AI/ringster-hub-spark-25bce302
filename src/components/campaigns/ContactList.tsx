
import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload, UserPlus, Trash, Pencil } from "lucide-react";
import Papa from "papaparse";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Contact {
  id?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  metadata: Record<string, any>;
}

interface ContactListProps {
  campaignId?: string;
}

export function ContactList({ campaignId }: ContactListProps) {
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [newContact, setNewContact] = useState<Partial<Contact>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["campaign-contacts", campaignId],
    queryFn: async () => {
      if (!campaignId) return [];
      const { data, error } = await supabase
        .from("campaign_contacts")
        .select("*")
        .eq("campaign_id", campaignId);

      if (error) throw error;
      return data.map(contact => ({
        id: contact.id,
        firstName: contact.first_name,
        lastName: contact.last_name,
        phoneNumber: contact.phone_number,
        metadata: contact.metadata as Record<string, any>
      }));
    },
    enabled: !!campaignId
  });

  const addContactMutation = useMutation({
    mutationFn: async (contact: Partial<Contact>) => {
      if (!campaignId) throw new Error("Campaign ID is required");
      const { error } = await supabase
        .from("campaign_contacts")
        .insert({
          campaign_id: campaignId,
          first_name: contact.firstName,
          last_name: contact.lastName,
          phone_number: contact.phoneNumber,
          metadata: contact.metadata || {}
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-contacts", campaignId] });
      setNewContact({});
      toast({
        title: "Contact added",
        description: "Contact has been added successfully."
      });
    }
  });

  const updateContactMutation = useMutation({
    mutationFn: async (contact: Contact) => {
      if (!campaignId || !contact.id) throw new Error("Campaign ID and Contact ID are required");
      const { error } = await supabase
        .from("campaign_contacts")
        .update({
          first_name: contact.firstName,
          last_name: contact.lastName,
          phone_number: contact.phoneNumber,
          metadata: contact.metadata
        })
        .eq("id", contact.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-contacts", campaignId] });
      setEditingContact(null);
      toast({
        title: "Contact updated",
        description: "Contact has been updated successfully."
      });
    }
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (contactId: string) => {
      if (!campaignId) throw new Error("Campaign ID is required");
      const { error } = await supabase
        .from("campaign_contacts")
        .delete()
        .eq("id", contactId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-contacts", campaignId] });
      toast({
        title: "Contact deleted",
        description: "Contact has been deleted successfully."
      });
    }
  });

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !campaignId) return;

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const contacts = results.data
          .filter((row: any) => row.firstName && row.lastName && row.phoneNumber)
          .map((row: any) => ({
            campaign_id: campaignId,
            first_name: row.firstName,
            last_name: row.lastName,
            phone_number: row.phoneNumber.replace(/\D/g, ""),
            metadata: Object.keys(row)
              .filter(key => !["firstName", "lastName", "phoneNumber"].includes(key))
              .reduce((acc, key) => ({ ...acc, [key]: row[key] }), {})
          }));

        if (contacts.length === 0) {
          toast({
            title: "Invalid CSV format",
            description: "Please ensure your CSV file has firstName, lastName, and phoneNumber columns.",
            variant: "destructive",
          });
          return;
        }

        try {
          const { error } = await supabase
            .from("campaign_contacts")
            .insert(contacts);

          if (error) throw error;

          queryClient.invalidateQueries({ queryKey: ["campaign-contacts", campaignId] });
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
  }, [campaignId, queryClient, toast]);

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
        <div className="flex gap-2">
          <Input
            placeholder="First Name"
            value={newContact.firstName || ""}
            onChange={(e) => setNewContact({ ...newContact, firstName: e.target.value })}
          />
          <Input
            placeholder="Last Name"
            value={newContact.lastName || ""}
            onChange={(e) => setNewContact({ ...newContact, lastName: e.target.value })}
          />
          <Input
            placeholder="Phone Number"
            value={newContact.phoneNumber || ""}
            onChange={(e) => setNewContact({ ...newContact, phoneNumber: e.target.value })}
          />
          <Button
            onClick={() => addContactMutation.mutate(newContact)}
            disabled={!newContact.firstName || !newContact.lastName || !newContact.phoneNumber}
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {contacts.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Additional Info</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  {editingContact?.id === contact.id ? (
                    <Input
                      value={editingContact.firstName}
                      onChange={(e) => setEditingContact({
                        ...editingContact,
                        firstName: e.target.value
                      })}
                    />
                  ) : contact.firstName}
                </TableCell>
                <TableCell>
                  {editingContact?.id === contact.id ? (
                    <Input
                      value={editingContact.lastName}
                      onChange={(e) => setEditingContact({
                        ...editingContact,
                        lastName: e.target.value
                      })}
                    />
                  ) : contact.lastName}
                </TableCell>
                <TableCell>
                  {editingContact?.id === contact.id ? (
                    <Input
                      value={editingContact.phoneNumber}
                      onChange={(e) => setEditingContact({
                        ...editingContact,
                        phoneNumber: e.target.value
                      })}
                    />
                  ) : contact.phoneNumber}
                </TableCell>
                <TableCell className="max-w-md truncate">
                  {Object.entries(contact.metadata || {})
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(", ") || "No additional info"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {editingContact?.id === contact.id ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateContactMutation.mutate(editingContact)}
                        >
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingContact(null)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingContact(contact)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => contact.id && deleteContactMutation.mutate(contact.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
