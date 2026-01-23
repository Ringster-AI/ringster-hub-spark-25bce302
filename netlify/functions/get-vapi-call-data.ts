
import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import { VapiService } from './services/vapi-service'
import { authenticateRequest, corsHeaders, unauthorizedResponse, forbiddenResponse } from './utils/auth'

const VAPI_API_KEY = process.env.VAPI_API_KEY!
const VAPI_API_URL = 'https://api.vapi.ai/assistant'

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    }
  }

  // SECURITY: Authenticate the request
  const authResult = await authenticateRequest(event.headers.authorization)
  if (authResult.error || !authResult.user) {
    return unauthorizedResponse(authResult.error || 'Authentication required')
  }

  try {
    const { callId, action } = JSON.parse(event.body || '{}')
    
    if (!callId) {
      throw new Error('Call ID is required')
    }

    if (!VAPI_API_KEY) {
      throw new Error('VAPI_API_KEY is not configured')
    }

    // SECURITY: Verify the authenticated user has access to this call
    // Check if the call log belongs to an agent owned by the user
    const { data: callLog, error: callError } = await supabase
      .from('call_logs')
      .select('agent_id, agent_configs!inner(user_id)')
      .eq('vapi_call_id', callId)
      .single()

    if (callError || !callLog) {
      // Try to look up by campaign instead
      const { data: campaignCall, error: campaignError } = await supabase
        .from('call_logs')
        .select('campaign_id, campaigns!inner(user_id)')
        .eq('vapi_call_id', callId)
        .single()

      if (campaignError || !campaignCall) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Call not found' })
        }
      }

      // Check campaign ownership
      const campaignData = campaignCall as any
      if (campaignData.campaigns?.user_id !== authResult.user.id) {
        return forbiddenResponse('You do not have permission to access this call data')
      }
    } else {
      // Check agent ownership
      const agentData = callLog as any
      if (agentData.agent_configs?.user_id !== authResult.user.id) {
        return forbiddenResponse('You do not have permission to access this call data')
      }
    }

    const vapiService = new VapiService(VAPI_API_KEY, VAPI_API_URL)
    let result = null

    switch (action) {
      case 'transcript':
        result = await vapiService.getCallTranscript(callId)
        break
      case 'recording':
        result = await vapiService.getCallRecording(callId)
        break
      default:
        throw new Error('Invalid action specified')
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(result)
    }
  } catch (error: any) {
    console.error('Error in get-vapi-call-data:', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: error.message
      })
    }
  }
}
