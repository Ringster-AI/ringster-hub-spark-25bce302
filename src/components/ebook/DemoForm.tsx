
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, ThumbsUp, User } from "lucide-react";

interface DemoFormProps {
  email: string;
}

interface DemoBookingValues {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  teamSize: string;
  message: string;
}

export const DemoForm = ({ email }: DemoFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<DemoBookingValues>({
    defaultValues: {
      email: email || "",
    },
  });

  const onSubmit = async (data: DemoBookingValues) => {
    setIsSubmitting(true);
    
    try {
      // Store demo request in Supabase
      const { error } = await supabase
        .from('demo_requests')
        .insert({
          full_name: data.fullName,
          email: data.email,
          phone: data.phone,
          company_name: data.companyName,
          team_size: data.teamSize,
          message: data.message
        });

      if (error) throw error;
      
      // Forward demo request to webhook
      const webhookResponse = await supabase.functions.invoke('forward-demo-request', {
        body: {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          companyName: data.companyName,
          teamSize: data.teamSize,
          message: data.message
        }
      });
      
      if (webhookResponse.error) {
        console.error("Error sending to webhook:", webhookResponse.error);
      }
      
      // Show success state
      setIsSubmitted(true);
      toast.success("Demo request submitted successfully!");
    } catch (error) {
      console.error("Error submitting demo request:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
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
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <div className="flex items-center border rounded-md bg-white p-2 focus-within:ring-2 focus-within:ring-[#9b87f5]">
            <User className="w-5 h-5 text-gray-400 ml-2" />
            <Input
              id="fullName"
              {...register("fullName", { required: "Name is required" })}
              placeholder="Your full name"
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          {errors.fullName && (
            <p className="text-red-500 text-sm">{errors.fullName.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            {...register("email", { required: "Email is required" })}
            placeholder="Your email address"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            {...register("phone", { required: "Phone number is required" })}
            placeholder="Your phone number"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm">{errors.phone.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            {...register("companyName", { required: "Company name is required" })}
            placeholder="Your company name"
          />
          {errors.companyName && (
            <p className="text-red-500 text-sm">{errors.companyName.message}</p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="teamSize">Team Size</Label>
        <select
          id="teamSize"
          {...register("teamSize")}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">Select team size</option>
          <option value="1-10">1-10 employees</option>
          <option value="11-50">11-50 employees</option>
          <option value="51-200">51-200 employees</option>
          <option value="201-500">201-500 employees</option>
          <option value="501+">501+ employees</option>
        </select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="message">Tell us about your needs</Label>
        <Textarea
          id="message"
          {...register("message")}
          placeholder="What are you looking to accomplish with our solution?"
          className="min-h-[100px]"
        />
      </div>
      
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] hover:opacity-90 transition-opacity"
      >
        {isSubmitting ? "Submitting..." : "Schedule My Demo"}
        <Calendar className="ml-2 h-4 w-4" />
      </Button>
    </form>
  );
};
