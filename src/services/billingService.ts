
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

interface AgentUsage {
  id: string;
  name: string;
  minutesUsed: number;
  totalMinutesUsed: number;
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
  },

  /**
   * Fetches usage statistics for all agents
   */
  async getAgentUsageStats(): Promise<AgentUsage[]> {
    try {
      const { data, error } = await supabase
        .from('agent_configs')
        .select('id, name, minutes_used, total_minutes_used');
      
      if (error) throw error;
      
      return (data || []).map(agent => ({
        id: agent.id,
        name: agent.name,
        minutesUsed: agent.minutes_used || 0,
        totalMinutesUsed: agent.total_minutes_used || 0,
      }));
    } catch (error) {
      console.error('Error fetching agent usage stats:', error);
      return [];
    }
  },

  /**
   * Gets detailed billing data for analytics
   */
  async getBillingAnalytics() {
    try {
      const [plan, usage, agentUsage] = await Promise.all([
        this.getCurrentPlan(),
        this.getUsageStats(),
        this.getAgentUsageStats()
      ]);
      
      const usagePercentage = plan?.minutesAllowance ? 
        Math.round((agentUsage.reduce((sum, agent) => sum + agent.minutesUsed, 0) / plan.minutesAllowance) * 100) : 0;
      
      return {
        plan,
        usage,
        agentUsage,
        usagePercentage,
        remainingMinutes: plan?.minutesAllowance ? 
          Math.max(0, plan.minutesAllowance - agentUsage.reduce((sum, agent) => sum + agent.minutesUsed, 0)) : 0
      };
    } catch (error) {
      console.error('Error generating billing analytics:', error);
      throw error;
    }
  },

  /**
   * Fetch data from the Supabase Edge Function
   */
  async getDetailedUsageData() {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');
      
      const response = await supabase.functions.invoke('get-usage-data', {
        body: { userId: user.id }
      });
      
      if (response.error) throw new Error(response.error);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching detailed usage data:', error);
      throw error;
    }
  }
};
