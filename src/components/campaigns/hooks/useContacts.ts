
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Contact } from "../types";
import { useToast } from "@/hooks/use-toast";

export function useContacts(campaignId?: string) {
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

  return {
    contacts,
    isLoading,
    addContact: addContactMutation.mutate,
    updateContact: updateContactMutation.mutate,
    deleteContact: deleteContactMutation.mutate
  };
}
