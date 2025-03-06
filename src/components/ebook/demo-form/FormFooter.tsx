
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface FormFooterProps {
  isSubmitting: boolean;
}

export const FormFooter = ({ isSubmitting }: FormFooterProps) => {
  return (
    <>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] hover:opacity-90 transition-opacity py-6"
      >
        {isSubmitting ? "Submitting..." : "Schedule My Demo"}
        <Calendar className="ml-2 h-4 w-4" />
      </Button>
      
      <p className="text-center text-sm text-gray-500">
        By scheduling a demo, you agree to our Privacy Policy and Terms of Service.
      </p>
    </>
  );
};
