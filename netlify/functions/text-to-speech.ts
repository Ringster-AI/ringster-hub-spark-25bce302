import { Handler } from '@netlify/functions'
import { ElevenLabsAPI } from './services/elevenlabs'
import { authenticateRequest, corsHeaders, unauthorizedResponse } from './utils/auth'

const elevenLabs = new ElevenLabsAPI(process.env.ELEVENLABS_API_KEY!)

export const handler: Handler = async (event) => {
  // Enable CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders
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
    const { text, voiceId } = JSON.parse(event.body || '{}')

    if (!text || !voiceId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Missing required parameters' })
      }
    }

    // SECURITY: Limit text length to prevent abuse
    const MAX_TEXT_LENGTH = 5000
    if (text.length > MAX_TEXT_LENGTH) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: `Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters` })
      }
    }

    // Get the audio stream from ElevenLabs
    const audioStream = await elevenLabs.textToSpeech(text, voiceId)
    const chunks: Buffer[] = []
    
    for await (const chunk of audioStream) {
      chunks.push(Buffer.from(chunk))
    }
    
    const audioBuffer = Buffer.concat(chunks)
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        ...corsHeaders
      },
      body: audioBuffer.toString('base64'),
      isBase64Encoded: true
    }
  } catch (error) {
    console.error('Text-to-speech error:', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Failed to generate speech' })
    }
  }
}
