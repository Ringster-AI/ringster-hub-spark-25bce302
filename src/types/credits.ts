export interface UserCredits {
  id: string;
  user_id: string;
  plan_credits: number;
  add_on_credits: number;
  credits_used: number;
  reset_date: string;
  created_at: string;
  updated_at: string;
}

export interface PlanFeatures {
  id: string;
  plan_id: string;
  calendar_integration: boolean;
  retry_logic: boolean;
  sms_followup: boolean;
  crm_integration: boolean;
  ai_insights: boolean;
  api_access: boolean;
  call_recording: boolean;
  appointment_booking: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  transaction_type: 'deduction' | 'addition' | 'reset';
  credits_amount: number;
  description: string | null;
  call_log_id: string | null;
  created_at: string;
}

export interface CreditStatus {
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  usagePercentage: number;
  resetDate: string;
  isLowCredits: boolean; // < 10% remaining
  isOutOfCredits: boolean; // 0 credits remaining
}

export interface FeatureAccess {
  hasAccess: boolean;
  featureName: string;
  requiredPlan?: string;
  upgradeMessage?: string;
}