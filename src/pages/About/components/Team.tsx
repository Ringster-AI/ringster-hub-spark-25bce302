
import React from "react";
import { Users } from "lucide-react";

const Team = () => {
  return (
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
  );
};

export default Team;
