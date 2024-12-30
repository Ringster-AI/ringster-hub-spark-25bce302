export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  minutes_allowance: number;
  features: {
    features: string[];
    max_agents: number;
  };
  max_team_members: number;
  max_agents: number;
  billing_interval?: string;
  stripe_price_id?: string;
  is_active?: boolean;
}

export interface UserSubscription {
  id: string;
  plan_id: string;
  status: string;
  plan: SubscriptionPlan;
  current_period_start?: string;
  current_period_end?: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
}

export interface SubscriptionLimits {
  maxAgents: number;
  maxTeamMembers: number;
  minutesAllowance: number;
  canCustomizeVoices: boolean;
  remainingMinutes: number;
}

export interface SubscriptionFeatures {
  limits: SubscriptionLimits;
  isActive: boolean;
  isPaid: boolean;
  isTrialing: boolean;
  willExpire: boolean;
  expiresAt?: Date;
}