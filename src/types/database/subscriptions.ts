import { Json } from './auth';

export interface SubscriptionsSchema {
  Tables: {
    subscription_plans: {
      Row: {
        id: string
        name: string
        price: number
        minutes_allowance: number
        features: Json
        prod_id: string | null
        billing_interval: string | null
        is_active: boolean | null
        max_team_members: number
        max_agents: number
        stripe_price_id: string | null
        created_at: string | null
        updated_at: string | null
      }
      Insert: {
        id?: string
        name: string
        price: number
        minutes_allowance: number
        features?: Json
        prod_id?: string | null
        billing_interval?: string | null
        is_active?: boolean | null
        max_team_members: number
        max_agents: number
        stripe_price_id?: string | null
        created_at?: string | null
        updated_at?: string | null
      }
      Update: {
        id?: string
        name?: string
        price?: number
        minutes_allowance?: number
        features?: Json
        prod_id?: string | null
        billing_interval?: string | null
        is_active?: boolean | null
        max_team_members?: number
        max_agents?: number
        stripe_price_id?: string | null
        created_at?: string | null
        updated_at?: string | null
      }
    }
    user_subscriptions: {
      Row: {
        id: string
        user_id: string | null
        plan_id: string | null
        stripe_subscription_id: string | null
        stripe_customer_id: string | null
        status: string
        current_period_start: string | null
        current_period_end: string | null
        created_at: string | null
        updated_at: string | null
      }
      Insert: {
        id?: string
        user_id?: string | null
        plan_id?: string | null
        stripe_subscription_id?: string | null
        stripe_customer_id?: string | null
        status?: string
        current_period_start?: string | null
        current_period_end?: string | null
        created_at?: string | null
        updated_at?: string | null
      }
      Update: {
        id?: string
        user_id?: string | null
        plan_id?: string | null
        stripe_subscription_id?: string | null
        stripe_customer_id?: string | null
        status?: string
        current_period_start?: string | null
        current_period_end?: string | null
        created_at?: string | null
        updated_at?: string | null
      }
    }
  }
}