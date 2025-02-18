
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SignupFormValues, ORGANIZATION_SIZES } from "@/types/auth";

const Signup = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<SignupFormValues>({
    defaultValues: {
      email: "",
      password: "",
      company: {
        name: "",
        size: "",
        workEmail: "",
        phone: "",
        additionalInfo: "",
      },
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    try {
      setIsLoading(true);
      
      // Create user account
      const { error: signUpError, data: authData } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: "", // Can be updated later in profile
          },
        },
      });

      if (signUpError) throw signUpError;

      // Create organization entry
      const { error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: data.company.name,
          size: data.company.size,
          additional_info: data.company.additionalInfo,
          user_id: authData.user?.id,
        });

      if (orgError) throw orgError;

      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    const currentFields = step === 1 
      ? ['email', 'password']
      : ['company.name', 'company.size', 'company.workEmail'];
      
    const isValid = currentFields.every(field => form.getValues(field as any));
    
    if (isValid) {
      // Set work email to match the email from step 1
      form.setValue('company.workEmail', form.getValues('email'));
      setStep(step + 1);
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-2xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">
            {step === 1 ? "Create your account" : "Tell us about your company"}
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Step {step} of 2
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 ? (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    {...form.register("password")}
                    required
                  />
                </div>
              </div>

              <Button
                type="button"
                className="w-full"
                onClick={nextStep}
              >
                Continue
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="workEmail">Work Email*</Label>
                  <Input
                    id="workEmail"
                    type="email"
                    {...form.register("company.workEmail")}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name*</Label>
                  <Input
                    id="companyName"
                    {...form.register("company.name")}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...form.register("company.phone")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size">Organization Size*</Label>
                  <Select
                    onValueChange={(value) => form.setValue("company.size", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORGANIZATION_SIZES.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">Additional Information</Label>
                  <Textarea
                    id="additionalInfo"
                    {...form.register("company.additionalInfo")}
                    placeholder="Tell us more about your needs..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
              </div>
            </>
          )}
        </form>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Button
            variant="link"
            className="p-0 h-auto font-semibold"
            onClick={() => navigate("/login")}
          >
            Sign in
          </Button>
        </p>
      </div>
    </div>
  );
};

export default Signup;
