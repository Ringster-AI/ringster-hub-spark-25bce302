import { Handler } from '@netlify/functions'
import { ElevenLabsAPI } from './services/elevenlabs'

const elevenLabs = new ElevenLabsAPI(process.env.ELEVENLABS_API_KEY!)

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
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
      },
      body: audioBuffer.toString('base64'),
      isBase64Encoded: true
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate speech' })
    }
  }
} 