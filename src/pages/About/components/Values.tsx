
import React from "react";
import { Heart, Lightbulb, Briefcase, TrendingUp } from "lucide-react";

const Values = () => {
  return (
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
  );
};

export default Values;
