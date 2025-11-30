import { supabase } from "@/integrations/supabase/client";
import { UserCredits, CreditStatus, CreditTransaction, PlanFeatures, FeatureAccess } from "@/types/credits";

export class CreditsService {
  // Get user's current credit status
  static async getCreditStatus(userId?: string): Promise<CreditStatus | null> {
    try {
      const { data: credits, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', userId || 'current_user')
        .single();

      if (error || !credits) {
        console.error('Error fetching credits:', error);
        return null;
      }

      const totalCredits = credits.plan_credits + credits.add_on_credits;
      const usedCredits = credits.credits_used;
      const remainingCredits = Math.max(0, totalCredits - usedCredits);
      const usagePercentage = totalCredits > 0 ? Math.round((usedCredits / totalCredits) * 100) : 0;

      return {
        totalCredits,
        usedCredits,
        remainingCredits,
        usagePercentage,
        resetDate: credits.reset_date,
        isLowCredits: remainingCredits / totalCredits < 0.1 && totalCredits > 0,
        isOutOfCredits: remainingCredits <= 0
      };
    } catch (error) {
      console.error('Error in getCreditStatus:', error);
      return null;
    }
  }

  // Check if user has enough credits for an action
  static async hasEnoughCredits(creditsRequired: number, userId?: string): Promise<boolean> {
    const status = await this.getCreditStatus(userId);
    return status ? status.remainingCredits >= creditsRequired : false;
  }

  // Deduct credits for a call
  static async deductCredits(
    creditsAmount: number, 
    description?: string, 
    callLogId?: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('deduct_credits', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_credits_amount: creditsAmount,
        p_description: description,
        p_call_log_id: callLogId
      });

      if (error) {
        console.error('Error deducting credits:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Error in deductCredits:', error);
      return false;
    }
  }

  // Add credits (for purchases)
  static async addCredits(
    creditsAmount: number,
    creditType: 'plan' | 'add_on' = 'add_on',
    description?: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('add_credits', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_credits_amount: creditsAmount,
        p_credit_type: creditType,
        p_description: description
      });

      if (error) {
        console.error('Error adding credits:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Error in addCredits:', error);
      return false;
    }
  }

  // Get credit transaction history
  static async getCreditTransactions(): Promise<CreditTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching credit transactions:', error);
        return [];
      }

      return (data || []).map(transaction => ({
        ...transaction,
        transaction_type: transaction.transaction_type as 'deduction' | 'addition' | 'reset'
      }));
    } catch (error) {
      console.error('Error in getCreditTransactions:', error);
      return [];
    }
  }

  // Check feature access based on plan
  static async checkFeatureAccess(featureName: keyof PlanFeatures): Promise<FeatureAccess> {
    try {
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(
            *,
            features:plan_features(*)
          )
        `)
        .single();

      if (subError || !subscription?.plan?.features) {
        return {
          hasAccess: false,
          featureName,
          upgradeMessage: 'Unable to verify plan access'
        };
      }

      const features = subscription.plan.features[0];
      const hasAccess = features?.[featureName] === true;

      if (!hasAccess) {
        const upgradeMessages = {
          calendar_integration: 'Upgrade to Starter or higher for calendar integration',
          retry_logic: 'Upgrade to Professional or higher for retry logic',
          sms_followup: 'Upgrade to Professional or higher for SMS follow-ups',
          crm_integration: 'Upgrade to Professional or higher for CRM integration',
          ai_insights: 'Upgrade to Growth or higher for AI insights',
          api_access: 'Upgrade to Professional or higher for API access',
          call_recording: 'Upgrade to Starter or higher for call recording',
          appointment_booking: 'Upgrade to Starter or higher for appointment booking'
        };

        return {
          hasAccess: false,
          featureName,
          requiredPlan: subscription.plan.name === 'Free' ? 'Starter' : 'Professional',
          upgradeMessage: upgradeMessages[featureName] || 'Upgrade your plan to access this feature'
        };
      }

      return {
        hasAccess: true,
        featureName
      };
    } catch (error) {
      console.error('Error checking feature access:', error);
      return {
        hasAccess: false,
        featureName,
        upgradeMessage: 'Error checking feature access'
      };
    }
  }

  // Calculate credits needed for a call (rough estimate: 1 credit per minute)
  static calculateCallCredits(durationMinutes: number): number {
    return Math.ceil(durationMinutes);
  }
}