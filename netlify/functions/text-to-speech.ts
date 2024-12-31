import { Handler } from '@netlify/functions'
import { ElevenLabsAPI } from './services/elevenlabs'

const elevenLabs = new ElevenLabsAPI(process.env.ELEVENLABS_API_KEY!)

export const handler: Handler = async (event) => {
  // Enable CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    }
  }

  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: 'Method Not Allowed' })
    }
  }

  try {
    const { text, voiceId } = JSON.parse(event.body || '{}')

    if (!text || !voiceId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameters' })
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
        'Access-Control-Allow-Origin': '*'
      },
      body: audioBuffer.toString('base64'),
      isBase64Encoded: true
    }
  } catch (error) {
    console.error('Text-to-speech error:', error)
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Failed to generate speech' })
    }
  }
}