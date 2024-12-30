import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { PricingPlans } from "@/components/subscription/PricingPlans";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <PricingPlans />
    </div>
  );
};

export default Index;