
import { Toggle } from "@/components/ui/toggle";

interface BillingToggleProps {
  billingInterval: 'month' | 'year';
  setBillingInterval: (interval: 'month' | 'year') => void;
}

export const BillingToggle = ({ billingInterval, setBillingInterval }: BillingToggleProps) => {
  return (
    <div className="flex items-center justify-center mt-6 space-x-4">
      <Toggle
        pressed={billingInterval === 'month'}
        onPressedChange={() => setBillingInterval('month')}
        className="data-[state=on]:bg-primary"
      >
        Monthly
      </Toggle>
      <Toggle
        pressed={billingInterval === 'year'}
        onPressedChange={() => setBillingInterval('year')}
        className="data-[state=on]:bg-primary"
      >
        Yearly
        <span className="ml-2 text-xs text-green-500 font-medium">Save 20%</span>
      </Toggle>
    </div>
  );
};
