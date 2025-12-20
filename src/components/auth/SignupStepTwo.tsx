
import { UseFormReturn } from "react-hook-form";
import { Loader2 } from "lucide-react";
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

interface SignupStepTwoProps {
  form: UseFormReturn<SignupFormValues>;
  isLoading: boolean;
  onBack: () => void;
}

export const SignupStepTwo = ({ form, isLoading, onBack }: SignupStepTwoProps) => {
  return (
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

      <div className="space-y-3 pt-2">
        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="termsAccepted"
            {...form.register("termsAccepted")}
            className="mt-1 h-4 w-4 rounded border-gray-300"
            required
          />
          <Label htmlFor="termsAccepted" className="text-sm text-muted-foreground leading-tight cursor-pointer">
            I agree to the{" "}
            <a href="/terms" target="_blank" className="text-primary hover:underline">Terms of Service</a>
            {" "}and{" "}
            <a href="/privacy" target="_blank" className="text-primary hover:underline">Privacy Policy</a> *
          </Label>
        </div>

        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="marketingConsent"
            {...form.register("marketingConsent")}
            className="mt-1 h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="marketingConsent" className="text-sm text-muted-foreground leading-tight cursor-pointer">
            I'd like to receive product updates and marketing communications (optional)
          </Label>
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
          onClick={onBack}
        >
          Back
        </Button>
      </div>
    </>
  );
};
