
import React from "react";
import { PhoneCall, Heart, ArrowRight, Shield } from "lucide-react";

const WhatWeDo = () => {
  return (
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
  );
};

export default WhatWeDo;
