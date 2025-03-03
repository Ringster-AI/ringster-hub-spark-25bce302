
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Campaign } from "@/types/database/campaigns";
import { CreateCampaignDialog } from "@/components/campaigns/CreateCampaignDialog";
import { EditCampaignDialog } from "@/components/campaigns/EditCampaignDialog";
import { ContactsDialog } from "@/components/campaigns/ContactsDialog";
import { useState } from "react";
import { CampaignList } from "@/components/campaigns/CampaignList";

const Campaigns = () => {
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

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-4 md:py-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <CreateCampaignDialog />
      </div>

      <CampaignList campaigns={campaigns || []} />

      <EditCampaignDialog
        campaign={editingCampaign!}
        open={!!editingCampaign}
        onOpenChange={(open) => !open && setEditingCampaign(null)}
        onUpdate={() => setEditingCampaign(null)}
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
