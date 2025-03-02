
import { supabase } from "@/integrations/supabase/client";

interface BillingUsage {
  id: string;
  period: string;
  minutesUsed: number;
  minutesAllowance: number;
  callCount: number;
  transferCount: number;
}

interface BillingPlan {
  id: string;
  name: string;
  price: number;
  minutesAllowance: number;
  maxAgents: number;
  maxTeamMembers: number;
  features: any;
}

export const billingService = {
  /**
   * Fetches current billing plan details
   */
  async getCurrentPlan(): Promise<BillingPlan | null> {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          id,
          status,
          plan:subscription_plans (
            id,
            name,
            price,
            minutes_allowance,
            max_agents,
            max_team_members,
            features
          )
        `)
        .single();
      
      if (error) throw error;
      
      if (!data || !data.plan) return null;
      
      return {
        id: data.plan.id,
        name: data.plan.name,
        price: data.plan.price || 0,
        minutesAllowance: data.plan.minutes_allowance || 0,
        maxAgents: data.plan.max_agents || 0,
        maxTeamMembers: data.plan.max_team_members || 0,
        features: data.plan.features || {},
      };
    } catch (error) {
      console.error('Error fetching billing plan:', error);
      return null;
    }
  },
  
  /**
   * Fetches usage statistics for a specific time period
   */
  async getUsageStats(year?: number, month?: number): Promise<BillingUsage[]> {
    try {
      const now = new Date();
      const currentYear = year || now.getFullYear();
      const currentMonth = month || now.getMonth() + 1;
      
      const { data, error } = await supabase
        .from('usage_summary')
        .select('*')
        .eq('year', currentYear)
        .eq('month', currentMonth);
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        id: item.id,
        period: `${item.year}-${item.month.toString().padStart(2, '0')}`,
        minutesUsed: item.total_minutes || 0,
        minutesAllowance: 0, // Would need to join with subscription plan
        callCount: item.total_calls || 0,
        transferCount: item.total_transfers || 0,
      }));
    } catch (error) {
      console.error('Error fetching usage stats:', error);
      return [];
    }
  }
};
