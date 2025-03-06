
import { Check } from "lucide-react";

interface PlanFeatureProps {
  feature: string;
}

export const PlanFeature = ({ feature }: PlanFeatureProps) => {
  return (
    <li className="flex items-center gap-2">
      <Check className="h-4 w-4 text-primary" />
      <span>{feature}</span>
    </li>
  );
};
