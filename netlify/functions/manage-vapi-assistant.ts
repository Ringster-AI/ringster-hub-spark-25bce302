
import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import { VapiService } from './services/vapi-service'
import { createVapiAssistantConfig } from './services/vapi-config'
import { authenticateRequest, verifyAgentOwnership, corsHeaders, unauthorizedResponse, forbiddenResponse } from './utils/auth'

const VAPI_API_KEY = process.env.VAPI_API_KEY!
const VAPI_API_URL = 'https://api.vapi.ai/assistant'

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

// Simple retry helper
const withRetry = async <T>(fn: () => Promise<T>, retries = 2, baseDelayMs = 300): Promise<T> => {
  let attempt = 0;
  let lastError: any;
  while (attempt <= retries) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === retries) break;
      const delay = baseDelayMs * Math.pow(2, attempt);
      console.warn(`Retrying after error (attempt ${attempt + 1}/${retries + 1})`, { error: String(err), delay });
      await new Promise(res => setTimeout(res, delay));
      attempt++;
    }
  }
  throw lastError;
};

const getAssistantIdFromAgent = (agent: any): string | null => {
  if (typeof agent?.vapi_assistant_id === 'string' && agent.vapi_assistant_id.trim().length > 0) {
    return agent.vapi_assistant_id
  }

  if (agent?.config && typeof agent.config === 'object' && !Array.isArray(agent.config)) {
    const fallbackId = (agent.config as Record<string, unknown>).vapi_assistant_id
    if (typeof fallbackId === 'string' && fallbackId.trim().length > 0) {
      return fallbackId
    }
  }

  return null
};

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
    const { agentId, phoneNumber, action = 'create' } = JSON.parse(event.body || '{}')
    const requestId = `manage-vapi-${agentId || 'unknown'}-${Date.now()}`
    console.log('Starting Vapi assistant management process', { requestId, action, agentId, phoneNumber })
    
    if (!agentId) {
      throw new Error('Agent ID is required')
    }

    // SECURITY: Verify the authenticated user owns this agent
    const ownershipResult = await verifyAgentOwnership(authResult.user.id, agentId)
    if (!ownershipResult.owned) {
      return forbiddenResponse(ownershipResult.error || 'You do not have permission to modify this agent')
    }

    if (!VAPI_API_KEY) {
      throw new Error('VAPI_API_KEY is not configured')
    }

    const { data: agent, error: agentError } = await supabase
      .from('agent_configs')
      .select('*')
      .eq('id', agentId)
      .single()

    if (agentError || !agent) {
      console.error('Failed to fetch agent details:', agentError)
      throw new Error('Failed to fetch agent details')
    }

    // Check if calendar is enabled for this agent and fetch global tool IDs
    let calendarToolIds: string[] = []
    const { data: calendarTool } = await supabase
      .from('calendar_tools')
      .select('is_enabled')
      .eq('agent_id', agentId)
      .eq('tool_name', 'calendar_booking')
      .eq('is_enabled', true)
      .single()

    if (calendarTool) {
      const { data: globalConfig } = await supabase
        .from('vapi_global_config')
        .select('value')
        .eq('key', 'calendar_tools')
        .single()

      if (globalConfig?.value) {
        const toolConfig = globalConfig.value as any
        if (toolConfig.check_availability_id) calendarToolIds.push(toolConfig.check_availability_id)
        if (toolConfig.book_appointment_id) calendarToolIds.push(toolConfig.book_appointment_id)
      }
    }

    const vapiService = new VapiService(VAPI_API_KEY, VAPI_API_URL)

    if (action === 'update') {
      const assistantId = getAssistantIdFromAgent(agent)
      if (!assistantId) {
        throw new Error('No VAPI assistant ID found for agent')
      }
      const shouldBackfillAssistantId = !agent.vapi_assistant_id

      // Handle transfer directory: recreate tool if directory exists
      let transferToolId: string | null = null
      const currentConfig = agent.config && typeof agent.config === 'object' && !Array.isArray(agent.config)
        ? (agent.config as Record<string, unknown>)
        : {}
      const existingTransferToolId = currentConfig.transfer_tool_id as string | null

      if (agent.transfer_directory && typeof agent.transfer_directory === 'object' && Object.keys(agent.transfer_directory).length > 0) {
        console.log('Creating/updating transfer tool for directory:', agent.transfer_directory)
        try {
          const toolData = await withRetry(() => vapiService.createTransferTool(agent.transfer_directory as Record<string, any>))
          transferToolId = toolData.id
          console.log('Created transfer tool:', { requestId, transferToolId })

          // Update config with new transfer tool ID
          await supabase
            .from('agent_configs')
            .update({
              config: {
                ...currentConfig,
                transfer_tool_id: transferToolId
              }
            })
            .eq('id', agentId)
        } catch (toolError) {
          console.error('Failed to create transfer tool, using existing:', toolError)
          transferToolId = existingTransferToolId || null
        }
      }

      const vapiConfig = createVapiAssistantConfig(agent)

      // Merge all tool IDs: calendar tools + transfer tool
      const allToolIds: string[] = [...calendarToolIds]
      if (transferToolId) {
        allToolIds.push(transferToolId)
      } else if (existingTransferToolId) {
        allToolIds.push(existingTransferToolId)
      }

      if (allToolIds.length > 0) {
        vapiConfig.toolIds = allToolIds
        console.log('Setting toolIds on assistant:', allToolIds)
      }

      const updatedAssistant = await withRetry(async () => {
        const res = await fetch(`${VAPI_API_URL}/${assistantId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${VAPI_API_KEY}`,
            'Content-Type': 'application/json',
            'x-request-id': requestId,
          },
          body: JSON.stringify(vapiConfig),
        })
        if (!res.ok) {
          const errorText = await res.text()
          throw new Error(`VAPI update failed: ${errorText}`)
        }
        return res.json()
      })
      console.log('Successfully updated Vapi assistant:', { requestId, updatedAssistantId: updatedAssistant.id })

      if (shouldBackfillAssistantId) {
        const { error: backfillError } = await supabase
          .from('agent_configs')
          .update({ vapi_assistant_id: assistantId })
          .eq('id', agentId)

        if (backfillError) {
          console.warn('Failed to backfill vapi_assistant_id column', { requestId, assistantId, backfillError })
        }
      }

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          assistantId: updatedAssistant.id,
          action: 'updated'
        })
      }
    } else {
      // Handle creation action (existing logic)
      // Create transfer tool if directory exists
      let transferToolId = null
      if (agent.transfer_directory && Object.keys(agent.transfer_directory).length > 0) {
        console.log('Creating transfer tool for directory:', agent.transfer_directory)
        const toolData = await withRetry(() => vapiService.createTransferTool(agent.transfer_directory))
        transferToolId = toolData.id
        console.log('Created transfer tool:', { requestId, transferToolId })
      }

      // Create Vapi assistant
      const vapiConfig = createVapiAssistantConfig(agent)
      if (calendarToolIds.length > 0) {
        vapiConfig.toolIds = calendarToolIds
      }
      const vapiData = await withRetry(() => vapiService.createAssistant(vapiConfig))
      console.log('Successfully created Vapi assistant:', { requestId, assistantId: vapiData.id })

      // Update assistant with transfer tool if created
      if (transferToolId) {
        await withRetry(() => vapiService.updateAssistantTools(
          vapiData.id,
          transferToolId,
          vapiConfig.model.model,
          vapiConfig.model.provider
        ))
        console.log('Updated assistant with transfer tool', { requestId, transferToolId })
      }

      // Import Twilio number if provided
      if (phoneNumber && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        await withRetry(() => vapiService.importTwilioNumber(
          vapiData.id,
          phoneNumber,
          process.env.TWILIO_ACCOUNT_SID as string,
          process.env.TWILIO_AUTH_TOKEN as string
        ))
      }

      // Update agent config with assistant and tool IDs
      const currentConfig = agent.config && typeof agent.config === 'object' && !Array.isArray(agent.config)
        ? (agent.config as Record<string, unknown>)
        : {}

      const { error: updateError } = await supabase
        .from('agent_configs')
        .update({
          vapi_assistant_id: vapiData.id,
          config: {
            ...currentConfig,
            vapi_assistant_id: vapiData.id,
            transfer_tool_id: transferToolId
          }
        })
        .eq('id', agentId)

      if (updateError) {
        console.error('Error updating agent config:', updateError)
        throw updateError
      }

      console.log('Successfully updated agent config with Vapi assistant and tool IDs')

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          assistantId: vapiData.id,
          transferToolId: transferToolId,
          action: 'created'
        })
      }
    }
  } catch (error: any) {
    console.error('Error in manage-vapi-assistant:', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: error.message
      })
    }
  }
}
