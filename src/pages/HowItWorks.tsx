import { LandingNav } from "@/components/landing/LandingNav";
import { Footer } from "@/components/landing/Footer";
import { Seo } from "@/components/seo/Seo";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UserPlus, Building2, Settings, PhoneCall, Rocket } from "lucide-react";

const steps = [
  { icon: UserPlus, num: "01", title: "Create your Ringster account", description: "Sign up in under a minute. No credit card required for your free trial. You'll land in your dashboard ready to build your first AI agent." },
  { icon: Building2, num: "02", title: "Add your business information", description: "Enter your business name, hours, services, location, and the key details Ringster should share with callers. The more context you give, the smarter your agent." },
  { icon: Settings, num: "03", title: "Configure call handling", description: "Set your greeting message, call routing rules, transfer numbers, lead capture questions, and calendar availability. Define exactly how your AI receptionist should behave." },
  { icon: PhoneCall, num: "04", title: "Test your AI receptionist", description: "Call your number and have a real conversation with your agent. Review the transcript, refine responses, and adjust the flow until it's perfect." },
  { icon: Rocket, num: "05", title: "Go live", description: "Publish your setup and Ringster starts answering customer calls immediately. Monitor performance from your dashboard and optimize over time." },
];

const HowItWorks = () => {
  return (
    <main className="overflow-x-hidden">
      <Seo
        title="How Ringster Works — Set Up AI Receptionist in 5 Minutes"
        description="Learn how to set up Ringster's AI receptionist for your business in 5 simple steps. Create an account, configure your agent, and go live in minutes."
        canonical="https://ringster.ai/how-it-works"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          "@id": "https://ringster.ai/how-it-works#howto",
          "name": "How to set up Ringster for your business",
          "description": "Set up Ringster to answer business calls, capture leads, and route callers automatically.",
          "totalTime": "PT5M",
          "step": steps.map((s, i) => ({
            "@type": "HowToStep",
            "position": i + 1,
            "name": s.title,
            "text": s.description,
          })),
        }}
      />
      <LandingNav />

      <div className="pt-20">
        {/* Hero */}
        <section className="py-20 md:py-28 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/8 blur-3xl" />
          </div>
          <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              Up and Running in <span className="text-primary">5 Minutes</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10">
              No technical skills required. No complex integrations. Just answer a few questions about your business and your AI receptionist is live.
            </p>
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/signup">Get Started Free</Link>
            </Button>
          </div>
        </section>

        {/* Steps */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mx-auto space-y-16">
              {steps.map((step, i) => (
                <div key={step.num} className="flex gap-6 md:gap-10 items-start">
                  <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <step.icon className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-primary tracking-widest uppercase">Step {step.num}</span>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mt-1 mb-3">{step.title}</h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">{step.description}</p>
                    {i < steps.length - 1 && (
                      <div className="mt-8 ml-8 md:ml-10 h-12 border-l-2 border-dashed border-border" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-primary to-primary/80">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">Ready to Try It Yourself?</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">Start your free trial and have your AI receptionist answering calls in under 5 minutes.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8">
                <Link to="/signup">Start Free Trial</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 border-white/30 text-white hover:bg-white/10">
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
};

export default HowItWorks;
