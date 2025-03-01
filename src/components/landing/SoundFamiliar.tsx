
import { Button } from "@/components/ui/button";
import { Check, X, Rocket } from "lucide-react";

export const SoundFamiliar = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-[#F9F8FF] to-[#F1F0FB]">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-3xl mx-auto animate-fade-up">
          <h2 className="text-3xl font-bold tracking-tight text-center text-[#1A1F2C] sm:text-4xl mb-12">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] animate-shine">
              Sound Familiar?
            </span>
          </h2>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-10 border border-[#E9E8FD]">
            <ul className="space-y-6 text-left text-lg mb-12">
              <li className="flex items-start">
                <div className="rounded-full bg-red-100 p-1.5 mr-3 shrink-0">
                  <X className="h-5 w-5 text-red-500" />
                </div>
                <span className="pt-0.5 text-gray-700">Missed calls = missed revenue</span>
              </li>
              <li className="flex items-start">
                <div className="rounded-full bg-red-100 p-1.5 mr-3 shrink-0">
                  <X className="h-5 w-5 text-red-500" />
                </div>
                <span className="pt-0.5 text-gray-700">Constant phone tag & interruptions</span>
              </li>
              <li className="flex items-start">
                <div className="rounded-full bg-red-100 p-1.5 mr-3 shrink-0">
                  <X className="h-5 w-5 text-red-500" />
                </div>
                <span className="pt-0.5 text-gray-700">Too expensive to hire staff</span>
              </li>
            </ul>

            <div className="h-px bg-gradient-to-r from-transparent via-[#D6BCFA] to-transparent my-8"></div>

            <h3 className="text-xl font-semibold text-center text-[#7E69AB] mb-8">
              💡 Ringster AI is built for:
            </h3>
            
            <ul className="space-y-6 text-left text-lg mb-12">
              <li className="flex items-start">
                <div className="rounded-full bg-green-100 p-1.5 mr-3 shrink-0">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <span className="pt-0.5 text-gray-700">Entrepreneurs juggling everything at once</span>
              </li>
              <li className="flex items-start">
                <div className="rounded-full bg-green-100 p-1.5 mr-3 shrink-0">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <span className="pt-0.5 text-gray-700">E-commerce stores that get flooded with order inquiries</span>
              </li>
              <li className="flex items-start">
                <div className="rounded-full bg-green-100 p-1.5 mr-3 shrink-0">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <span className="pt-0.5 text-gray-700">Freelancers & consultants who need to stay focused on work</span>
              </li>
              <li className="flex items-start">
                <div className="rounded-full bg-green-100 p-1.5 mr-3 shrink-0">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <span className="pt-0.5 text-gray-700">Service businesses that rely on bookings & customer inquiries</span>
              </li>
            </ul>
          </div>

          <div className="text-center">
            <Button 
              size="lg"
              className="group px-8 py-6 text-lg rounded-xl shadow-lg bg-gradient-to-r from-[#9B87F5] to-[#6E59A5] hover:from-[#8B5CF6] hover:to-[#7E69AB] transition-all duration-300"
            >
              <Rocket className="mr-2 h-5 w-5 group-hover:animate-bounce" />
              Try It Free – No Credit Card Needed
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
