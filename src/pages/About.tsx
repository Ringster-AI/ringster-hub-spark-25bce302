import { ArrowRight, Briefcase, Flag, Heart, Lightbulb, PhoneCall, Shield, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const About = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-[#F1F0FB] overflow-x-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <Link to="/">
              <img 
                src="/lovable-uploads/059d2b53-6e4e-4788-a607-2344b4097212.png" 
                alt="Ringster Logo" 
                className="h-12 sm:h-16 md:h-20 w-auto cursor-pointer"
              />
            </Link>
            {isMobile && (
              <Link to="/" className="text-gray-600 hover:text-[#DD2476] transition-colors">
                Home
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-28 md:pt-32 pb-10 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1A1F2C] mb-4 sm:mb-6">
            About Ringster
          </h1>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg sm:text-xl text-[#403E43] mb-6 sm:mb-8">
              We help small businesses never miss a call again.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <p className="text-base sm:text-lg text-[#403E43] mb-6 sm:mb-8">
              As an entrepreneur, you wear many hats, and the phone should never be one of them. 
              That's why we created Ringster—your 24/7 AI-powered phone agent. We believe in giving 
              you the freedom to focus on what you do best, while we handle the calls, texts, and more.
            </p>
          </div>

          {/* What We Do */}
          <div className="max-w-4xl mx-auto my-10 sm:my-16">
            <div className="flex items-center mb-6 sm:mb-8">
              <div className="bg-[#9b87f5] p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
                <PhoneCall className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1A1F2C]">What We Do</h2>
            </div>
            
            <p className="text-base sm:text-lg text-[#403E43] mb-6 sm:mb-8">
              Ringster is a smart, scalable solution designed to handle your business calls like a pro. 
              Whether you're a small business owner, a freelancer, or a consultant, we take the pressure 
              off answering every call, so you can keep growing without the hassle.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 sm:gap-8 mt-8 sm:mt-12">
              <div className="bg-[#F1F0FB] p-4 sm:p-6 rounded-lg">
                <div className="flex items-start mb-3 sm:mb-4">
                  <div className="bg-[#9b87f5] p-1.5 sm:p-2 rounded-full mr-3 sm:mr-4 mt-0.5 sm:mt-1">
                    <PhoneCall className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#1A1F2C] mb-1 sm:mb-2">
                      Answer calls 24/7
                    </h3>
                    <p className="text-sm sm:text-base text-[#403E43]">
                      Because we know your business doesn't sleep.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#F1F0FB] p-4 sm:p-6 rounded-lg">
                <div className="flex items-start mb-3 sm:mb-4">
                  <div className="bg-[#9b87f5] p-1.5 sm:p-2 rounded-full mr-3 sm:mr-4 mt-0.5 sm:mt-1">
                    <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#1A1F2C] mb-1 sm:mb-2">
                      Professional Customer Experiences
                    </h3>
                    <p className="text-sm sm:text-base text-[#403E43]">
                      Without the wait or missed opportunities.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#F1F0FB] p-4 sm:p-6 rounded-lg">
                <div className="flex items-start mb-3 sm:mb-4">
                  <div className="bg-[#9b87f5] p-1.5 sm:p-2 rounded-full mr-3 sm:mr-4 mt-0.5 sm:mt-1">
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#1A1F2C] mb-1 sm:mb-2">
                      Seamless Call Transfers
                    </h3>
                    <p className="text-sm sm:text-base text-[#403E43]">
                      Keeping customers happy and moving forward.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#F1F0FB] p-4 sm:p-6 rounded-lg">
                <div className="flex items-start mb-3 sm:mb-4">
                  <div className="bg-[#9b87f5] p-1.5 sm:p-2 rounded-full mr-3 sm:mr-4 mt-0.5 sm:mt-1">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#1A1F2C] mb-1 sm:mb-2">
                      Integrates With Your Tools
                    </h3>
                    <p className="text-sm sm:text-base text-[#403E43]">
                      So you don't miss a beat with your current setup.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mission */}
          <div className="max-w-4xl mx-auto my-10 sm:my-16">
            <div className="flex items-center mb-6 sm:mb-8">
              <div className="bg-[#9b87f5] p-3 rounded-full mr-3 sm:mr-4">
                <Flag className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1A1F2C]">Our Mission</h2>
            </div>
            
            <p className="text-base sm:text-lg text-[#403E43] mb-6 sm:mb-8">
              We aim to empower small businesses to operate as efficiently as the big guys—without the stress, 
              expensive hires, or complicated systems. We want to help you improve your productivity, increase 
              your revenue, and enhance the customer experience—all with the power of AI.
            </p>
          </div>

          {/* Values */}
          <div className="max-w-4xl mx-auto my-10 sm:my-16">
            <div className="flex items-center mb-6 sm:mb-8">
              <div className="bg-[#9b87f5] p-3 rounded-full mr-3 sm:mr-4">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1A1F2C]">Our Values</h2>
            </div>
            
            <div className="grid sm:grid-cols-3 gap-8 mt-8 sm:mt-12">
              <div className="text-center p-6">
                <div className="bg-[#F1F0FB] p-4 rounded-full inline-flex mb-4">
                  <Lightbulb className="h-8 w-8 text-[#9b87f5]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1A1F2C] mb-2">Innovation</h3>
                <p className="text-[#403E43]">
                  We're always looking for ways to make things smarter, faster, and more reliable.
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="bg-[#F1F0FB] p-4 rounded-full inline-flex mb-4">
                  <Briefcase className="h-8 w-8 text-[#9b87f5]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1A1F2C] mb-2">Efficiency</h3>
                <p className="text-[#403E43]">
                  We know your time is valuable, which is why we designed Ringster to be as easy as possible to use.
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="bg-[#F1F0FB] p-4 rounded-full inline-flex mb-4">
                  <TrendingUp className="h-8 w-8 text-[#9b87f5]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1A1F2C] mb-2">Scalability</h3>
                <p className="text-[#403E43]">
                  Whether you're just getting started or growing fast, Ringster grows with you.
                </p>
              </div>
            </div>
          </div>

          {/* Team */}
          <div className="max-w-4xl mx-auto my-10 sm:my-16">
            <div className="flex items-center mb-6 sm:mb-8">
              <div className="bg-[#9b87f5] p-3 rounded-full mr-3 sm:mr-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1A1F2C]">Meet the Team</h2>
            </div>
            
            <p className="text-base sm:text-lg text-[#403E43] mb-12">
              Ringster is powered by a passionate team of innovators, tech enthusiasts, and problem 
              solvers who love what they do. We understand small business pain points because we've 
              been there too—and we're on a mission to make running your business smoother.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 sm:py-16 bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] text-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">
            Let us handle the phones. You've got a business to run.
          </h2>
          <div className="flex justify-center gap-3 sm:gap-4 flex-wrap">
            <Link to="/ebook">
              <Button className="bg-white text-[#9b87f5] hover:bg-gray-100 text-sm sm:text-base">
                Get Our Ebook
              </Button>
            </Link>
            <Link to="/contact">
              <Button className="bg-transparent border-2 border-white hover:bg-white/10 text-sm sm:text-base">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer (simplified version, matching other pages) */}
      <footer className="bg-[#1A1F2C] text-white py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
              <img 
                src="/lovable-uploads/059d2b53-6e4e-4788-a607-2344b4097212.png" 
                alt="Ringster Logo" 
                className="h-10 sm:h-12 w-auto"
              />
              <p className="mt-3 sm:mt-4 text-gray-400 text-sm sm:text-base">
                Your AI-powered phone solution
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
              <div>
                <h3 className="font-semibold mb-3 sm:mb-4 text-center sm:text-left">Links</h3>
                <ul className="space-y-2 text-center sm:text-left">
                  <li><Link to="/" className="text-gray-400 hover:text-white text-sm sm:text-base">Home</Link></li>
                  <li><Link to="/about" className="text-gray-400 hover:text-white text-sm sm:text-base">About</Link></li>
                  <li><Link to="/blog" className="text-gray-400 hover:text-white text-sm sm:text-base">Blog</Link></li>
                  <li><Link to="/contact" className="text-gray-400 hover:text-white text-sm sm:text-base">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 sm:mb-4 text-center sm:text-left">Legal</h3>
                <ul className="space-y-2 text-center sm:text-left">
                  <li><Link to="/privacy" className="text-gray-400 hover:text-white text-sm sm:text-base">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="text-gray-400 hover:text-white text-sm sm:text-base">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} Ringster. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
