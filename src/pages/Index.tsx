import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Index = () => {
  return (
    <main>
      <nav className="fixed w-full top-0 z-50 bg-gradient-to-br from-[#FF512F] to-[#DD2476]">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <img 
              src="/lovable-uploads/059d2b53-6e4e-4788-a607-2344b4097212.png" 
              alt="Ringster Logo" 
              className="h-20 w-auto" // Increased from h-16 to h-20
            />
            <div className="flex gap-4">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/10"
                onClick={() => window.location.href = '/login'}
              >
                Login
              </Button>
              <Button 
                variant="outline" 
                className="text-[#DD2476] bg-white border-white hover:bg-white/90 hover:text-[#DD2476]"
                onClick={() => window.location.href = '/signup'}
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <div className="pt-20">
        <Hero />
        <Features />
        
        {/* FAQ Section */}
        <section className="py-16 bg-[#F1F0FB]">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12 text-[#1A1F2C]">Frequently Asked Questions</h2>
            
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="affiliate" className="bg-white rounded-lg border border-[#C8C8C9] px-6">
                  <AccordionTrigger className="text-[#222222] hover:text-[#DD2476]">
                    Do you have an Affiliate Partner Program?
                  </AccordionTrigger>
                  <AccordionContent className="text-[#403E43]">
                    Yes, we do. To become an affiliate partner,{" "}
                    <a href="#" className="text-[#DD2476] hover:underline">click here</a>
                    {" "}and fill out your application. You'll receive an email shortly confirming if you were accepted, along with access details to the partner portal if approved.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="whitelabel" className="bg-white rounded-lg border border-[#C8C8C9] px-6">
                  <AccordionTrigger className="text-[#222222] hover:text-[#DD2476]">
                    Can I Whitelabel Ringster?
                  </AccordionTrigger>
                  <AccordionContent className="text-[#403E43]">
                    Yes. With the Agency VIP plan, you can enable whitelabel mode and customize Ringster with your logo, URL, and branding across the entire platform—including our native notifications.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="gohighlevel" className="bg-white rounded-lg border border-[#C8C8C9] px-6">
                  <AccordionTrigger className="text-[#222222] hover:text-[#DD2476]">
                    Can I connect multiple GoHighLevel sub-accounts?
                  </AccordionTrigger>
                  <AccordionContent className="text-[#403E43]">
                    Yes. You can connect one GoHighLevel sub-account per Ringster Workspace. Just head over to "Integrations," find the GoHighLevel section, and click "Connect." Then select the sub-account you'd like to link.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="installation" className="bg-white rounded-lg border border-[#C8C8C9] px-6">
                  <AccordionTrigger className="text-[#222222] hover:text-[#DD2476]">
                    Do I need to install Ringster?
                  </AccordionTrigger>
                  <AccordionContent className="text-[#403E43]">
                    No, you don't need to download or install anything. Ringster is a cloud-based app, meaning it's hosted online and can be accessed from any device at any time.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="sales" className="bg-white rounded-lg border border-[#C8C8C9] px-6">
                  <AccordionTrigger className="text-[#222222] hover:text-[#DD2476]">
                    Can I use Ringster for Sales Calls?
                  </AccordionTrigger>
                  <AccordionContent className="text-[#403E43]">
                    Absolutely! Ringster is designed to enhance sales calls with AI-powered agents that engage customers, answer questions, and help close deals efficiently.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="support" className="bg-white rounded-lg border border-[#C8C8C9] px-6">
                  <AccordionTrigger className="text-[#222222] hover:text-[#DD2476]">
                    Can I use Ringster for Customer Support?
                  </AccordionTrigger>
                  <AccordionContent className="text-[#403E43]">
                    Yes! Ringster is perfect for customer support, allowing you to automate responses, handle inquiries, and assist customers quickly and effectively.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="integration" className="bg-white rounded-lg border border-[#C8C8C9] px-6">
                  <AccordionTrigger className="text-[#222222] hover:text-[#DD2476]">
                    Can I integrate Ringster with other tools or platforms?
                  </AccordionTrigger>
                  <AccordionContent className="text-[#403E43]">
                    Yes, Ringster offers flexible integration options to connect seamlessly with your existing tools and platforms. Whether it's CRM software, helpdesk systems, or communication channels, Ringster can enhance your workflow and boost productivity.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="support-offered" className="bg-white rounded-lg border border-[#C8C8C9] px-6">
                  <AccordionTrigger className="text-[#222222] hover:text-[#DD2476]">
                    What kind of support does Ringster offer?
                  </AccordionTrigger>
                  <AccordionContent className="text-[#403E43]">
                    Ringster provides comprehensive support to assist you at every step. Our dedicated support team is ready to help with any questions, concerns, or technical issues. You can reach us via email at support@ringster.ai or through our online chat feature within the platform.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Index;