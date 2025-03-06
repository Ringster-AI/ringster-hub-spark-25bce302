
export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  billing_interval: string | null;
  features: {
    features: string[];
    max_agents: number;
  };
  stripe_price_id: string | null;
  max_agents: number;
  max_team_members: number;
  minutes_allowance: number;
  is_active: boolean;
  is_pay_as_you_go: boolean;
  per_minute_rate: number | null;
  number_rental_fee: number | null;
  created_at?: string;
  updated_at?: string;
  prod_id?: string;
}
