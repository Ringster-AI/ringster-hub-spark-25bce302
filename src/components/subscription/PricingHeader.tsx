
import { BillingToggle } from "./BillingToggle";

interface PricingHeaderProps {
  billingInterval: 'month' | 'year';
  setBillingInterval: (interval: 'month' | 'year') => void;
}

export const PricingHeader = ({ billingInterval, setBillingInterval }: PricingHeaderProps) => {
  return (
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold">Choose Your Plan</h2>
      <p className="text-muted-foreground mt-2">
        Select the perfect plan for your needs
      </p>
      <BillingToggle 
        billingInterval={billingInterval} 
        setBillingInterval={setBillingInterval} 
      />
    </div>
  );
};
