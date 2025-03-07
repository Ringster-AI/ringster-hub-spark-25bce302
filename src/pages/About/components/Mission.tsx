
import React from "react";
import { Flag } from "lucide-react";

const Mission = () => {
  return (
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
  );
};

export default Mission;
