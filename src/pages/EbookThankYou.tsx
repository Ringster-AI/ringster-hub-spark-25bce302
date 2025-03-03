
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, Calendar, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DemoForm } from "@/components/ebook/DemoForm";

const DOWNLOAD_DELAY = 5 * 60 * 1000; // 5 minutes in milliseconds
const DEMO_PDF_URL = "/ebook-ai-conversations.pdf"; // Replace with actual PDF URL

const EbookThankYou = () => {
  const [secondsRemaining, setSecondsRemaining] = useState(DOWNLOAD_DELAY / 1000);
  const [downloadReady, setDownloadReady] = useState(false);
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

    // Set up countdown timer
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setDownloadReady(true);
          // Update the database to mark email as downloaded
          if (subscriberEmail) {
            supabase
              .from('ebook_subscribers')
              .update({ downloaded: true })
              .eq('email', subscriberEmail)
              .then(({ error }) => {
                if (error) console.error("Error updating download status:", error);
              });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
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
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
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

      <div className="flex-1 container max-w-6xl mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center justify-center rounded-full bg-green-100 p-2 mb-6">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-[#1A1F2C] mb-4">Thank You!</h1>
          <p className="text-lg text-[#403E43]">
            {email ? `We've received your request at ${email}.` : 'We\'ve received your request.'} Your ebook will be ready to download in just a moment.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <Card className="bg-white shadow-xl border-0 h-full">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[#1A1F2C]">Your Ebook Download</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                {!downloadReady ? (
                  <>
                    <div className="w-24 h-24 rounded-full bg-[#F1F0FB] flex items-center justify-center mb-6">
                      <span className="text-xl font-semibold">{formatTime(secondsRemaining)}</span>
                    </div>
                    <p className="text-center mb-4">
                      Your download will be ready in <strong>{formatTime(secondsRemaining)}</strong>
                    </p>
                    <Button disabled className="bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] opacity-70">
                      Preparing Download...
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
                      <Check className="h-12 w-12 text-green-600" />
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
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="bg-white shadow-xl border-0 h-full">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[#1A1F2C]">Watch Our Video</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                  {/* Replace this div with actual video component when available */}
                  <p className="text-gray-500">Video will be placed here</p>
                </div>
                <p className="text-center text-[#403E43]">
                  Watch this quick overview of how our AI phone system works
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {showDemoForm ? (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-[#1A1F2C] mb-6 text-center">Book a Personal Demo</h2>
            <p className="text-center text-[#403E43] mb-8">
              Want to see Ringster AI in action? Schedule a personalized demo with our team.
            </p>
            <Card className="bg-white shadow-xl border-0">
              <CardContent className="pt-6">
                <DemoForm email={email || ""} />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto text-center">
            <div className="p-6 bg-white/50 rounded-lg">
              <Calendar className="h-12 w-12 text-[#9b87f5] mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Want to see it in action?</h3>
              <p className="mb-4">After downloading your ebook, you'll have the opportunity to book a personal demo with our team.</p>
              <Button 
                variant="outline" 
                className="border-[#9b87f5] text-[#9b87f5]"
                disabled={!downloadReady}
                onClick={() => setShowDemoForm(true)}
              >
                {downloadReady ? "Book a Demo Now" : "Download First to Book a Demo"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EbookThankYou;
