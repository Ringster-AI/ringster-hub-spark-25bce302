import { DialogHeader as BaseDialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SubscriptionFeatures } from "@/types/subscription/plans";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DialogHeaderProps {
  features: SubscriptionFeatures;
  currentAgentCount: number;
}

export const DialogHeader = ({ features, currentAgentCount }: DialogHeaderProps) => {
  const isAtLimit = currentAgentCount >= features.limits.maxAgents;

  return (
    <BaseDialogHeader>
      <DialogTitle>Create New AI Agent</DialogTitle>
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Agents: {currentAgentCount} / {features.limits.maxAgents} on your {features.isPaid ? 'Premium' : 'Free'} plan
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
    </BaseDialogHeader>
  );
};