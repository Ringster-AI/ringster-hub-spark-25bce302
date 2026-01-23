
import { Button } from "@/components/ui/button";
import { Campaign } from "@/types/database/campaigns";
import { Users, Edit, Phone, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CardActionsProps {
  campaign: Campaign & { agent: any };
  onEditClick: () => void;
  onContactsClick: () => void;
  onDashboardClick?: () => void;
}

export function CardActions({ campaign, onEditClick, onContactsClick, onDashboardClick }: CardActionsProps) {
  const { toast } = useToast();

  const handleTestCall = async () => {
    try {
      // Get the current session for authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast({
          title: "Authentication required",
          description: "Please log in to make test calls.",
          variant: "destructive",
        });
        return;
      }

      const { data: contacts, error: contactsError } = await supabase
        .from("campaign_contacts")
        .select("*")
        .eq("campaign_id", campaign.id)
        .limit(1); // Changed to limit 1 for testing

      if (contactsError) throw contactsError;
      
      if (!contacts || contacts.length === 0) {
        toast({
          title: "No contacts found",
          description: "Please add contacts to the campaign before testing.",
          variant: "destructive",
        });
        return;
      }

      // Make a single call through our Netlify function
      const contact = contacts[0]; // Take just the first contact
      const payload = {
        user: {
          firstName: contact.first_name,
          lastName: contact.last_name,
          phoneNumber: contact.phone_number
        },
        assistant: {
          firstMessage: campaign.agent.greeting || "",
          transcriber: campaign.agent.advanced_config?.transcriber || {
            provider: "assembly-ai",
            disablePartialTranscripts: true,
            endUtteranceSilenceThreshold: 0,
            wordBoost: []
          },
          model: {
            provider: "openai",
            model: "gpt-3.5-turbo",
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
          voice: campaign.agent.advanced_config?.voice || {
            provider: "11labs",
            voiceId: campaign.agent.voice_id || "9BWtsMINqrJLrRacOk9x"
          },
          firstMessageMode: "assistant-waits-for-user",
          hipaaEnabled: false,
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
            twilioPhoneNumber: ""
          },
          customer: {
            number: contact.phone_number
          }
        }
      };

      const response = await fetch('/.netlify/functions/make-outbound-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to initiate call');
      }

      const result = await response.json();

      toast({
        title: "Test call initiated",
        description: `Outbound call has been triggered for ${contact.first_name} ${contact.last_name}.`,
      });

      console.log('Call result:', result);
    } catch (error) {
      console.error("Test call error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to trigger test call",
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
      {(campaign.status === 'running' || campaign.status === 'paused') && onDashboardClick && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onDashboardClick}
          title="View Dashboard"
        >
          <BarChart3 className="h-4 w-4" />
        </Button>
      )}
    </>
  );
}
