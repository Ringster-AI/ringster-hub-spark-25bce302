
import { Button } from "@/components/ui/button";
import { Campaign } from "@/types/database/campaigns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StatusActionsProps {
  campaign: Campaign & { agent: any };
}

export function StatusActions({ campaign }: StatusActionsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateCampaignStatus = useMutation({
    mutationFn: async ({ campaignId, newStatus }: { campaignId: string; newStatus: Campaign['status'] }) => {
      const { error } = await supabase
        .from("campaigns")
        .update({ status: newStatus })
        .eq("id", campaignId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast({
        title: "Campaign updated",
        description: "Campaign status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating campaign",
        description: error instanceof Error ? error.message : "Failed to update campaign status",
        variant: "destructive",
      });
    },
  });

  const getStatusActions = () => {
    switch (campaign.status) {
      case "draft":
        return (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateCampaignStatus.mutate({ campaignId: campaign.id, newStatus: "scheduled" })}
              disabled={!campaign.scheduled_start}
            >
              Schedule
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateCampaignStatus.mutate({ campaignId: campaign.id, newStatus: "running" })}
            >
              Start Now
            </Button>
          </>
        );
      case "scheduled":
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateCampaignStatus.mutate({ campaignId: campaign.id, newStatus: "running" })}
          >
            Start Now
          </Button>
        );
      case "running":
        return (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateCampaignStatus.mutate({ campaignId: campaign.id, newStatus: "paused" })}
            >
              Pause
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateCampaignStatus.mutate({ campaignId: campaign.id, newStatus: "completed" })}
            >
              Complete
            </Button>
          </>
        );
      case "paused":
        return (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateCampaignStatus.mutate({ campaignId: campaign.id, newStatus: "running" })}
            >
              Resume
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateCampaignStatus.mutate({ campaignId: campaign.id, newStatus: "completed" })}
            >
              Complete
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  return getStatusActions();
}
