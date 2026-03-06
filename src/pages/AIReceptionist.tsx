import { LandingNav } from "@/components/landing/LandingNav";
import { Footer } from "@/components/landing/Footer";
import { Seo } from "@/components/seo/Seo";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Phone, Clock, Users, BarChart3, Shield, Zap, MessageSquare, CalendarCheck } from "lucide-react";

const AIReceptionist = () => {
  const features = [
    { icon: Phone, title: "Instant Call Answering", description: "Every call answered on the first ring. No hold music, no missed opportunities." },
    { icon: Clock, title: "24/7 Availability", description: "Your AI receptionist never sleeps, takes breaks, or calls in sick. Available every hour of every day." },
    { icon: Users, title: "Lead Qualification", description: "Asks the right questions, captures caller details, and routes hot leads to your team instantly." },
    { icon: MessageSquare, title: "Natural Conversations", description: "Advanced voice AI that sounds professional and human. Callers won't know the difference." },
    { icon: CalendarCheck, title: "Appointment Booking", description: "Books appointments directly into your calendar based on your availability rules." },
    { icon: BarChart3, title: "Call Analytics", description: "Full transcripts, call recordings, and performance insights for every interaction." },
    { icon: Shield, title: "Custom Call Routing", description: "Set rules for transfers based on urgency, caller type, time of day, or keywords." },
    { icon: Zap, title: "5-Minute Setup", description: "No technical skills needed. Answer a few questions and your AI receptionist goes live." },
  ];

  return (
    <main className="overflow-x-hidden">
      <Seo
        title="AI Receptionist for Business — Ringster"
        description="Never miss a customer call again. Ringster's AI receptionist answers calls, qualifies leads, books appointments, and routes callers 24/7. Try free."
        canonical="https://ringster.ai/ai-receptionist"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Ringster AI Receptionist",
          "url": "https://ringster.ai/ai-receptionist",
          "applicationCategory": "BusinessApplication",
          "applicationSubCategory": "AI Receptionist Software",
          "operatingSystem": "Cloud",
          "description": "Ringster is an AI-powered phone agent platform that helps businesses answer calls automatically, capture leads, route callers, and provide customer information 24/7.",
          "offers": { "@type": "Offer", "priceCurrency": "USD", "availability": "https://schema.org/InStock", "category": "Subscription" },
          "audience": { "@type": "Audience", "audienceType": "Small Businesses, Service Businesses" }
        }}
      />
      <LandingNav />

      <div className="pt-20">
        {/* Hero */}
        <section className="relative py-20 md:py-32 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
          </div>
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">AI-Powered Phone Agent</span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Your AI Receptionist That <span className="text-primary">Never Misses a Call</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                Stop losing customers to voicemail. Ringster answers every call instantly, captures leads, books appointments, and transfers urgent calls — all on autopilot.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="text-lg px-8">
                  <Link to="/signup">Start Free Trial</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-lg px-8 border-slate-600 text-slate-200 hover:bg-slate-800">
                  <Link to="/how-it-works">See How It Works</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Everything a Great Receptionist Does — Powered by AI</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Built for businesses that can't afford to miss a single call.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {features.map((f) => (
                <div key={f.title} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <f.icon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Compares */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-12">Why Businesses Switch to Ringster</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { label: "Human Receptionist", cost: "$2,500–$4,000/mo", downside: "Limited hours, sick days, turnover" },
                  { label: "Voicemail", cost: "Free", downside: "85% of callers never leave one" },
                  { label: "Ringster AI", cost: "From $39.99/mo", downside: "24/7, instant, never misses a call", highlight: true },
                ].map((item) => (
                  <div key={item.label} className={`rounded-xl p-6 border ${item.highlight ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border bg-card'}`}>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{item.label}</h3>
                    <p className="text-2xl font-bold text-primary mb-2">{item.cost}</p>
                    <p className="text-sm text-muted-foreground">{item.downside}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-primary to-primary/80">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">Ready to Stop Missing Calls?</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">Join thousands of businesses using Ringster to capture every lead and deliver better customer experiences.</p>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <Link to="/signup">Start Your Free Trial</Link>
            </Button>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
};

export default AIReceptionist;
