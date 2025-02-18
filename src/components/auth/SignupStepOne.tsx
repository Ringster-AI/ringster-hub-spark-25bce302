
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignupFormValues } from "@/types/auth";

interface SignupStepOneProps {
  form: UseFormReturn<SignupFormValues>;
  onNext: () => void;
}

export const SignupStepOne = ({ form, onNext }: SignupStepOneProps) => {
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
          />
        </div>
      </div>

      <Button
        type="button"
        className="w-full"
        onClick={onNext}
      >
        Continue
      </Button>
    </>
  );
};
