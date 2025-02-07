
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, ArrowUpRight } from "lucide-react";

export const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#FF512F]/50 to-[#DD2476]/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="absolute inset-0 bg-grid-white/[0.1] bg-grid-8" />

      <div className="container mx-auto px-4 py-24 sm:px-6 lg:px-8 relative">
        <div className="text-center animate-fade-down">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Never Miss a Customer Call Again—
            <span className="block">Let AI Agents Handle It for You</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-white/90 max-w-2xl mx-auto">
            Our AI agents work 24/7 to handle your calls, ensuring you never miss an opportunity.
          </p>
          
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
            <Button 
              size="lg" 
              className="group bg-white text-[#DD2476] hover:bg-white/90 hover:text-[#DD2476] shadow-lg text-lg px-8 py-6"
              onClick={() => window.location.href = '/login'}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white/10"
              onClick={() => window.location.href = 'mailto:admin@ringster.live'}
            >
              Learn More
            </Button>
          </div>

          <div className="mt-16 text-center">
            <p className="text-white/90 font-medium mb-4">Trusted by 100+ businesses</p>
            <div className="flex justify-center items-center gap-8 opacity-70">
              {/* Replace with actual client logos */}
              <div className="w-24 h-12 bg-white/20 rounded-lg"></div>
              <div className="w-24 h-12 bg-white/20 rounded-lg"></div>
              <div className="w-24 h-12 bg-white/20 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
