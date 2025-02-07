
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Campaign } from "@/types/database/campaigns";

const Campaigns = () => {
  const { toast } = useToast();

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Campaign[];
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {campaigns?.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold">No campaigns yet</h3>
          <p className="text-muted-foreground">Create your first campaign to get started</p>
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
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm capitalize px-2 py-1 rounded-full bg-primary/10">
                    {campaign.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Campaigns;
