
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

      const outboundPayload = contacts.map(contact => ({
        user: {
          firstName: contact.first_name,
          lastName: contact.last_name,
          phoneNumber: contact.phone_number
        },
        assistant: {
          firstMessage: campaign.agent.greeting || "",
          transcriber: {
            provider: "assembly-ai",
            disablePartialTranscripts: true,
            endUtteranceSilenceThreshold: 0,
            wordBoost: []
          },
          model: {
            provider: "anthropic",
            model: "claude-2",
            emotionRecognitionEnabled: false,
            toolIds: [],
            tools: [],
            messages: [
              {
                role: "system",
                content: campaign.agent.description || ""
              }
            ]
          },
          voice: {
            provider: "11labs",
            voiceId: campaign.agent.voice_id || ""
          },
          firstMessageMode: "assistant-waits-for-user",
          hipaaEnabled: campaign.agent.hipaa_enabled || false,
          clientMessages: [],
          serverMessages: [],
          backgroundSound: null,
          name: campaign.agent.name,
          voicemailDetection: {
            provider: "twilio",
            enabled: false
          },
          voicemailMessage: "",
          analysisPlan: {
            successEvaluationPlan: {
              enabled: true
            }
          },
          phoneNumber: {
            twilioAccountSid: "",
            twilioAuthToken: "",
            twilioPhoneNumber: campaign.agent.phone_number || ""
          },
          customer: {
            number: contact.phone_number
          }
        }
      }));

      const response = await fetch(import.meta.env.VITE_OUTBOUND_CALL_WEBHOOK || "", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(outboundPayload),
      });

      if (!response.ok) {
        throw new Error("Failed to trigger outbound call");
      }

      toast({
        title: "Test calls initiated",
        description: `Outbound calls have been triggered for ${contacts.length} contact(s).`,
      });
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
