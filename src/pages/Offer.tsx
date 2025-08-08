
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Mail, CheckCircle, PhoneCall, Globe, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Offer = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save email to waitlist
      const { error } = await supabase.functions.invoke('add-to-waitlist', {
        body: { email }
      });

      if (error) {
        console.error('Error saving to waitlist:', error);
        throw new Error("Error saving to waitlist");
      }
      
      // Set email in session storage to use on thank you page
      sessionStorage.setItem("subscriberEmail", email);
      
      // Navigate to thank you page
      navigate("/ebook-thank-you");
    } catch (error) {
      console.error("Error submitting email:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    { 
      title: "24/7/365 Availability", 
      description: "Never miss an opportunity with round-the-clock service.",
      icon: <PhoneCall className="w-6 h-6 text-primary" />
    },
    { 
      title: "Cost-Effective Solution", 
      description: "Reduce operational costs while maintaining high-quality service.",
      icon: <CheckCircle className="w-6 h-6 text-primary" />
    },
    { 
      title: "Maximized Sales Opportunities", 
      description: "Engage leads promptly and consistently.",
      icon: <CheckCircle className="w-6 h-6 text-primary" />
    },
    { 
      title: "Consistent, High-Quality Interactions", 
      description: "Ensure every call reflects professionalism and efficiency.",
      icon: <CheckCircle className="w-6 h-6 text-primary" />
    }
  ];

  const capabilities = [
    {
      title: "Human-like AI Agents",
      description: "Realistic voices and intelligent speech detection for authentic interactions."
    },
    {
      title: "Global Reach",
      description: "Over 30 languages and diverse accents available."
    },
    {
      title: "Easy Integration",
      description: "Compatible with platforms like MacOS, Windows, Hubspot, and more."
    },
    {
      title: "Scalable Solutions",
      description: "Perfect for businesses of all sizes and industries."
    }
  ];

  const testimonials = [
    {
      quote: "With AI-powered agents, our customer satisfaction has soared. Efficient and always available, it's the best investment we've made.",
      author: "Mitzen Electric Canada"
    },
    {
      quote: "Our sales conversion rates have increased by 35% since implementing AI phone agents. A game-changer for our business!",
      author: "Andrew Foster"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F1F0FB]">
      {/* Header */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <img 
              src="/lovable-uploads/059d2b53-6e4e-4788-a607-2344b4097212.png" 
              alt="Ringster Logo" 
              className="h-20 w-auto cursor-pointer"
            />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#9b87f5]/10 to-[#7E69AB]/10 z-0"></div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1A1F2C] mb-6 leading-tight">
              Unlock the Secret to Hassle-Free Business Calls
            </h1>
            <p className="text-lg md:text-xl text-[#403E43] mb-8 max-w-3xl mx-auto">
              Discover the ultimate solution to streamline your business communications with AI. Introducing "The Ultimate Guide to Streamlining Your Business Calls with AI" — your ticket to efficient, cost-effective, and high-quality phone interactions.
            </p>
            <Button 
              className="bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] hover:opacity-90 text-white px-8 py-6 text-lg rounded-md shadow-lg transition-all"
              onClick={() => {
                const formElement = document.getElementById('download-form');
                formElement?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Download the Free Guide <Download className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1F2C] mb-6">
              Transform Your Business Communication
            </h2>
            <p className="text-lg text-[#403E43] mb-8">
              Are you a small business owner or customer service manager struggling with managing calls efficiently? Our guide offers actionable tips to save time and money, enhancing your customer interactions with ease.
            </p>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-[#1A1F2C]">Why Choose AI-Powered Phone Agents?</h3>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    {feature.icon}
                    <div>
                      <h4 className="font-medium text-[#1A1F2C]">{feature.title}</h4>
                      <p className="text-[#403E43]">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="order-first md:order-last flex justify-center">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] rounded-lg blur-lg opacity-50"></div>
              <div className="relative bg-white p-8 rounded-lg shadow-xl">
                <img 
                  src="/lovable-uploads/2bc59770-92ba-4abb-83fb-3f10afdb837e.png" 
                  alt="Ebook Preview" 
                  className="w-full h-auto rounded-md mb-6"
                />
                <h3 className="text-xl font-semibold mb-4 text-center">Inside the Guide</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center rounded-full bg-[#F1F0FB] p-1 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#9b87f5]" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span>Practical implementation strategies</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center rounded-full bg-[#F1F0FB] p-1 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#9b87f5]" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span>Cost-benefit analysis templates</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center rounded-full bg-[#F1F0FB] p-1 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#9b87f5]" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span>Real-world success stories</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Join the Revolution Section */}
        <div className="mb-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1F2C] mb-6">
            Join the Revolution
          </h2>
          <p className="text-lg text-[#403E43] mb-10 max-w-3xl mx-auto">
            Step into the future with AI-driven customer service automation tools and human-like AI phone agents. Experience seamless integration and performance with our easy-to-use setup.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {capabilities.map((capability, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md h-full">
                <h3 className="text-xl font-semibold mb-3 text-[#1A1F2C]">{capability.title}</h3>
                <p className="text-[#403E43]">{capability.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1F2C] mb-10 text-center">
            Don't Just Take Our Word for It
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg p-8 shadow-md">
                <div className="flex flex-col h-full">
                  <div className="mb-6">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-2xl">★</span>
                    ))}
                  </div>
                  <blockquote className="italic text-lg text-[#403E43] mb-6 flex-grow">
                    "{testimonial.quote}"
                  </blockquote>
                  <footer className="font-medium text-[#1A1F2C]">
                    — {testimonial.author}
                  </footer>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Download Form */}
        <div id="download-form" className="max-w-3xl mx-auto">
          <Card className="bg-white shadow-xl border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl md:text-3xl font-bold text-[#1A1F2C]">
                Ready to Transform Your Phone Support?
              </CardTitle>
              <CardDescription className="text-lg">
                Download "The Ultimate Guide to Streamlining Your Business Calls with AI" today and elevate your business communication. Say goodbye to missed calls and hello to maximized efficiency.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center border rounded-md bg-white p-2 focus-within:ring-2 focus-within:ring-[#9b87f5]">
                  <Mail className="w-5 h-5 text-gray-400 ml-2" />
                  <Input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] hover:opacity-90 transition-opacity py-6 text-lg font-medium"
                >
                  {isSubmitting ? "Processing..." : "Download Now"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="text-center text-gray-500 mt-4">
                  Your Path to Efficient Business Communication Starts Here. Join thousands of satisfied business owners who have already embraced the power of AI.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#1A1F2C] text-white py-10 mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <img 
              src="/lovable-uploads/059d2b53-6e4e-4788-a607-2344b4097212.png" 
              alt="Ringster Logo" 
              className="h-16 w-auto mx-auto mb-6"
            />
            <p className="text-gray-300 max-w-xl mx-auto">
              Providing AI-powered phone agents to help businesses never miss a customer call again. 
              24/7 call handling for small businesses, freelancers, and entrepreneurs.
            </p>
            <div className="mt-6">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} Ringster. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Offer;
