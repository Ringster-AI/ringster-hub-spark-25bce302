
import { Contact } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash } from "lucide-react";

interface ContactsTableProps {
  contacts: Contact[];
  editingContact: Contact | null;
  onEdit: (contact: Contact) => void;
  onEditSave: (contact: Contact) => void;
  onEditCancel: () => void;
  onDelete: (contactId: string) => void;
}

export function ContactsTable({
  contacts,
  editingContact,
  onEdit,
  onEditSave,
  onEditCancel,
  onDelete,
}: ContactsTableProps) {
  // Get all unique metadata keys across all contacts
  const metadataColumns = Array.from(
    new Set(
      contacts.flatMap((contact) => 
        Object.keys(contact.metadata || {})
      )
    )
  ).sort();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>First Name</TableHead>
          <TableHead>Last Name</TableHead>
          <TableHead>Phone Number</TableHead>
          {metadataColumns.map((column) => (
            <TableHead key={column} className="capitalize">
              {column}
            </TableHead>
          ))}
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
                  onChange={(e) =>
                    onEdit({
                      ...editingContact,
                      firstName: e.target.value,
                    })
                  }
                />
              ) : (
                contact.firstName
              )}
            </TableCell>
            <TableCell>
              {editingContact?.id === contact.id ? (
                <Input
                  value={editingContact.lastName}
                  onChange={(e) =>
                    onEdit({
                      ...editingContact,
                      lastName: e.target.value,
                    })
                  }
                />
              ) : (
                contact.lastName
              )}
            </TableCell>
            <TableCell>
              {editingContact?.id === contact.id ? (
                <Input
                  value={editingContact.phoneNumber}
                  onChange={(e) =>
                    onEdit({
                      ...editingContact,
                      phoneNumber: e.target.value,
                    })
                  }
                />
              ) : (
                contact.phoneNumber
              )}
            </TableCell>
            {metadataColumns.map((column) => (
              <TableCell key={column}>
                {editingContact?.id === contact.id ? (
                  <Input
                    value={editingContact.metadata[column] || ''}
                    onChange={(e) =>
                      onEdit({
                        ...editingContact,
                        metadata: {
                          ...editingContact.metadata,
                          [column]: e.target.value,
                        },
                      })
                    }
                  />
                ) : (
                  contact.metadata[column] || ''
                )}
              </TableCell>
            ))}
            <TableCell>
              <div className="flex gap-2">
                {editingContact?.id === contact.id ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditSave(editingContact)}
                    >
                      Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onEditCancel}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(contact)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => contact.id && onDelete(contact.id)}
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
  );
}
