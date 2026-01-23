import { Handler } from '@netlify/functions'
import { ElevenLabsAPI } from './services/elevenlabs'
import { authenticateRequest, corsHeaders, unauthorizedResponse } from './utils/auth'

const elevenLabs = new ElevenLabsAPI(process.env.ELEVENLABS_API_KEY!)

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    }
  }

  if (event.httpMethod !== 'GET') {
    return { 
      statusCode: 405, 
      headers: corsHeaders,
      body: 'Method Not Allowed' 
    }
  }

  // SECURITY: Authenticate the request
  const authResult = await authenticateRequest(event.headers.authorization)
  if (authResult.error || !authResult.user) {
    return unauthorizedResponse(authResult.error || 'Authentication required')
  }

  try {
    const voices = await elevenLabs.getVoices()
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(voices)
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Failed to fetch voices' })
    }
  }
}
