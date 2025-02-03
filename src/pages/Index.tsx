import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <main>
      <nav className="fixed w-full top-0 z-50 bg-gradient-to-br from-[#FF512F] to-[#DD2476]">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <img 
              src="/lovable-uploads/059d2b53-6e4e-4788-a607-2344b4097212.png" 
              alt="Ringster Logo" 
              className="h-16 w-auto" // Increased from h-12 to h-16
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
      </div>
    </main>
  );
};

export default Index;