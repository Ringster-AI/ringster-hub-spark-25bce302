import { LandingNav } from "@/components/landing/LandingNav";
import { Footer } from "@/components/landing/Footer";
import { Seo } from "@/components/seo/Seo";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Pricing = () => {
  const { data: plans, isLoading } = useQuery({
    queryKey: ["public-pricing-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .neq("billing_interval", "one_time")
        .order("price", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const planHighlights: Record<string, string[]> = {
    Free: ["60 credits/month", "1 AI agent", "Basic call handling", "Call transcripts"],
    Starter: ["300 credits/month", "2 AI agents", "Call recording", "Lead capture", "Custom greetings"],
    Professional: ["1,000 credits/month", "5 AI agents", "Calendar integration", "Call routing", "Analytics dashboard", "Priority support"],
    Growth: ["3,000 credits/month", "Unlimited agents", "CRM integration", "API access", "AI insights", "Dedicated support"],
  };

  const offersJson = plans?.map((p) => ({
    "@type": "Offer",
    "name": p.name,
    "price": p.price,
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "billingDuration": "P1M",
    },
  }));

  return (
    <main className="overflow-x-hidden">
      <Seo
        title="Pricing — Ringster AI Receptionist Plans"
        description="Transparent pricing for Ringster AI receptionist. Plans from free to enterprise. No contracts, cancel anytime. Start with a 7-day free trial."
        canonical="https://ringster.ai/pricing"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Ringster AI Receptionist",
          "url": "https://ringster.ai/pricing",
          "description": "AI-powered phone agent platform for businesses.",
          "brand": { "@type": "Brand", "name": "Ringster" },
          "offers": offersJson || [],
        }}
      />
      <LandingNav />

      <div className="pt-20">
        <section className="py-20 md:py-28 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute -top-1/2 right-0 w-[600px] h-[600px] rounded-full bg-primary/8 blur-3xl" />
          </div>
          <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              Simple, Transparent <span className="text-primary">Pricing</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
              No hidden fees. No contracts. Start free and scale as you grow. Every plan includes a 7-day trial.
            </p>
          </div>
        </section>

        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-96 bg-card border border-border rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {plans?.map((plan) => {
                  const isPro = plan.name === "Professional";
                  const features = planHighlights[plan.name] || [`${plan.credits_allowance} credits/month`, `${plan.max_agents} AI agents`];
                  return (
                    <div key={plan.id} className={`rounded-xl border p-6 flex flex-col ${isPro ? 'border-primary ring-2 ring-primary/20 bg-primary/5 relative' : 'border-border bg-card'}`}>
                      {isPro && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>}
                      <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                      <div className="mt-4 mb-6">
                        <span className="text-4xl font-bold text-foreground">${Number(plan.price)}</span>
                        <span className="text-muted-foreground">/mo</span>
                      </div>
                      <ul className="space-y-3 flex-1 mb-6">
                        {features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <Button asChild className={isPro ? '' : 'variant-outline'} variant={isPro ? 'default' : 'outline'}>
                        <Link to="/signup">{plan.price === 0 ? 'Get Started' : 'Start Free Trial'}</Link>
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* FAQ-like section */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">Need a Custom Plan?</h2>
              <p className="text-muted-foreground mb-6">For enterprise teams with high call volumes, custom integrations, or specific compliance needs — we'll build a plan that fits.</p>
              <Button asChild variant="outline"><Link to="/contact">Contact Sales</Link></Button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
};

export default Pricing;
