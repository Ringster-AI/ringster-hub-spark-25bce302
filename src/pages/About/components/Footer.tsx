
import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
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
  );
};

export default Footer;
