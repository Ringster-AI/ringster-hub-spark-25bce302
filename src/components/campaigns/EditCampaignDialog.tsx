
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Campaign } from "@/types/database/campaigns";
import { CampaignForm } from "./CampaignForm";

interface EditCampaignDialogProps {
  campaign: Campaign & { agent: any };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export const EditCampaignDialog = ({ campaign, open, onOpenChange, onUpdate }: EditCampaignDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSuccess = () => {
    toast({
      title: "Campaign updated",
      description: "Your campaign has been updated successfully.",
    });
    onUpdate();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (isLoading) return;
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogTitle>Edit Campaign</DialogTitle>
        <CampaignForm
          initialData={campaign}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};
