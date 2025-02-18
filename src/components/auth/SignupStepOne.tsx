
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SignupFormValues } from "@/types/auth";

interface SignupStepOneProps {
  form: UseFormReturn<SignupFormValues>;
  onNext: () => void;
}

export const SignupStepOne = ({ form, onNext }: SignupStepOneProps) => {
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validatePassword = (password: string) => {
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    if (!hasLowerCase || !hasUpperCase || !hasNumber) {
      return "Password must contain at least one lowercase letter, one uppercase letter, and one number";
    }
    
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    
    return null;
  };

  const handleNext = () => {
    const password = form.getValues("password");
    const error = validatePassword(password);
    
    if (error) {
      setPasswordError(error);
      return;
    }
    
    setPasswordError(null);
    onNext();
  };

  return (
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
            onChange={(e) => {
              form.register("password").onChange(e);
              setPasswordError(validatePassword(e.target.value));
            }}
          />
          {passwordError && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>
                {passwordError}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      <Button
        type="button"
        className="w-full"
        onClick={handleNext}
      >
        Continue
      </Button>
    </>
  );
};
