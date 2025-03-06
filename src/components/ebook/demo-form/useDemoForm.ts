
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DemoBookingValues } from "./types";

interface UseDemoFormProps {
  email: string;
  setIsSubmitted: (value: boolean) => void;
}

export const useDemoForm = ({ email, setIsSubmitted }: UseDemoFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<DemoBookingValues>({
    defaultValues: {
      email: email || "",
    },
  });

  const handleSelectChange = (name: keyof DemoBookingValues, value: string) => {
    setValue(name, value);
  };

  const onSubmit = async (data: DemoBookingValues) => {
    setIsSubmitting(true);
    
    try {
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
      
      setIsSubmitted(true);
      toast.success("Demo request submitted successfully!");
    } catch (error) {
      console.error("Error submitting demo request:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    register,
    handleSubmit,
    setValue,
    watch,
    errors,
    onSubmit,
    isSubmitting,
    handleSelectChange
  };
};
