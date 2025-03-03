
import { useState } from "react";
import { DemoFormProps, DemoBookingValues } from "./types";
import { useDemoForm } from "./useDemoForm";
import { SuccessMessage } from "./SuccessMessage";
import { FormHeader } from "./FormHeader";
import { FormFields } from "./FormFields";
import { FormFooter } from "./FormFooter";

export const DemoForm = ({ email }: DemoFormProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { register, handleSubmit, setValue, watch, errors, onSubmit, isSubmitting, handleSelectChange } = 
    useDemoForm({ email, setIsSubmitted });

  const watchTeamSize = watch("teamSize");
  const watchIndustry = watch("industry");

  if (isSubmitted) {
    return <SuccessMessage />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <FormHeader />
      
      <FormFields 
        register={register}
        errors={errors}
        watchTeamSize={watchTeamSize}
        watchIndustry={watchIndustry}
        handleSelectChange={handleSelectChange}
      />
      
      <FormFooter isSubmitting={isSubmitting} />
    </form>
  );
};
