
import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export const handler: Handler = async (event) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    }
  }

  try {
    const { userId, timeframe } = JSON.parse(event.body || '{}')
    
    if (!userId) {
      throw new Error('User ID is required')
    }
    
    let query = supabase
      .from('user_subscriptions')
      .select(`
        id,
        user_id,
        status,
        minutes_used,
        plan_id,
        current_period_start,
        current_period_end,
        plan:subscription_plans (
          name,
          price,
          minutes_allowance,
          max_agents,
          max_team_members
        )
      `)
      .eq('user_id', userId)
      .single()
    
    const { data: subscriptionData, error: subscriptionError } = await query
    
    if (subscriptionError) throw subscriptionError
    
    // Get agent usage data
    const { data: agentData, error: agentError } = await supabase
      .from('agent_configs')
      .select('id, name, minutes_used, total_minutes_used')
      .eq('user_id', userId)
    
    if (agentError) throw agentError
    
    // Get monthly usage summary
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    
    const { data: usageSummary, error: usageError } = await supabase
      .from('usage_summary')
      .select('*')
      .eq('user_id', userId)
      .eq('year', currentYear)
      .eq('month', currentMonth)
      .maybeSingle()
    
    if (usageError) throw usageError
    
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        subscription: subscriptionData,
        agents: agentData || [],
        monthlySummary: usageSummary
      })
    }
  } catch (error: any) {
    console.error('Error in get-usage-data:', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: error.message
      })
    }
  }
}
