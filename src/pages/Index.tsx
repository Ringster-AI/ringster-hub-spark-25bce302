
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { FeaturesAndBenefits } from "@/components/landing/FeaturesAndBenefits";
import { Footer } from "@/components/landing/Footer";
import { SoundFamiliar } from "@/components/landing/SoundFamiliar";
import { Testimonials } from "@/components/landing/Testimonials";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Seo } from "@/components/seo/Seo";
import { Menu } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <main className="overflow-x-hidden">
      <Seo 
        title="Ringster — Never Miss a Customer Call Again" 
        description="AI receptionist that answers calls, qualifies leads, and books appointments 24/7. Built for plumbers, electricians, clinics, realtors, and small business owners who hate missing calls." 
      />
      
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <Link to="/">
              <img 
                src="/lovable-uploads/059d2b53-6e4e-4788-a607-2344b4097212.png" 
                alt="Ringster Logo" 
                className="h-10 sm:h-12 md:h-14 w-auto"
              />
            </Link>
            
            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                About
              </Link>
              <Link to="/roi-calculator" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                ROI Calculator
              </Link>
              <Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                Blog
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                Contact
              </Link>
              <Button asChild variant="outline" size="sm">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/signup">Start Free Trial</Link>
              </Button>
            </div>

            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile nav */}
          {mobileMenuOpen && (
            <div className="md:hidden pt-4 pb-2 border-t border-border mt-3">
              <div className="flex flex-col gap-3">
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors py-2">
                  About
                </Link>
                <Link to="/roi-calculator" className="text-muted-foreground hover:text-primary transition-colors py-2">
                  ROI Calculator
                </Link>
                <Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors py-2">
                  Blog
                </Link>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors py-2">
                  Contact
                </Link>
                <div className="flex gap-3 pt-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild size="sm" className="flex-1">
                    <Link to="/signup">Start Free Trial</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="pt-16 sm:pt-18 md:pt-20">
        <Hero />
        <FeaturesAndBenefits />
        <SoundFamiliar />
        <Features />
        <Testimonials />
        
        {/* FAQ Section */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground">
                Everything you need to know before getting started
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-3">
                <AccordionItem value="sound" className="bg-card rounded-xl border border-border px-6">
                  <AccordionTrigger className="text-foreground hover:text-primary py-4">
                    Does it really sound human?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    Yes! Our AI uses advanced voice synthesis that sounds natural and professional. Most callers can't tell they're talking to AI. Try a demo call yourself and you'll hear the difference.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="setup" className="bg-card rounded-xl border border-border px-6">
                  <AccordionTrigger className="text-foreground hover:text-primary py-4">
                    How long does setup take?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    About 5 minutes. You'll answer a few questions about your business, customize your greeting, and you're live. No technical skills required.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="cost" className="bg-card rounded-xl border border-border px-6">
                  <AccordionTrigger className="text-foreground hover:text-primary py-4">
                    What does it cost?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    Plans start at $49/month for small businesses. That's less than one missed lead for most service businesses. We offer a 7-day free trial with no credit card required.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="transfer" className="bg-card rounded-xl border border-border px-6">
                  <AccordionTrigger className="text-foreground hover:text-primary py-4">
                    What if I need to take an urgent call?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    You set the rules. Ringster can transfer calls to you immediately based on keywords, caller ID, or type of request. Urgent matters get to you right away.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="number" className="bg-card rounded-xl border border-border px-6">
                  <AccordionTrigger className="text-foreground hover:text-primary py-4">
                    Do I need a new phone number?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    You can keep your existing number! We'll forward calls to your Ringster AI, or you can get a new dedicated number. Either way, setup is simple.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="cancel" className="bg-card rounded-xl border border-border px-6">
                  <AccordionTrigger className="text-foreground hover:text-primary py-4">
                    Can I cancel anytime?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    Absolutely. No contracts, no cancellation fees. If Ringster isn't working for your business, you can cancel with one click.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        <FinalCTA />
      </div>
      <Footer />
    </main>
  );
};

export default Index;
