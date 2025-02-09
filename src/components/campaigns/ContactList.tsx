
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
import { Upload, UserPlus, Trash } from "lucide-react";
import Papa from "papaparse";

interface Contact {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  metadata: Record<string, any>;
}

export function ContactList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const validContacts = results.data
          .filter((row: any) => row.firstName && row.lastName && row.phoneNumber)
          .map((row: any) => {
            // Extract required fields
            const { firstName, lastName, phoneNumber, ...additionalFields } = row;
            
            // Clean up phone number to only include digits
            const cleanPhoneNumber = phoneNumber.replace(/\D/g, "");
            
            // Create contact object with metadata
            return {
              firstName,
              lastName,
              phoneNumber: cleanPhoneNumber,
              metadata: additionalFields
            };
          });

        if (validContacts.length === 0) {
          toast({
            title: "Invalid CSV format",
            description:
              "Please ensure your CSV file has firstName, lastName, and phoneNumber columns.",
            variant: "destructive",
          });
          return;
        }

        setContacts(validContacts);
        toast({
          title: "Contacts imported",
          description: `Successfully imported ${validContacts.length} contacts.`,
        });
      },
      error: () => {
        toast({
          title: "Error importing contacts",
          description: "Failed to parse CSV file.",
          variant: "destructive",
        });
      },
    });
  }, [toast]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const getAdditionalFields = useCallback((contact: Contact) => {
    const fields = Object.entries(contact.metadata)
      .filter(([_, value]) => value) // Only show non-empty fields
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
    return fields ? fields : "No additional info";
  }, []);

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
            {contacts.map((contact, index) => (
              <TableRow key={index}>
                <TableCell>{contact.firstName}</TableCell>
                <TableCell>{contact.lastName}</TableCell>
                <TableCell>{contact.phoneNumber}</TableCell>
                <TableCell className="max-w-md truncate">
                  {getAdditionalFields(contact)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newContacts = [...contacts];
                      newContacts.splice(index, 1);
                      setContacts(newContacts);
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
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
