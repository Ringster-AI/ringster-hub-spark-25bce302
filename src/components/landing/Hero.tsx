
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, ArrowUpRight } from "lucide-react";
import { ShinyText } from "@/components/ui/shiny-text";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

export const Hero = () => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleBookDemo = () => {
    // Track the 'Book Demo' event with Facebook Pixel
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Lead', {
        content_name: 'Book Demo Click',
        content_category: 'Demo Request'
      });
    }
  };

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('add-to-waitlist', {
        body: { email }
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "You've been added to our waitlist. We'll be in touch soon!",
      });
      setEmail("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join waitlist. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden min-h-screen">
      <div className="absolute inset-0 w-full h-full">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          poster="/lovable-uploads/backgroundimage.png"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/lovable-uploads/backgroundvideo.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="container mx-auto px-4 py-16 sm:py-20 relative">
        <div className="text-center animate-fade-down max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white animate-glow">
            We Help Small Business—
            <span className="block mt-2">Never Miss a Customer Call Again</span>
          </h1>
          <div className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 max-w-2xl mx-auto">
            <ShinyText 
              text="24/7 AI-powered call handling for small businesses, freelancers, and entrepreneurs—answering calls, booking appointments, and capturing leads so you don't have to."
              className="text-white/90"
              speed={3}
            />
          </div>
          
          <ul className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-white/90 text-base sm:text-lg">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
              Answer calls 24/7
            </li>
            <li className="flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5" />
              Reduce missed opportunities
            </li>
            <li className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              Seamless call transfers
            </li>
          </ul>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <DialogTrigger asChild>
                <Button 
                  size={isMobile ? "default" : "lg"} 
                  className="group bg-white text-[#9b87f5] hover:bg-white/90 hover:text-[#9b87f5] shadow-lg text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-6 w-full sm:w-auto"
                  onClick={handleBookDemo}
                >
                  Book a Demo
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Schedule Your Demo</DialogTitle>
                </DialogHeader>
                <div className="w-full aspect-[4/3] relative">
                  <iframe 
                    src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ355HlDqVqRqMSqIYLk2GYEIx1ZJK0W_im36D6KoxxRRUaiIXZ4SSwJcj0XcPnJdVlpMX5uzWxp?gv=true" 
                    className="w-full h-full absolute inset-0"
                    frameBorder="0" 
                    scrolling="yes"
                  />
                </div>
              </DialogContent>
            </Dialog>
            <Button 
              variant="outline" 
              size={isMobile ? "default" : "lg"} 
              className="border-white text-white bg-transparent hover:bg-white/10 hover:text-white w-full sm:w-auto"
              onClick={() => setIsCalendarOpen(true)}
            >
              Learn More
            </Button>
          </div>

          <div className="mt-12 sm:mt-16">
            <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 border-[#9b87f5] bg-white/10 text-white placeholder:text-white/70 w-full"
              />
              <Button 
                type="submit"
                className="bg-[#9b87f5] hover:bg-[#9b87f5]/90 text-white px-6 sm:px-8 w-full sm:w-auto"
                disabled={isSubmitting}
              >
                Join Waitlist
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
