import { DialogHeader as BaseDialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserSubscription } from "@/hooks/useSubscription";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DialogHeaderProps {
  subscription: UserSubscription | null;
  currentAgentCount: number;
}

export const DialogHeader = ({ subscription, currentAgentCount }: DialogHeaderProps) => {
  const isAtLimit = subscription && currentAgentCount >= subscription.plan.max_agents;

  return (
    <BaseDialogHeader>
      <DialogTitle>Create New AI Agent</DialogTitle>
      {subscription && (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Agents: {currentAgentCount} / {subscription.plan.max_agents} on your {subscription.plan.name} plan
          </div>
          {isAtLimit && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You've reached your agent limit. Please upgrade your plan to create more agents.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </BaseDialogHeader>
  );
};