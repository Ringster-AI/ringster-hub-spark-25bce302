
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Play, Pause, StopCircle, Calendar, Edit, Users, Phone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Campaign } from "@/types/database/campaigns";
import { CreateCampaignDialog } from "@/components/campaigns/CreateCampaignDialog";
import { EditCampaignDialog } from "@/components/campaigns/EditCampaignDialog";
import { ContactsDialog } from "@/components/campaigns/ContactsDialog";
import { cn } from "@/lib/utils";
import { useState } from "react";

const Campaigns = () => {
  const { toast } = useToast();
  const [editingCampaign, setEditingCampaign] = useState<(Campaign & { agent: any }) | null>(null);
  const [viewingContacts, setViewingContacts] = useState<(Campaign & { agent: any }) | null>(null);

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*, agent:agent_configs(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as (Campaign & { agent: any })[];
    },
  });

  const handleTestCall = async (campaign: Campaign & { agent: any }) => {
    try {
      const { data: contacts, error: contactsError } = await supabase
        .from("campaign_contacts")
        .select("*")
        .eq("campaign_id", campaign.id)
        .limit(1);

      if (contactsError) throw contactsError;
      
      if (!contacts || contacts.length === 0) {
        toast({
          title: "No contacts found",
          description: "Please add contacts to the campaign before testing.",
          variant: "destructive",
        });
        return;
      }

      const contact = contacts[0];
      const outboundPayload = [{
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
      }];

      // Instead of querying the secrets table directly, we'll use the webhook_url from env
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
        title: "Test call initiated",
        description: "The outbound call has been triggered successfully.",
      });
    } catch (error) {
      console.error("Test call error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to trigger test call",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Play className="h-4 w-4 text-green-500" />;
      case "paused":
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case "completed":
        return <StopCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Calendar className="h-4 w-4 text-blue-500" />;
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <CreateCampaignDialog />
      </div>

      {campaigns?.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold">No campaigns yet</h3>
          <p className="text-muted-foreground">
            Create your first campaign to get started
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns?.map((campaign) => (
            <div
              key={campaign.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{campaign.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {campaign.description || "No description"}
                  </p>
                  {campaign.agent && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Agent: {campaign.agent.name}
                    </p>
                  )}
                  {campaign.scheduled_start && (
                    <p className="text-sm text-muted-foreground">
                      Scheduled: {new Date(campaign.scheduled_start).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewingContacts(campaign)}
                    title="View/Edit Contacts"
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingCampaign(campaign)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleTestCall(campaign)}
                    title="Test Outbound Call"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  {getStatusIcon(campaign.status)}
                  <span
                    className={cn(
                      "text-sm capitalize px-2 py-1 rounded-full",
                      {
                        "bg-green-100 text-green-800": campaign.status === "running",
                        "bg-yellow-100 text-yellow-800":
                          campaign.status === "paused",
                        "bg-red-100 text-red-800": campaign.status === "completed",
                        "bg-blue-100 text-blue-800": campaign.status === "draft",
                      }
                    )}
                  >
                    {campaign.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <EditCampaignDialog
        campaign={editingCampaign!}
        open={!!editingCampaign}
        onOpenChange={(open) => !open && setEditingCampaign(null)}
        onUpdate={() => {
          setEditingCampaign(null);
          toast({
            title: "Campaign updated",
            description: "Campaign has been updated successfully.",
          });
        }}
      />

      <ContactsDialog
        campaign={viewingContacts}
        open={!!viewingContacts}
        onOpenChange={(open) => !open && setViewingContacts(null)}
      />
    </div>
  );
};

export default Campaigns;
