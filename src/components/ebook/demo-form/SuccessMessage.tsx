
import { ThumbsUp } from "lucide-react";

export const SuccessMessage = () => {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <ThumbsUp className="h-8 w-8 text-green-600" />
      </div>
      <h3 className="text-2xl font-bold text-[#1A1F2C] mb-4">Thanks for Booking!</h3>
      <p className="text-[#403E43] mb-6">
        One of our team members will contact you shortly to schedule your personalized demo.
      </p>
      <div className="p-4 bg-[#F1F0FB] rounded-lg max-w-md mx-auto">
        <p className="font-medium">What to expect next:</p>
        <ul className="text-left mt-2 space-y-2">
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center mr-2">1.</span>
            <span>You'll receive an email confirmation</span>
          </li>
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center mr-2">2.</span>
            <span>A team member will contact you within 24 hours</span>
          </li>
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center mr-2">3.</span>
            <span>We'll schedule a time that works for you</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
