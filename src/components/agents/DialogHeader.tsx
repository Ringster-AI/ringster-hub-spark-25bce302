import { DialogHeader as BaseDialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserSubscription } from "@/hooks/useSubscription";

interface DialogHeaderProps {
  subscription: UserSubscription | null;
}

export const DialogHeader = ({ subscription }: DialogHeaderProps) => {
  return (
    <BaseDialogHeader>
      <DialogTitle>Create New AI Agent</DialogTitle>
      {subscription && (
        <div className="text-sm text-muted-foreground">
          Agents allowed: {subscription.plan.max_agents} on your {subscription.plan.name} plan
        </div>
      )}
    </BaseDialogHeader>
  );
};