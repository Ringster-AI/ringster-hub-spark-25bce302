import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const VAPI_API_KEY = process.env.VAPI_API_KEY!
const VAPI_API_URL = 'https://api.vapi.ai/assistant'

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export const handler: Handler = async (event) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  }

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

  try {
    console.log('Starting Vapi assistant creation/update process')
    
    const { agentId, phoneNumber } = JSON.parse(event.body || '{}')
    
    if (!agentId) {
      throw new Error('Agent ID is required')
    }

    // Get agent details from database
    const { data: agent, error: agentError } = await supabase
      .from('agent_configs')
      .select('*')
      .eq('id', agentId)
      .single()

    if (agentError || !agent) {
      throw new Error('Failed to fetch agent details')
    }

    // Prepare Vapi assistant configuration
    const vapiAssistant = {
      name: agent.name,
      firstMessage: agent.greeting || "Hello! How can I help you today?",
      model: {
        provider: "openai",
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: agent.description || "You are a helpful AI assistant."
          }
        ]
      },
      voice: {
        provider: "elevenlabs",
        voiceId: agent.config?.voice_id || "21m00Tcm4TlvDq8ikWAM",
      },
      transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "en"
      },
      transportConfigurations: phoneNumber ? [
        {
          provider: "twilio",
          phoneNumber: phoneNumber,
          timeout: 60,
          record: false
        }
      ] : [],
      endCallMessage: agent.goodbye || "Thank you for calling. Goodbye!",
      silenceTimeoutSeconds: 30,
      maxDurationSeconds: 600
    }

    // Create or update Vapi assistant
    const vapiResponse = await fetch(VAPI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(vapiAssistant)
    })

    if (!vapiResponse.ok) {
      const errorData = await vapiResponse.text()
      console.error('Vapi API error:', errorData)
      throw new Error(`Failed to create Vapi assistant: ${errorData}`)
    }

    const vapiData = await vapiResponse.json()

    // Update agent with Vapi assistant ID
    const { error: updateError } = await supabase
      .from('agent_configs')
      .update({
        config: {
          ...agent.config,
          vapi_assistant_id: vapiData.id
        }
      })
      .eq('id', agentId)

    if (updateError) {
      console.error('Error updating agent config:', updateError)
      throw updateError
    }

    console.log('Successfully created/updated Vapi assistant')

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        assistantId: vapiData.id
      })
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