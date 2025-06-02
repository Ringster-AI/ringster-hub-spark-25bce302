
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Campaign } from "@/types/database/campaigns";
import { CampaignBasicInfo } from "./form/CampaignBasicInfo";
import { AgentConfig } from "./AgentConfig";
import { ContactList } from "./ContactList";
import { CalendarConfig } from "./CalendarConfig";
import { CalendarBookings } from "./CalendarBookings";
import { FollowUpSequences } from "./FollowUpSequences";
import { useCampaignForm } from "./form/useCampaignForm";

interface CampaignFormProps {
  onSuccess: () => void;
  initialData?: Campaign & { agent: any };
}

export function CampaignForm({ onSuccess, initialData }: CampaignFormProps) {
  const { form, mutation } = useCampaignForm({ initialData, onSuccess });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-6">
        <CampaignBasicInfo form={form} />

        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-semibold mb-4">Agent Configuration</h3>
          <AgentConfig form={form} />
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-semibold mb-4">Calendar Booking Settings</h3>
          <CalendarConfig form={form} />
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-semibold mb-4">Contact List</h3>
          <ContactList campaignId={initialData?.id} />
        </div>

        {initialData && (
          <>
            <div className="rounded-lg border p-4">
              <CalendarBookings campaignId={initialData.id} />
            </div>

            <div className="rounded-lg border p-4">
              <FollowUpSequences campaignId={initialData.id} />
            </div>
          </>
        )}

        <div className="sticky bottom-0 bg-background pt-4 border-t flex justify-end gap-4">
          <Button type="submit" disabled={mutation.isPending}>
            {initialData ? 'Update' : 'Create'} Campaign
          </Button>
        </div>
      </form>
    </Form>
  );
}
