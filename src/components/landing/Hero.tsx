
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, ArrowUpRight } from "lucide-react";
import { ShinyText } from "@/components/ui/shiny-text";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@supabase/supabase-js";

export const Hero = () => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );

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
      {/* Video Background with Image Fallback */}
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
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="container mx-auto px-4 py-20 sm:px-6 lg:px-8 relative">
        <div className="text-center animate-fade-down">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl animate-glow">
            We Help Small Business—
            <span className="block">Never Miss a Customer Call Again</span>
          </h1>
          <div className="mt-6 text-lg leading-8 max-w-2xl mx-auto">
            <ShinyText 
              text="Our AI agents work 24/7 to handle your calls, ensuring you never miss an opportunity."
              className="text-white/90"
              speed={3}
            />
          </div>
          
          <ul className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-white/90 text-lg">
            <li className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Answer calls 24/7
            </li>
            <li className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5" />
              Reduce missed opportunities
            </li>
            <li className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Seamless call transfers
            </li>
          </ul>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="group bg-white text-[#9b87f5] hover:bg-white/90 hover:text-[#9b87f5] shadow-lg text-lg px-8 py-6"
                >
                  Book a Demo
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Schedule Your Demo</DialogTitle>
                </DialogHeader>
                <div className="w-full aspect-[4/3] relative">
                  <iframe 
                    src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ355HlDqVqRqMSqIYLk2GYEIx1ZJK0W_im36D6KoxxRRUaiIXZ4SSwJcj0XcPnJdVlpMX5uzWxp?gv=true" 
                    className="w-full h-full absolute inset-0"
                    frameBorder="0" 
                    scrolling="no"
                  />
                </div>
              </DialogContent>
            </Dialog>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white bg-transparent hover:bg-white/10 hover:text-white"
              onClick={() => setIsCalendarOpen(true)}
            >
              Learn More
            </Button>
          </div>

          <div className="mt-16">
            <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 border-[#9b87f5] bg-white/10 text-white placeholder:text-white/70"
              />
              <Button 
                type="submit"
                className="bg-[#9b87f5] hover:bg-[#9b87f5]/90 text-white px-8"
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
