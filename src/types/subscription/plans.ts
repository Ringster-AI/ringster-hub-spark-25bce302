export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  minutes_allowance: number;
  features: Json;  // Changed from { features: string[]; max_agents: number }
  max_team_members: number;
  max_agents: number;
  billing_interval?: string;
  stripe_price_id?: string;
  is_active?: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string | null;
  plan_id: string | null;
  status: string;
  plan: SubscriptionPlan;
  current_period_start?: string | null;
  current_period_end?: string | null;
  stripe_subscription_id?: string | null;
  stripe_customer_id?: string | null;
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

// Import Json type from database types
import { Json } from '../database/auth';