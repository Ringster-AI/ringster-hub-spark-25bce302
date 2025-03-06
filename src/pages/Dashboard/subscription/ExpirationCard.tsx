
import { Card, CardContent } from "@/components/ui/card";
import { SubscriptionFeatures } from "@/types/subscription/plans";

interface ExpirationCardProps {
  features: SubscriptionFeatures;
}

export const ExpirationCard = ({ features }: ExpirationCardProps) => {
  if (!features.expiresAt) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        <p className="text-xs md:text-sm text-muted-foreground">
          Plan {features.willExpire ? "expires" : "expired"} on:{" "}
          {new Date(features.expiresAt).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
};
