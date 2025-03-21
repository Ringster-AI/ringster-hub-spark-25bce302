
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, DollarSign, Zap, Bot, TrendingUp, CheckCheck, Wrench, ThumbsUp, Plug2 } from "lucide-react";
import { Link } from "react-router-dom";

export const FeaturesAndBenefits = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1F2C] mb-4">
            Features & Benefits
          </h2>
          <p className="text-xl text-gray-600">
            Transform your business with Ringster—automate, optimize, and excel.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="space-y-6 animate-fade-up">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 rounded-full p-2 bg-gradient-to-r from-[#FF512F] to-[#DD2476]">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#1A1F2C] mb-2">24/7/365 Availability</h3>
                <p className="text-gray-600">Our AI customer service tools ensure you never miss a call, providing consistent and high-quality interactions day and night.</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 rounded-full p-2 bg-gradient-to-r from-[#FF512F] to-[#DD2476]">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#1A1F2C] mb-2">Cost-Effective Solution</h3>
                <p className="text-gray-600">An affordable alternative to human staff, Ringster helps you save significantly on operational costs.</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 rounded-full p-2 bg-gradient-to-r from-[#FF512F] to-[#DD2476]">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#1A1F2C] mb-2">Customizable for Your Brand</h3>
                <p className="text-gray-600">Tailor greetings and call flows to reflect your unique business identity, enhancing customer experience.</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 rounded-full p-2 bg-gradient-to-r from-[#FF512F] to-[#DD2476]">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#1A1F2C] mb-2">Human-like AI Phone Agents</h3>
                <p className="text-gray-600">With intelligent speech detection and human-like voices, engage your customers seamlessly and professionally.</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-6 animate-fade-up delay-100">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 rounded-full p-2 bg-gradient-to-r from-[#FF512F] to-[#DD2476]">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#1A1F2C] mb-2">Maximized Sales Opportunities</h3>
                <p className="text-gray-600">Automate calls with AI phone agents to handle inbound calls, freeing up your team to focus on closing deals.</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 rounded-full p-2 bg-gradient-to-r from-[#FF512F] to-[#DD2476]">
                <CheckCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#1A1F2C] mb-2">Consistent, High-Quality Interactions</h3>
                <p className="text-gray-600">Ensure your customers always receive the best service with our reliable AI solutions.</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 rounded-full p-2 bg-gradient-to-r from-[#FF512F] to-[#DD2476]">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#1A1F2C] mb-2">Instant Setup</h3>
                <p className="text-gray-600">Easy setup in minutes with no tech skills needed, so you can get started right away.</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 rounded-full p-2 bg-gradient-to-r from-[#FF512F] to-[#DD2476]">
                <Plug2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#1A1F2C] mb-2">Seamless Integration</h3>
                <p className="text-gray-600">Compatible with MacOS, Windows, and integrates with GHL, Hubspot, CX, ERPs, and 3000+ apps.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Testimonial and CTA */}
        <Card className="overflow-hidden bg-gradient-to-r from-[#1A1F2C] to-[#222222] border-0 shadow-2xl mb-16">
          <CardContent className="p-8 md:p-12">
            <div className="text-center space-y-6 max-w-2xl mx-auto">
              <blockquote className="text-2xl md:text-3xl italic font-medium text-white">
                "Ringster saved us $500/month!"
              </blockquote>
              <p className="text-xl text-gray-300">– Family Dental</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Founder's Discount */}
        <div className="bg-[#F1F0FB] rounded-lg p-8 md:p-12 text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1A1F2C] mb-4">
            Claim Your Founders Discount - Up to 65% OFF!
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            No long-term commitment - Cancel Anytime!
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-[#FF512F] to-[#DD2476] flex items-center justify-center mx-auto mb-4">
                <ThumbsUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#1A1F2C] mb-2">Start Your Free Trial</h3>
              <p className="text-gray-600">Experience the power of Ringster's AI phone agents today.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-[#FF512F] to-[#DD2476] flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#1A1F2C] mb-2">Easy Setup</h3>
              <p className="text-gray-600">Get going in minutes with no technical expertise required.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-[#FF512F] to-[#DD2476] flex items-center justify-center mx-auto mb-4">
                <Plug2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#1A1F2C] mb-2">Seamless Integration</h3>
              <p className="text-gray-600">Compatible with MacOS, Windows, and integrates with popular business tools.</p>
            </div>
          </div>
          
          <div className="mt-10">
            <Button 
              size="lg" 
              className="bg-[#DD2476] hover:bg-[#DD2476]/90 text-white gap-2 text-lg py-6 px-8"
              asChild
            >
              <Link to="/signup">
                Join the Revolution Today
              </Link>
            </Button>
          </div>
          
          <p className="mt-6 text-gray-600">
            Join the revolution of AI customer service tools with Ringster, providing human-like AI phone agents who deliver unmatched efficiency and professionalism.
          </p>
        </div>
      </div>
    </section>
  );
};
