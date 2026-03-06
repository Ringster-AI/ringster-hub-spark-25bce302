import { LandingNav } from "@/components/landing/LandingNav";
import { Footer } from "@/components/landing/Footer";
import { Seo } from "@/components/seo/Seo";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const faqs = [
  { q: "What is an AI front desk service?", a: "An AI front desk service is a virtual phone assistant that answers incoming calls, responds to common questions, captures caller information, routes calls, and can help book appointments. It gives businesses a way to handle calls 24/7 without needing a full time receptionist." },
  { q: "How does an AI front desk service work?", a: "An AI front desk service answers your business phone using conversational voice technology. It can greet callers, understand what they need, provide business information, collect lead details, transfer calls to the right person, and follow rules you set for your business." },
  { q: "Can an AI front desk answer calls after hours?", a: "Yes. One of the main benefits of an AI front desk service is that it can answer calls 24/7, including evenings, weekends, and holidays. This helps businesses capture leads and support customers even when staff are unavailable." },
  { q: "What types of businesses use AI front desk services?", a: "AI front desk services are commonly used by service businesses such as HVAC companies, plumbers, electricians, clinics, law firms, real estate teams, salons, contractors, and other businesses that need help managing incoming calls and customer inquiries." },
  { q: "Can an AI front desk transfer calls to my team?", a: "Yes. AI front desk services can transfer calls to you or the right team member based on caller needs, business hours, urgency, or custom routing rules. This helps make sure important calls still reach a real person when needed." },
  { q: "Can an AI front desk capture leads and customer details?", a: "Yes. AI front desk services can collect caller names, phone numbers, email addresses, appointment requests, service needs, and other important details. This helps businesses avoid losing leads when staff cannot answer the phone." },
  { q: "Can an AI front desk book appointments?", a: "Many AI front desk services can help with appointment scheduling by collecting booking details or connecting with scheduling workflows. Depending on the setup, the system can qualify the request, confirm availability, and guide callers through the next step." },
  { q: "Will an AI front desk sound natural to callers?", a: "A well configured AI front desk can sound natural, professional, and conversational. Modern voice systems are designed to understand common customer requests and respond in a way that feels helpful and easy to follow." },
  { q: "What questions can an AI front desk answer?", a: "An AI front desk can answer common questions about your business such as hours, services, pricing basics, location, availability, service areas, appointment details, and other frequently asked questions based on the information you provide." },
  { q: "Is an AI front desk better than voicemail?", a: "In most cases, yes. Unlike voicemail, an AI front desk can interact with callers in real time, answer questions, collect useful details, transfer urgent calls, and create a smoother customer experience. This can improve lead capture and reduce missed opportunities." },
  { q: "How much does an AI front desk service cost?", a: "Pricing varies by provider and usage, but AI front desk services are often more affordable than hiring full time front desk staff. Costs typically depend on factors like call volume, features, number of agents, and integrations." },
  { q: "Can an AI front desk be customized for my business?", a: "Yes. AI front desk services can usually be customized with your business name, greeting, services, call routing rules, frequently asked questions, lead intake flow, and escalation instructions so the experience matches how your business operates." },
  { q: "Can an AI front desk help reduce missed calls?", a: "Yes. AI front desk services are designed to answer calls instantly, which helps businesses reduce missed calls, improve response times, and capture more leads from customers who might otherwise hang up or call a competitor." },
  { q: "Is an AI front desk service hard to set up?", a: "Setup is usually straightforward. Most AI front desk services only need your business information, call handling preferences, and transfer rules to get started. More advanced setups can include appointment flows, lead qualification, and custom integrations." },
];

const FAQ = () => {
  return (
    <main className="overflow-x-hidden">
      <Seo
        title="FAQ — AI Receptionist Questions Answered | Ringster"
        description="Get answers to common questions about AI receptionist services: how they work, what they cost, setup time, call routing, lead capture, and more."
        canonical="https://ringster.ai/faq"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map((f) => ({
            "@type": "Question",
            "name": f.q,
            "acceptedAnswer": { "@type": "Answer", "text": f.a },
          })),
        }}
      />
      <LandingNav />

      <div className="pt-20">
        <section className="py-20 md:py-28 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full bg-primary/8 blur-3xl" />
          </div>
          <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              Frequently Asked <span className="text-primary">Questions</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
              Everything you need to know about AI receptionists and how Ringster works for your business.
            </p>
          </div>
        </section>

        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-3">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="bg-card rounded-xl border border-border px-6">
                    <AccordionTrigger className="text-foreground hover:text-primary py-4 text-left">{faq.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-r from-primary to-primary/80">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">Still Have Questions?</h2>
            <p className="text-primary-foreground/80 mb-8">Our team is happy to help. Reach out anytime.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary"><Link to="/contact">Contact Us</Link></Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10"><Link to="/signup">Try Ringster Free</Link></Button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
};

export default FAQ;
