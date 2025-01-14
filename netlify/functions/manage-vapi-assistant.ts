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

    if (!VAPI_API_KEY) {
      throw new Error('VAPI_API_KEY is not configured')
    }

    // Get agent details from database
    const { data: agent, error: agentError } = await supabase
      .from('agent_configs')
      .select('*')
      .eq('id', agentId)
      .single()

    if (agentError || !agent) {
      console.error('Failed to fetch agent details:', agentError)
      throw new Error('Failed to fetch agent details')
    }

    console.log('Creating Vapi assistant with config:', {
      name: agent.name,
      phoneNumber: phoneNumber
    })

    // Prepare Vapi assistant configuration
    const vapiAssistant = {
      name: agent.name,
      firstMessage: agent.greeting || "Hello! How can I help you today?",
      model: {
        provider: "openai",
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: agent.description || "You are a helpful AI assistant."
          }
        ]
      },
      voice: {
        provider: "11labs", // Changed from "elevenlabs" to "11labs"
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
          phoneNumber: phoneNumber.replace(/[^\d+]/g, ''), // Clean the phone number format
          timeout: 60,
          record: false
        }
      ] : [],
      endCallMessage: agent.goodbye || "Thank you for calling. Goodbye!",
      silenceTimeoutSeconds: 30,
      maxDurationSeconds: 600
    }

    console.log('Sending request to Vapi API with configuration:', JSON.stringify(vapiAssistant))

    // Create or update Vapi assistant
    const vapiResponse = await fetch(VAPI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(vapiAssistant)
    })

    const responseText = await vapiResponse.text()
    console.log('Vapi API response:', responseText)

    if (!vapiResponse.ok) {
      console.error('Vapi API error:', responseText)
      throw new Error(`Failed to create Vapi assistant: ${responseText}`)
    }

    const vapiData = JSON.parse(responseText)

    console.log('Successfully created Vapi assistant:', vapiData)

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

    console.log('Successfully updated agent config with Vapi assistant ID')

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