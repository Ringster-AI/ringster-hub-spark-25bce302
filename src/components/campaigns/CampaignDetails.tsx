
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CalendarBookings } from "./CalendarBookings";
import { CampaignCalendarToolsManagement } from "../calendar/CampaignCalendarToolsManagement";
import { FollowUpSequences } from "./FollowUpSequences";
import { ContactList } from "./ContactList";
import { Campaign, Users, Calendar, GitBranch, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function CampaignDetails() {
  const { campaignId } = useParams<{ campaignId: string }>();

  const { data: campaign, isLoading } = useQuery({
    queryKey: ["campaign", campaignId],
    queryFn: async () => {
      if (!campaignId) throw new Error("Campaign ID is required");
      
      const { data, error } = await supabase
        .from("campaigns")
        .select(`
          *,
          agent:agent_configs(*)
        `)
        .eq("id", campaignId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!campaignId,
  });

  if (isLoading) {
    return <div>Loading campaign details...</div>;
  }

  if (!campaign || !campaignId) {
    return <div>Campaign not found</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'gray';
      case 'scheduled': return 'blue';
      case 'running': return 'green';
      case 'paused': return 'yellow';
      case 'completed': return 'purple';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-4">
        <Campaign className="h-8 w-8" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{campaign.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={getStatusColor(campaign.status) as any}>
              {campaign.status}
            </Badge>
            {campaign.agent && (
              <span className="text-muted-foreground text-sm">
                Agent: {campaign.agent.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {campaign.description && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">{campaign.description}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="contacts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contacts">
            <Users className="h-4 w-4 mr-1" />
            Contacts
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <Calendar className="h-4 w-4 mr-1" />
            Calendar Bookings
          </TabsTrigger>
          <TabsTrigger value="calendar-tools">
            <Settings className="h-4 w-4 mr-1" />
            Calendar Tools
          </TabsTrigger>
          <TabsTrigger value="follow-ups">
            <GitBranch className="h-4 w-4 mr-1" />
            Follow-ups
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contacts">
          <ContactList campaignId={campaignId} />
        </TabsContent>

        <TabsContent value="calendar">
          <CalendarBookings campaignId={campaignId} />
        </TabsContent>

        <TabsContent value="calendar-tools">
          <CampaignCalendarToolsManagement campaignId={campaignId} />
        </TabsContent>

        <TabsContent value="follow-ups">
          <FollowUpSequences campaignId={campaignId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
