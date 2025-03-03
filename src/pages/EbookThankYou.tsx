
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, Calendar, Check, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DemoForm } from "@/components/ebook/DemoForm";

const DEMO_PDF_URL = "/ebook-ai-conversations.pdf"; // Path to your PDF in the public folder

const EbookThankYou = () => {
  const [downloadReady, setDownloadReady] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [showDemoForm, setShowDemoForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get email from session storage
    const subscriberEmail = sessionStorage.getItem("subscriberEmail");
    if (!subscriberEmail) {
      // If no email in session, redirect back to ebook page
      navigate("/ebook");
      return;
    }
    setEmail(subscriberEmail);
    
    // Auto-start download after a short delay
    const timer = setTimeout(() => {
      handleDownload();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleDownload = () => {
    // Create an anchor element and trigger download
    const link = document.createElement("a");
    link.href = DEMO_PDF_URL;
    link.download = "AI-Conversations-Ebook.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Your download has started!");
    
    // Show demo form after download starts
    setShowDemoForm(true);
    
    // Scroll to demo form
    setTimeout(() => {
      document.getElementById('demo-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#F1F0FB] flex flex-col">
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

      <div className="flex-1 container max-w-6xl mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center justify-center rounded-full bg-green-100 p-2 mb-6">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-[#1A1F2C] mb-4">Thank You!</h1>
          <p className="text-lg text-[#403E43]">
            {email ? `We've received your request at ${email}.` : 'We\'ve received your request.'} Your ebook will download in a minute.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <Card className="bg-white shadow-xl border-0 h-full">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[#1A1F2C]">Your Ebook Download</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                {/* This space is reserved for a future video */}
                <div className="w-full h-48 bg-[#F1F0FB] rounded-lg flex items-center justify-center mb-6">
                  <p className="text-center text-gray-500">Video coming soon</p>
                </div>
                
                <p className="text-center mb-6">
                  Your ebook is ready to download now!
                </p>
                <Button 
                  onClick={handleDownload}
                  className="bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] hover:opacity-90 transition-opacity"
                >
                  Download Ebook
                  <ArrowDown className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="bg-white shadow-xl border-0 h-full">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[#1A1F2C]">Book a Demo Call</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-[#F1F0FB] rounded-full flex items-center justify-center mr-4">
                      <span className="font-bold text-[#9b87f5]">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-[#1A1F2C]">Download Your Ebook</h4>
                      <p className="text-sm text-[#403E43]">Your ebook will download automatically</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-[#F1F0FB] rounded-full flex items-center justify-center mr-4">
                      <span className="font-bold text-[#9b87f5]">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-[#1A1F2C]">Schedule a Demo</h4>
                      <p className="text-sm text-[#403E43]">See how our AI solution can help your business</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-[#F1F0FB] rounded-full flex items-center justify-center mr-4">
                      <span className="font-bold text-[#9b87f5]">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-[#1A1F2C]">Transform Your Business</h4>
                      <p className="text-sm text-[#403E43]">Implement AI-powered communication solutions</p>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => {
                    setShowDemoForm(true);
                    setTimeout(() => {
                      document.getElementById('demo-form')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="w-full bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] hover:opacity-90 transition-opacity"
                >
                  Book a Demo Now
                  <Calendar className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {showDemoForm ? (
          <div id="demo-form" className="max-w-4xl mx-auto scroll-mt-24">
            <DemoForm email={email || ""} />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto text-center">
            <div className="p-6 bg-white/50 rounded-lg">
              <Calendar className="h-12 w-12 text-[#9b87f5] mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Ready to see it in action?</h3>
              <p className="mb-4">After downloading your ebook, schedule a personal demo with our team to see how we can help your business.</p>
              <Button 
                variant="outline" 
                className="border-[#9b87f5] text-[#9b87f5]"
                onClick={() => {
                  setShowDemoForm(true);
                  setTimeout(() => {
                    document.getElementById('demo-form')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
              >
                Book a Demo Now
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EbookThankYou;
