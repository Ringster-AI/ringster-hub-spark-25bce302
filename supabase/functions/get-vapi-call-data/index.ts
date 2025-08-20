import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method Not Allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  try {
    const { callId, action } = await req.json()
    
    if (!callId) {
      throw new Error('Call ID is required')
    }

    const VAPI_API_KEY = Deno.env.get('VAPI_API_KEY')
    if (!VAPI_API_KEY) {
      throw new Error('VAPI_API_KEY is not configured')
    }

    let result = null
    let apiUrl = ''

    switch (action) {
      case 'transcript':
        apiUrl = `https://api.vapi.ai/call/${callId}/transcript`
        break
      case 'recording':
        apiUrl = `https://api.vapi.ai/call/${callId}/recording`
        break
      default:
        throw new Error('Invalid action specified. Use "transcript" or "recording"')
    }

    console.log(`Making request to VAPI: ${apiUrl}`)

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`VAPI API error: ${response.status} ${errorText}`)
      throw new Error(`VAPI API error: ${response.status} ${errorText}`)
    }

    result = await response.json()
    console.log(`Successfully retrieved ${action} for call ${callId}`)

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error: any) {
    console.error('Error in get-vapi-call-data:', error)
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})