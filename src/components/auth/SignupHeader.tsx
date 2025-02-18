
interface SignupHeaderProps {
  step: number;
}

export const SignupHeader = ({ step }: SignupHeaderProps) => {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold tracking-tight">
        {step === 1 ? "Create your account" : "Tell us about your company"}
      </h2>
      <p className="text-sm text-gray-600 mt-2">
        Step {step} of 2
      </p>
    </div>
  );
};
