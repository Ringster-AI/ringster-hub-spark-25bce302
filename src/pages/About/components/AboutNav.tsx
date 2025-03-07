
import React from "react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const AboutNav = () => {
  const isMobile = useIsMobile();

  return (
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
          
          {isMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px]">
                <div className="mt-6 flex flex-col space-y-4">
                  <Link to="/" className="text-gray-600 hover:text-[#DD2476] transition-colors p-2">
                    Home
                  </Link>
                  <Link to="/about" className="text-gray-600 hover:text-[#DD2476] transition-colors p-2">
                    About
                  </Link>
                  <Link to="/blog" className="text-gray-600 hover:text-[#DD2476] transition-colors p-2">
                    Blog
                  </Link>
                  <Link to="/contact" className="text-gray-600 hover:text-[#DD2476] transition-colors p-2">
                    Contact
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-gray-600 hover:text-[#DD2476] transition-colors">
                Home
              </Link>
              <Link to="/about" className="text-gray-600 hover:text-[#DD2476] transition-colors">
                About
              </Link>
              <Link to="/blog" className="text-gray-600 hover:text-[#DD2476] transition-colors">
                Blog
              </Link>
              <Link to="/contact" className="text-gray-600 hover:text-[#DD2476] transition-colors">
                Contact
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default AboutNav;
