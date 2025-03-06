
import { SubscriptionBadge } from "@/components/subscription/SubscriptionBadge";

export const SubscriptionHeader = () => {
  return (
    <div className="mb-4 md:mb-6 flex items-center gap-2 md:gap-4">
      <h1 className="text-2xl md:text-3xl font-bold">Subscription</h1>
      <SubscriptionBadge />
    </div>
  );
};
