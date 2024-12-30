import { Badge } from "@/components/ui/badge";
import { useSubscriptionFeatures } from "@/hooks/useSubscriptionFeatures";

export const SubscriptionBadge = () => {
  const { features, isLoading } = useSubscriptionFeatures();

  if (isLoading) {
    return null;
  }

  if (!features.isActive) {
    return <Badge variant="destructive">Inactive</Badge>;
  }

  if (features.isTrialing) {
    return <Badge variant="secondary">Trial</Badge>;
  }

  if (!features.isPaid) {
    return <Badge>Free</Badge>;
  }

  return <Badge variant="default">Premium</Badge>;
};