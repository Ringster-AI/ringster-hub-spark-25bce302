
import { Campaign } from "@/types/database/campaigns";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { StatusBadge } from "./StatusBadge";
import { StatusActions } from "./StatusActions";
import { CardActions } from "./CardActions";

interface CampaignCardProps {
  campaign: Campaign & { agent: any };
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const [viewingContacts, setViewingContacts] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(false);
  const { toast } = useToast();

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
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
          <div className="flex gap-2 mr-4">
            <StatusActions campaign={campaign} />
          </div>
          <CardActions
            campaign={campaign}
            onEditClick={() => setEditingCampaign(true)}
            onContactsClick={() => setViewingContacts(true)}
          />
          <StatusBadge status={campaign.status} />
        </div>
      </div>
    </div>
  );
}
