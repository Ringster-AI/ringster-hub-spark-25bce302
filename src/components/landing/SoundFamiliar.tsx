
import { Button } from "@/components/ui/button";
import { Check, X, Rocket } from "lucide-react";

export const SoundFamiliar = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12 animate-fade-up">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-10">
            Sound Familiar?
          </h2>
          
          <ul className="space-y-4 text-left text-lg mb-12">
            <li className="flex items-start">
              <X className="h-6 w-6 text-red-500 mr-2 shrink-0 mt-0.5" />
              <span>Missed calls = missed revenue</span>
            </li>
            <li className="flex items-start">
              <X className="h-6 w-6 text-red-500 mr-2 shrink-0 mt-0.5" />
              <span>Constant phone tag & interruptions</span>
            </li>
            <li className="flex items-start">
              <X className="h-6 w-6 text-red-500 mr-2 shrink-0 mt-0.5" />
              <span>Too expensive to hire staff</span>
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-[#DD2476] mb-6">
            💡 Ringster AI is built for:
          </h3>
          
          <ul className="space-y-4 text-left text-lg mb-12">
            <li className="flex items-start">
              <Check className="h-6 w-6 text-green-500 mr-2 shrink-0 mt-0.5" />
              <span>Entrepreneurs juggling everything at once</span>
            </li>
            <li className="flex items-start">
              <Check className="h-6 w-6 text-green-500 mr-2 shrink-0 mt-0.5" />
              <span>E-commerce stores that get flooded with order inquiries</span>
            </li>
            <li className="flex items-start">
              <Check className="h-6 w-6 text-green-500 mr-2 shrink-0 mt-0.5" />
              <span>Freelancers & consultants who need to stay focused on work</span>
            </li>
            <li className="flex items-start">
              <Check className="h-6 w-6 text-green-500 mr-2 shrink-0 mt-0.5" />
              <span>Service businesses that rely on bookings & customer inquiries</span>
            </li>
          </ul>

          <Button 
            size="lg"
            className="group bg-[#4F46E5] hover:bg-[#4338CA] text-white px-8 py-6 text-lg rounded-md shadow-lg"
          >
            <Rocket className="mr-2 h-5 w-5" />
            Try It Free – No Credit Card Needed
          </Button>
        </div>
      </div>
    </section>
  );
};
