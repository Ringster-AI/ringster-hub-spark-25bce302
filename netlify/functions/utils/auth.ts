import { createClient } from '@supabase/supabase-js'

export interface AuthResult {
  user: {
    id: string
    email?: string
  } | null
  error: string | null
}

export interface CorsHeaders {
  'Access-Control-Allow-Origin': string
  'Access-Control-Allow-Headers': string
  'Content-Type': string
}

export const corsHeaders: CorsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
}

/**
 * Authenticates a request by verifying the JWT token from the Authorization header
 * Uses Supabase auth.getUser() to validate the token
 */
export async function authenticateRequest(authHeader: string | undefined): Promise<AuthResult> {
  if (!authHeader?.startsWith('Bearer ')) {
    return { user: null, error: 'Missing or invalid Authorization header' }
  }

  const token = authHeader.replace('Bearer ', '')
  
  const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || ''
  )

  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    return { user: null, error: 'Invalid or expired token' }
  }

  return { user: { id: user.id, email: user.email }, error: null }
}

/**
 * Verifies that the authenticated user owns the specified agent
 */
export async function verifyAgentOwnership(
  userId: string, 
  agentId: string
): Promise<{ owned: boolean; error: string | null }> {
  const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )

  const { data: agent, error } = await supabase
    .from('agent_configs')
    .select('user_id')
    .eq('id', agentId)
    .single()

  if (error || !agent) {
    return { owned: false, error: 'Agent not found' }
  }

  if (agent.user_id !== userId) {
    return { owned: false, error: 'You do not have permission to access this agent' }
  }

  return { owned: true, error: null }
}

/**
 * Verifies that the authenticated user owns the specified campaign
 */
export async function verifyCampaignOwnership(
  userId: string, 
  campaignId: string
): Promise<{ owned: boolean; error: string | null }> {
  const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('user_id')
    .eq('id', campaignId)
    .single()

  if (error || !campaign) {
    return { owned: false, error: 'Campaign not found' }
  }

  if (campaign.user_id !== userId) {
    return { owned: false, error: 'You do not have permission to access this campaign' }
  }

  return { owned: true, error: null }
}

/**
 * Creates an unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
  return {
    statusCode: 401,
    headers: corsHeaders,
    body: JSON.stringify({ error: message })
  }
}

/**
 * Creates a forbidden response
 */
export function forbiddenResponse(message: string = 'Forbidden') {
  return {
    statusCode: 403,
    headers: corsHeaders,
    body: JSON.stringify({ error: message })
  }
}
