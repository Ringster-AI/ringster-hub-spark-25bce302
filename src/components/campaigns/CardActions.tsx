
import { Button } from "@/components/ui/button";
import { Campaign } from "@/types/database/campaigns";
import { Users, Edit, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CardActionsProps {
  campaign: Campaign & { agent: any };
  onEditClick: () => void;
  onContactsClick: () => void;
}

export function CardActions({ campaign, onEditClick, onContactsClick }: CardActionsProps) {
  const { toast } = useToast();

  const handleTestCall = async () => {
    try {
      const { data: contacts, error: contactsError } = await supabase
        .from("campaign_contacts")
        .select("*")
        .eq("campaign_id", campaign.id)
        .limit(5);

      if (contactsError) throw contactsError;
      
      if (!contacts || contacts.length === 0) {
        toast({
          title: "No contacts found",
          description: "Please add contacts to the campaign before testing.",
          variant: "destructive",
        });
        return;
      }

      // Make calls through our Netlify function
      const results = await Promise.all(
        contacts.map(async (contact) => {
          const response = await fetch('/.netlify/functions/make-outbound-call', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              agentId: campaign.agent.id,
              toNumber: contact.phone_number,
              agent: {
                name: campaign.agent.name,
                description: campaign.agent.description,
                greeting: campaign.agent.greeting,
                goodbye: campaign.agent.goodbye,
                voice_id: campaign.agent.voice_id,
                advanced_config: campaign.agent.advanced_config,
              }
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to initiate call');
          }

          return response.json();
        })
      );

      toast({
        title: "Test calls initiated",
        description: `Outbound calls have been triggered for ${contacts.length} contact(s).`,
      });

      console.log('Call results:', results);
    } catch (error) {
      console.error("Test call error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to trigger test calls",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={onContactsClick}
        title="View/Edit Contacts"
      >
        <Users className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onEditClick}
        title="Edit Campaign"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleTestCall}
        title="Test Outbound Call"
      >
        <Phone className="h-4 w-4" />
      </Button>
    </>
  );
}
