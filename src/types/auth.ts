
export interface SignupFormValues {
  email: string;
  password: string;
  company: {
    name: string;
    size: string;
    workEmail: string;
    phone?: string;
    additionalInfo?: string;
  };
}

export const ORGANIZATION_SIZES = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1000+ employees'
] as const;

export type OrganizationSize = typeof ORGANIZATION_SIZES[number];
