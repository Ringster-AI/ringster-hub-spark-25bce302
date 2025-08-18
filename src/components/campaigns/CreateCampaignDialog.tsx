
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { NextGenCampaignBuilder } from "./NextGenCampaignBuilder";
import { CampaignForm } from "./CampaignForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CreateCampaignDialog() {
  const [open, setOpen] = useState(false);
  const [useNextGen, setUseNextGen] = useState(true);

  if (useNextGen && open) {
    return <NextGenCampaignBuilder onClose={() => setOpen(false)} />;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90">
          <Sparkles className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Create New Campaign</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6">
          <CampaignForm onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
