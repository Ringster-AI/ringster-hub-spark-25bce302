
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, ThumbsUp, User, Building, Briefcase, Users, Phone } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DemoFormProps {
  email: string;
}

interface DemoBookingValues {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  teamSize: string;
  industry: string;
  jobTitle: string;
  preferredDate: string;
  message: string;
}

export const DemoForm = ({ email }: DemoFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<DemoBookingValues>({
    defaultValues: {
      email: email || "",
    },
  });

  const watchTeamSize = watch("teamSize");
  const watchIndustry = watch("industry");

  const onSubmit = async (data: DemoBookingValues) => {
    setIsSubmitting(true);
    
    try {
      // Forward demo request to webhook
      const webhookResponse = await supabase.functions.invoke('forward-demo-request', {
        body: {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          companyName: data.companyName,
          teamSize: data.teamSize,
          industry: data.industry,
          jobTitle: data.jobTitle,
          preferredDate: data.preferredDate,
          message: data.message
        }
      });
      
      if (webhookResponse.error) {
        console.error("Error sending to webhook:", webhookResponse.error);
        throw new Error("Error sending request");
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

  const handleSelectChange = (name: keyof DemoBookingValues, value: string) => {
    setValue(name, value);
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold text-[#1A1F2C]">Schedule Your Personalized Demo</h3>
        <p className="text-[#403E43] mt-2">
          See how Ringster AI can transform your business communications
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name*</Label>
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
          <Label htmlFor="email">Email Address*</Label>
          <div className="flex items-center border rounded-md bg-white p-2 focus-within:ring-2 focus-within:ring-[#9b87f5]">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <Input
              id="email"
              type="email"
              {...register("email", { required: "Email is required" })}
              placeholder="Your email address"
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number*</Label>
          <div className="flex items-center border rounded-md bg-white p-2 focus-within:ring-2 focus-within:ring-[#9b87f5]">
            <Phone className="w-5 h-5 text-gray-400 ml-2" />
            <Input
              id="phone"
              type="tel"
              {...register("phone", { required: "Phone number is required" })}
              placeholder="Your phone number"
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          {errors.phone && (
            <p className="text-red-500 text-sm">{errors.phone.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name*</Label>
          <div className="flex items-center border rounded-md bg-white p-2 focus-within:ring-2 focus-within:ring-[#9b87f5]">
            <Building className="w-5 h-5 text-gray-400 ml-2" />
            <Input
              id="companyName"
              {...register("companyName", { required: "Company name is required" })}
              placeholder="Your company name"
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          {errors.companyName && (
            <p className="text-red-500 text-sm">{errors.companyName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="jobTitle">Job Title*</Label>
          <div className="flex items-center border rounded-md bg-white p-2 focus-within:ring-2 focus-within:ring-[#9b87f5]">
            <Briefcase className="w-5 h-5 text-gray-400 ml-2" />
            <Input
              id="jobTitle"
              {...register("jobTitle", { required: "Job title is required" })}
              placeholder="Your job title"
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          {errors.jobTitle && (
            <p className="text-red-500 text-sm">{errors.jobTitle.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Industry*</Label>
          <Select
            value={watchIndustry}
            onValueChange={(value) => handleSelectChange("industry", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="manufacturing">Manufacturing</SelectItem>
              <SelectItem value="hospitality">Hospitality</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <input 
            type="hidden" 
            {...register("industry", { required: "Industry is required" })} 
          />
          {errors.industry && (
            <p className="text-red-500 text-sm">{errors.industry.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="teamSize">Team Size*</Label>
          <Select
            value={watchTeamSize}
            onValueChange={(value) => handleSelectChange("teamSize", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select team size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-10">1-10 employees</SelectItem>
              <SelectItem value="11-50">11-50 employees</SelectItem>
              <SelectItem value="51-200">51-200 employees</SelectItem>
              <SelectItem value="201-500">201-500 employees</SelectItem>
              <SelectItem value="501+">501+ employees</SelectItem>
            </SelectContent>
          </Select>
          <input 
            type="hidden" 
            {...register("teamSize", { required: "Team size is required" })} 
          />
          {errors.teamSize && (
            <p className="text-red-500 text-sm">{errors.teamSize.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferredDate">Preferred Demo Date</Label>
          <div className="flex items-center border rounded-md bg-white p-2 focus-within:ring-2 focus-within:ring-[#9b87f5]">
            <Calendar className="w-5 h-5 text-gray-400 ml-2" />
            <Input
              id="preferredDate"
              type="date"
              {...register("preferredDate")}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>
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
        className="w-full bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] hover:opacity-90 transition-opacity py-6"
      >
        {isSubmitting ? "Submitting..." : "Schedule My Demo"}
        <Calendar className="ml-2 h-4 w-4" />
      </Button>
      
      <p className="text-center text-sm text-gray-500">
        By scheduling a demo, you agree to our Privacy Policy and Terms of Service.
      </p>
    </form>
  );
};
