import { useEffect, useState, ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Lock, ArrowUp } from "lucide-react";
import { CreditsService } from "@/services/creditsService";
import { FeatureAccess, PlanFeatures } from "@/types/credits";

interface FeatureGateProps {
  feature: keyof PlanFeatures;
  children: ReactNode;
  fallback?: ReactNode;
  onUpgrade?: () => void;
  showUpgradePrompt?: boolean;
}

export const FeatureGate = ({ 
  feature, 
  children, 
  fallback, 
  onUpgrade,
  showUpgradePrompt = true 
}: FeatureGateProps) => {
  const [featureAccess, setFeatureAccess] = useState<FeatureAccess | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const access = await CreditsService.checkFeatureAccess(feature);
        setFeatureAccess(access);
      } catch (error) {
        console.error('Error checking feature access:', error);
        setFeatureAccess({
          hasAccess: false,
          featureName: feature,
          upgradeMessage: 'Error checking feature access'
        });
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [feature]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
        <div className="h-8 bg-muted rounded w-full"></div>
      </div>
    );
  }

  if (!featureAccess || featureAccess.hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  return (
    <Alert>
      <Lock className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <p className="font-medium">Feature Locked</p>
          <p className="text-sm text-muted-foreground mt-1">
            {featureAccess.upgradeMessage}
          </p>
        </div>
        {onUpgrade && (
          <Button size="sm" onClick={onUpgrade} className="ml-4">
            <ArrowUp className="h-3 w-3 mr-1" />
            Upgrade
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};