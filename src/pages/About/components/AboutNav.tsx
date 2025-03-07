
import React from "react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

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
          {isMobile && (
            <Link to="/" className="text-gray-600 hover:text-[#DD2476] transition-colors">
              Home
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default AboutNav;
