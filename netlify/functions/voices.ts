import { Handler } from '@netlify/functions'
import { ElevenLabsAPI } from './services/elevenlabs'

const elevenLabs = new ElevenLabsAPI(process.env.ELEVENLABS_API_KEY!)

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const voices = await elevenLabs.getVoices()
    return {
      statusCode: 200,
      body: JSON.stringify(voices)
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch voices' })
    }
  }
} 