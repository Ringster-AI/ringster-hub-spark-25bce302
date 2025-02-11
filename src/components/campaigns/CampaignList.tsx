
import { Campaign } from "@/types/database/campaigns";
import { CampaignCard } from "./CampaignCard";

interface CampaignListProps {
  campaigns: (Campaign & { agent: any })[];
}

export function CampaignList({ campaigns }: CampaignListProps) {
  if (!campaigns?.length) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold">No campaigns yet</h3>
        <p className="text-muted-foreground">
          Create your first campaign to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}
