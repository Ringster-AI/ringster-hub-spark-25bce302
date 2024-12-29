import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-indigo-50 to-white">
      <div className="container mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center animate-fade-down">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Automate Your Business with
            <span className="text-primary block">AI Agents</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Ringster's AI agents work 24/7 to handle your tasks, communicate with customers, and scale your operations without human intervention.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg" className="group" onClick={() => window.location.href = '/login'}>
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};