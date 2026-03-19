
import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import { VapiService } from './services/vapi-service'
import { createVapiAssistantConfig } from './services/vapi-config'
import { authenticateRequest, verifyAgentOwnership, corsHeaders, unauthorizedResponse, forbiddenResponse } from './utils/auth'

const VAPI_API_KEY = process.env.VAPI_API_KEY!
const VAPI_API_URL = 'https://api.vapi.ai/assistant'
const VAPI_TOOL_URL = 'https://api.vapi.ai/tool'

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

// ─── Self-healing: ensure global calendar tools exist in vapi_global_config ───
async function ensureGlobalToolsExist(): Promise<string[]> {
  const { data: globalConfig } = await supabase
    .from('vapi_global_config')
    .select('value')
    .eq('key', 'calendar_tools')
    .single()

  const toolConfig = globalConfig?.value as any
  if (toolConfig?.check_availability_id && toolConfig?.book_appointment_id && toolConfig?.get_current_datetime_id) {
    // Tools exist, return all IDs
    return [
      toolConfig.check_availability_id,
      toolConfig.book_appointment_id,
      toolConfig.get_current_datetime_id,
    ].filter(Boolean)
  }

  // Tools missing — create them inline
  console.log('Global calendar tools missing from vapi_global_config, creating...')

  const supabaseUrl = process.env.SUPABASE_URL || ''
  const calendarSecret = process.env.VAPI_CALENDAR_SECRET || ''

  if (!VAPI_API_KEY || !supabaseUrl || !calendarSecret) {
    console.error('Missing env vars for tool registration: VAPI_API_KEY, SUPABASE_URL, or VAPI_CALENDAR_SECRET')
    return []
  }

  const checkAvailabilityCode = `
async function main({ params, call }) {
  try {
    const assistantId = call?.assistant?.id || params.assistant_id;
    if (!assistantId) return { error: true, message: 'Could not determine assistant identity.' };
    const res = await fetch(params.supabase_url + '/functions/v1/vapi-calendar-api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-vapi-secret': params.calendar_secret },
      body: JSON.stringify({ action: 'check_availability', assistant_id: assistantId, date: params.date, timezone: params.timezone || 'America/New_York', duration_minutes: params.duration_minutes || 30 }),
    });
    if (!res.ok) { const err = await res.json().catch(() => ({ error: true, message: 'Calendar service error' })); return err; }
    return await res.json();
  } catch (e) { return { error: true, message: 'Calendar service temporarily unavailable.' }; }
}`

  const bookAppointmentCode = `
async function main({ params, call }) {
  try {
    const assistantId = call?.assistant?.id || params.assistant_id;
    if (!assistantId) return { error: true, message: 'Could not determine assistant identity.' };
    const idempotencyKey = crypto.randomUUID();
    const res = await fetch(params.supabase_url + '/functions/v1/vapi-calendar-api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-vapi-secret': params.calendar_secret },
      body: JSON.stringify({ action: 'book_appointment', assistant_id: assistantId, datetime: params.datetime, attendee_name: params.attendee_name, attendee_email: params.attendee_email || null, duration_minutes: params.duration_minutes || 30, appointment_type: params.appointment_type || 'consultation', timezone: params.timezone || 'America/New_York', idempotency_key: idempotencyKey }),
    });
    if (!res.ok) { const err = await res.json().catch(() => ({ error: true, message: 'Booking service error' })); return err; }
    return await res.json();
  } catch (e) { return { error: true, message: 'Booking service temporarily unavailable.' }; }
}`

  const getCurrentDatetimeCode = `
async function main({ params }) {
  try {
    const tz = params.timezone || 'America/New_York';
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const parts = formatter.formatToParts(now);
    const get = (type) => parts.find(p => p.type === type)?.value || '';
    const dateFormatter = new Intl.DateTimeFormat('sv-SE', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
    const isoDate = dateFormatter.format(now);
    return { current_date: isoDate, day_of_week: get('weekday'), current_time: get('hour') + ':' + get('minute') + ':' + get('second') + ' ' + get('dayPeriod'), timezone: tz, formatted: formatter.format(now) };
  } catch (e) { return { error: true, message: 'Could not determine current date/time.' }; }
}`

  const tools = [
    {
      type: 'code',
      function: {
        name: 'check_availability',
        description: 'Check available appointment slots on a specific date. Returns available time slots for booking. Always call get_current_datetime first.',
        parameters: { type: 'object', properties: { date: { type: 'string', description: 'Date in YYYY-MM-DD format' }, timezone: { type: 'string', description: 'Timezone' }, duration_minutes: { type: 'number', description: 'Duration in minutes' } }, required: ['date'] },
      },
      code: checkAvailabilityCode,
      environmentVariables: [{ name: 'supabase_url', value: supabaseUrl }, { name: 'calendar_secret', value: calendarSecret }],
    },
    {
      type: 'code',
      function: {
        name: 'book_appointment',
        description: 'Book an appointment at a specific date and time. Use check_availability first.',
        parameters: { type: 'object', properties: { datetime: { type: 'string', description: 'ISO datetime' }, attendee_name: { type: 'string', description: 'Attendee name' }, attendee_email: { type: 'string', description: 'Attendee email' }, duration_minutes: { type: 'number', description: 'Duration' }, appointment_type: { type: 'string', description: 'Type' }, timezone: { type: 'string', description: 'Timezone' } }, required: ['datetime', 'attendee_name'] },
      },
      code: bookAppointmentCode,
      environmentVariables: [{ name: 'supabase_url', value: supabaseUrl }, { name: 'calendar_secret', value: calendarSecret }],
    },
    {
      type: 'code',
      function: {
        name: 'get_current_datetime',
        description: 'Get the current date, time, and day of the week. Call this whenever you need to know what day it is today.',
        parameters: { type: 'object', properties: { timezone: { type: 'string', description: 'Timezone' } }, required: [] },
      },
      code: getCurrentDatetimeCode,
      environmentVariables: [],
    },
  ]

  try {
    const results = await Promise.all(
      tools.map(tool =>
        fetch(VAPI_TOOL_URL, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${VAPI_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(tool),
        }).then(async res => {
          if (!res.ok) throw new Error(`Tool creation failed: ${await res.text()}`);
          return res.json();
        })
      )
    )

    const [checkData, bookData, dateData] = results

    await supabase
      .from('vapi_global_config')
      .upsert({
        key: 'calendar_tools',
        value: {
          check_availability_id: checkData.id,
          book_appointment_id: bookData.id,
          get_current_datetime_id: dateData.id,
          version: '1.1',
        },
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' })

    console.log('Successfully created and stored global calendar tools:', {
      check: checkData.id,
      book: bookData.id,
      date: dateData.id,
    })

    return [checkData.id, bookData.id, dateData.id]
  } catch (err) {
    console.error('Failed to create global calendar tools:', err)
    return []
  }
}

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
      // Self-healing: ensure global tools exist
      calendarToolIds = await ensureGlobalToolsExist()
      if (calendarToolIds.length === 0) {
        console.warn('Calendar enabled but could not ensure global tools exist')
      }
    } else {
      // Even without calendar, attach get_current_datetime tool for date awareness
      const { data: globalConfig } = await supabase
        .from('vapi_global_config')
        .select('value')
        .eq('key', 'calendar_tools')
        .single()

      const toolConfig = globalConfig?.value as any
      if (toolConfig?.get_current_datetime_id) {
        calendarToolIds = [toolConfig.get_current_datetime_id]
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
          console.error('Failed to create transfer tool:', toolError)
          transferToolId = existingTransferToolId || null
        }
      }

      const vapiConfig = createVapiAssistantConfig(agent)

      // Merge all tool IDs: calendar/datetime tools + transfer tool
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

      // Try PATCH, fall back to CREATE if assistant no longer exists
      let finalAssistantId = assistantId
      let actionTaken = 'updated'

      try {
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
        finalAssistantId = updatedAssistant.id
        console.log('Successfully updated Vapi assistant:', { requestId, updatedAssistantId: finalAssistantId })
      } catch (patchError: any) {
        const errorMsg = String(patchError?.message || '')
        if (errorMsg.includes("Couldn't Find") || errorMsg.includes('404') || errorMsg.includes('not found')) {
          console.warn(`Assistant ${assistantId} not found in VAPI, recreating...`, { requestId })
          
          // Create a brand-new assistant
          const newAssistant = await withRetry(() => vapiService.createAssistant(vapiConfig))
          finalAssistantId = newAssistant.id
          actionTaken = 'recreated'
          console.log('Successfully recreated Vapi assistant:', { requestId, oldId: assistantId, newId: finalAssistantId })

          // Re-import Twilio number if agent has one
          if (agent.phone_number && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
            try {
              await withRetry(() => vapiService.importTwilioNumber(
                finalAssistantId,
                agent.phone_number!,
                process.env.TWILIO_ACCOUNT_SID as string,
                process.env.TWILIO_AUTH_TOKEN as string
              ))
              console.log('Re-imported Twilio number to new assistant:', { requestId, phoneNumber: agent.phone_number })
            } catch (phoneErr) {
              console.error('Failed to re-import Twilio number:', phoneErr)
            }
          }
        } else {
          throw patchError
        }
      }

      // Update DB with the (possibly new) assistant ID
      if (finalAssistantId !== assistantId || shouldBackfillAssistantId) {
        const { error: updateIdError } = await supabase
          .from('agent_configs')
          .update({
            vapi_assistant_id: finalAssistantId,
            config: {
              ...currentConfig,
              vapi_assistant_id: finalAssistantId,
              transfer_tool_id: transferToolId || existingTransferToolId || null,
            }
          })
          .eq('id', agentId)

        if (updateIdError) {
          console.warn('Failed to update vapi_assistant_id', { requestId, finalAssistantId, updateIdError })
        }
      }

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          assistantId: finalAssistantId,
          action: actionTaken
        })
      }
    } else {
      // Handle creation action
      // Create transfer tool if directory exists
      let transferToolId: string | null = null
      if (agent.transfer_directory && typeof agent.transfer_directory === 'object' && Object.keys(agent.transfer_directory).length > 0) {
        console.log('Creating transfer tool for directory:', agent.transfer_directory)
        try {
          const toolData = await withRetry(() => vapiService.createTransferTool(agent.transfer_directory))
          transferToolId = toolData.id
          console.log('Created transfer tool:', { requestId, transferToolId })
        } catch (toolError) {
          console.error('Failed to create transfer tool during agent creation:', toolError)
          // Continue without transfer tool rather than failing entire creation
        }
      }

      // Create Vapi assistant with ALL tool IDs merged
      const vapiConfig = createVapiAssistantConfig(agent)
      const allCreateToolIds: string[] = [...calendarToolIds]
      if (transferToolId) {
        allCreateToolIds.push(transferToolId)
      }
      if (allCreateToolIds.length > 0) {
        vapiConfig.toolIds = allCreateToolIds
        console.log('Setting toolIds on new assistant:', allCreateToolIds)
      }
      const vapiData = await withRetry(() => vapiService.createAssistant(vapiConfig))
      console.log('Successfully created Vapi assistant:', { requestId, assistantId: vapiData.id })

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
