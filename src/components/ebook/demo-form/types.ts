
import { FieldErrors, UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form";

export interface DemoFormProps {
  email: string;
}

export interface DemoBookingValues {
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

export interface FormFieldsProps {
  register: UseFormRegister<DemoBookingValues>;
  errors: FieldErrors<DemoBookingValues>;
  watchTeamSize: string;
  watchIndustry: string;
  handleSelectChange: (name: keyof DemoBookingValues, value: string) => void;
}
