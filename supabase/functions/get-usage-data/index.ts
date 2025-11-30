
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200
    })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          headers: corsHeaders,
          status: 500
        }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    let requestBody
    try {
      requestBody = await req.json()
    } catch (error) {
      console.error('Error parsing request body:', error)
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { 
          headers: corsHeaders,
          status: 400
        }
      )
    }

    const { userId, timeframe } = requestBody
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          headers: corsHeaders,
          status: 400
        }
      )
    }
    
    console.log('Fetching subscription data for user:', userId)
    
    // Get user subscription data
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select(`
        id,
        user_id,
        status,
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
      .maybeSingle()
    
    if (subscriptionError) {
      console.error('Subscription query error:', subscriptionError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch subscription data' }),
        { 
          headers: corsHeaders,
          status: 500
        }
      )
    }
    
    console.log('Fetching agent data for user:', userId)
    
    // Get agent usage data
    const { data: agentData, error: agentError } = await supabase
      .from('agent_configs')
      .select('id, name, minutes_used, total_minutes_used')
      .eq('user_id', userId)
    
    if (agentError) {
      console.error('Agent query error:', agentError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch agent data' }),
        { 
          headers: corsHeaders,
          status: 500
        }
      )
    }
    
    console.log('Fetching usage summary for user:', userId)
    
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
    
    if (usageError) {
      console.error('Usage summary query error:', usageError)
      // Don't return error for usage summary as it might not exist
    }
    
    const responseData = {
      subscription: subscriptionData,
      agents: agentData || [],
      monthlySummary: usageSummary
    }
    
    console.log('Successfully fetched data for user:', userId)
    
    return new Response(
      JSON.stringify(responseData),
      { 
        headers: corsHeaders,
        status: 200
      }
    )
  } catch (error) {
    console.error('Unexpected error in get-usage-data:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: corsHeaders,
        status: 500
      }
    )
  }
})
