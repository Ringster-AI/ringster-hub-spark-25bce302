import { LandingNav } from "@/components/landing/LandingNav";
import { Footer } from "@/components/landing/Footer";
import { Seo } from "@/components/seo/Seo";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Phone, Clock, DollarSign, CalendarCheck, MessageSquare, TrendingUp } from "lucide-react";

interface IndustryConfig {
  slug: string;
  industry: string;
  headline: string;
  subheadline: string;
  painPoints: { title: string; description: string }[];
  faqs: { q: string; a: string }[];
  stats: { value: string; label: string }[];
}

const industries: Record<string, IndustryConfig> = {
  plumbers: {
    slug: "ai-receptionist-for-plumbers",
    industry: "Plumbing",
    headline: "Stop Losing Emergency Plumbing Calls to Voicemail",
    subheadline: "When a pipe bursts at 2 AM, your customer calls the first plumber who answers. With Ringster, that's always you.",
    painPoints: [
      { title: "Missing calls while on the job", description: "You're under a house fixing a leak and can't answer the phone. Ringster handles the call, captures the details, and texts you the lead." },
      { title: "After-hours emergencies go to competitors", description: "Emergency calls at night or weekends are your highest-value jobs. Ringster answers 24/7 and can dispatch urgent calls to your on-call team." },
      { title: "No time to return calls", description: "By the time you call back, the homeowner already booked someone else. Ringster qualifies leads in real time so you never lose a job." },
    ],
    faqs: [
      { q: "Can Ringster handle emergency plumbing calls?", a: "Yes. You can configure Ringster to detect emergency keywords like 'burst pipe,' 'flooding,' or 'no water' and immediately transfer those calls to your on-call team." },
      { q: "Will it know my service area?", a: "Absolutely. You provide your service area details and Ringster will inform callers whether you cover their location." },
      { q: "Can it give plumbing estimates?", a: "Ringster can share general pricing ranges you define, like 'drain cleaning typically starts at $150,' and capture details for a custom quote." },
      { q: "Does it work with my scheduling software?", a: "Ringster integrates with Google Calendar and can capture booking requests that sync with your workflow." },
    ],
    stats: [
      { value: "62%", label: "of plumbing calls go unanswered during jobs" },
      { value: "$250+", label: "average value of a missed plumbing lead" },
      { value: "3 min", label: "average time before a caller tries another plumber" },
    ],
  },
  hvac: {
    slug: "ai-receptionist-for-hvac",
    industry: "HVAC",
    headline: "Never Miss an HVAC Service Call Again",
    subheadline: "When a homeowner's AC breaks in July, they're calling every company until someone picks up. Make sure it's your AI receptionist.",
    painPoints: [
      { title: "Peak season overwhelms your front desk", description: "Summer and winter demand surges flood your phone lines. Ringster handles unlimited simultaneous calls so every customer gets through." },
      { title: "Dispatchers can't keep up", description: "Your team is buried in scheduling while the phone keeps ringing. Ringster captures service requests and qualifies urgency automatically." },
      { title: "Losing after-hours maintenance contracts", description: "Property managers and commercial clients call outside business hours. Ringster answers professionally and captures contract inquiries 24/7." },
    ],
    faqs: [
      { q: "Can Ringster triage HVAC emergencies?", a: "Yes. Configure urgency rules based on keywords like 'no heat,' 'gas smell,' or 'system down.' Emergency calls get transferred immediately." },
      { q: "Can it handle seasonal call spikes?", a: "Ringster scales instantly. Whether you get 10 calls or 1,000 in a day, every one is answered on the first ring." },
      { q: "Will it capture equipment details?", a: "Yes. Ringster can ask about system type, age, last service date, and symptoms to give your techs a head start." },
      { q: "Does it work for commercial HVAC?", a: "Absolutely. You can configure separate flows for residential and commercial callers with different routing and qualification rules." },
    ],
    stats: [
      { value: "78%", label: "of HVAC customers call the first company that answers" },
      { value: "$400+", label: "average revenue per HVAC service call" },
      { value: "40%", label: "of calls come outside business hours" },
    ],
  },
  electricians: {
    slug: "ai-receptionist-for-electricians",
    industry: "Electrical",
    headline: "Your Electrical Business Deserves an AI That Answers Every Call",
    subheadline: "When a breaker trips or outlets stop working, homeowners want answers fast. Ringster picks up instantly and captures every lead.",
    painPoints: [
      { title: "Missing calls during installations", description: "You're wiring a panel and can't answer the phone. Ringster captures the caller's issue, contact info, and urgency level." },
      { title: "Emergency calls going to voicemail", description: "Power outages and electrical hazards can't wait. Ringster detects emergencies and transfers them to your on-call electrician immediately." },
      { title: "Losing bids to faster responders", description: "Contractors who respond first win the job. Ringster qualifies leads in real time and sends you the details instantly." },
    ],
    faqs: [
      { q: "Can Ringster handle electrical emergency calls?", a: "Yes. Keywords like 'sparking,' 'power out,' 'burning smell,' or 'electrical fire' trigger immediate transfer to your emergency contact." },
      { q: "Will it explain my licensing and insurance?", a: "You provide your credentials and Ringster shares them with callers who ask, building trust before you even speak to them." },
      { q: "Can it quote electrical work?", a: "Ringster shares the price ranges you define — like 'panel upgrades typically start at $1,500' — and captures project details for custom quotes." },
      { q: "Does it handle both residential and commercial?", a: "Yes. Configure separate call flows, greetings, and routing rules for residential homeowners versus commercial property managers." },
    ],
    stats: [
      { value: "55%", label: "of electrical leads lost to unanswered calls" },
      { value: "$350+", label: "average revenue per electrical service call" },
      { value: "5 min", label: "window before a homeowner calls the next electrician" },
    ],
  },
};

const IndustryLanding = ({ industryKey }: { industryKey: "plumbers" | "hvac" | "electricians" }) => {
  const config = industries[industryKey];
  const features = [
    { icon: Phone, title: "Instant Call Answering", desc: "Every call answered on the first ring, even during peak hours." },
    { icon: Clock, title: "24/7 Coverage", desc: "Nights, weekends, holidays — your phone is always covered." },
    { icon: DollarSign, title: "Lead Qualification", desc: "Captures name, address, issue, and urgency from every caller." },
    { icon: CalendarCheck, title: "Appointment Scheduling", desc: "Books service calls directly based on your team's availability." },
    { icon: MessageSquare, title: "Custom Scripts", desc: `Trained on your ${config.industry.toLowerCase()} business specifics.` },
    { icon: TrendingUp, title: "Performance Analytics", desc: "Track call volume, lead quality, and conversion rates." },
  ];

  return (
    <main className="overflow-x-hidden">
      <Seo
        title={`AI Receptionist for ${config.industry} Companies — Ringster`}
        description={`${config.industry} businesses lose revenue to missed calls. Ringster's AI receptionist answers every call, captures leads, and books jobs 24/7. Try free.`}
        canonical={`https://ringster.ai/${config.slug}`}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": `Ringster AI Receptionist for ${config.industry}`,
            "url": `https://ringster.ai/${config.slug}`,
            "description": `AI-powered phone answering service designed for ${config.industry.toLowerCase()} businesses. Answers calls, captures leads, books appointments 24/7.`,
            "provider": { "@type": "Organization", "name": "Ringster", "url": "https://ringster.ai" },
            "serviceType": "AI Receptionist",
            "areaServed": "US",
            "audience": { "@type": "Audience", "audienceType": `${config.industry} Companies, ${config.industry} Contractors` },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": config.faqs.map((f) => ({
              "@type": "Question",
              "name": f.q,
              "acceptedAnswer": { "@type": "Answer", "text": f.a },
            })),
          },
        ]}
      />
      <LandingNav />

      <div className="pt-20">
        {/* Hero */}
        <section className="py-20 md:py-32 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute -top-1/3 -right-1/4 w-[700px] h-[700px] rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
          </div>
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                Built for {config.industry} Businesses
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">{config.headline}</h1>
              <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">{config.subheadline}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="text-lg px-8"><Link to="/signup">Start Free Trial</Link></Button>
                <Button asChild size="lg" variant="outline" className="text-lg px-8 border-slate-600 text-slate-200 hover:bg-slate-800">
                  <Link to="/how-it-works">See How It Works</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-primary/5 border-y border-border">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
              {config.stats.map((s) => (
                <div key={s.label}>
                  <div className="text-4xl font-bold text-primary mb-1">{s.value}</div>
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pain Points */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-4">
              Sound Familiar?
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
              These are the problems {config.industry.toLowerCase()} businesses face every day. Ringster solves them all.
            </p>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {config.painPoints.map((p) => (
                <div key={p.title} className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4 sm:px-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-12">
              What Ringster Does for Your {config.industry} Business
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {features.map((f) => (
                <div key={f.title} className="bg-card border border-border rounded-xl p-6">
                  <f.icon className="h-8 w-8 text-primary mb-3" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">
              {config.industry} AI Receptionist FAQ
            </h2>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-3">
                {config.faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="bg-card rounded-xl border border-border px-6">
                    <AccordionTrigger className="text-foreground hover:text-primary py-4 text-left">{faq.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-primary to-primary/80">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Capture Every {config.industry} Lead?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Start your free trial and have your AI receptionist answering calls in under 5 minutes.
            </p>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <Link to="/signup">Start Free Trial</Link>
            </Button>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
};

export default IndustryLanding;
