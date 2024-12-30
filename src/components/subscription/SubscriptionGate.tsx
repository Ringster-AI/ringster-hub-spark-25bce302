import { ReactNode } from "react";
import { useSubscriptionFeatures } from "@/hooks/useSubscriptionFeatures";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface SubscriptionGateProps {
  children: ReactNode;
  requirement: {
    type: 'agents' | 'teamMembers' | 'minutes' | 'customVoices';
    value?: number;
  };
  fallback?: ReactNode;
}

export const SubscriptionGate = ({ children, requirement, fallback }: SubscriptionGateProps) => {
  const { features, isLoading } = useSubscriptionFeatures();

  if (isLoading) {
    return null;
  }

  const checkRequirement = () => {
    switch (requirement.type) {
      case 'agents':
        return features.limits.maxAgents >= (requirement.value || 1);
      case 'teamMembers':
        return features.limits.maxTeamMembers >= (requirement.value || 1);
      case 'minutes':
        return features.limits.remainingMinutes >= (requirement.value || 1);
      case 'customVoices':
        return features.limits.canCustomizeVoices;
      default:
        return false;
    }
  };

  if (!features.isActive) {
    return fallback || (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Your subscription is inactive. Please update your subscription to access this feature.
        </AlertDescription>
      </Alert>
    );
  }

  if (!checkRequirement()) {
    return fallback || (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This feature requires a higher subscription tier. Please upgrade your plan to access it.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};