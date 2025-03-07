
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CallToAction = () => {
  return (
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
  );
};

export default CallToAction;
