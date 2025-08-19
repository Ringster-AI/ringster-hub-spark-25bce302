import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { LiveCampaignDashboard } from "@/components/campaigns/dashboard/LiveCampaignDashboard";
import { supabase } from "@/integrations/supabase/client";

export default function CampaignDashboard() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();

  const { data: campaign, isLoading } = useQuery({
    queryKey: ["campaign-dashboard", campaignId],
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
    return (
      <div className="container mx-auto px-4 py-6">
        <div>Loading campaign dashboard...</div>
      </div>
    );
  }

  if (!campaign || !campaignId) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div>Campaign not found</div>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from("campaigns")
        .update({ status: newStatus as 'scheduled' | 'running' | 'paused' | 'completed' })
        .eq("id", campaignId);

      if (error) throw error;
      
      // Refresh the campaign data
      window.location.reload();
    } catch (error) {
      console.error("Error updating campaign status:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard/campaigns')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Campaigns
        </Button>
      </div>

      <LiveCampaignDashboard
        campaignId={campaignId}
        campaignName={campaign.name}
        status={campaign.status as 'scheduled' | 'running' | 'paused' | 'completed'}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}