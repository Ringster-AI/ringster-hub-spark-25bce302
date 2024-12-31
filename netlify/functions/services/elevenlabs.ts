import axios from 'axios'
import { Readable } from 'stream'

export class ElevenLabsAPI {
  private apiKey: string
  private baseUrl = 'https://api.elevenlabs.io/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async textToSpeech(text: string, voiceId: string): Promise<Readable> {
    try {
      const response = await axios({
        method: 'POST',
        url: `${this.baseUrl}/text-to-speech/${voiceId}/stream`,
        data: {
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        },
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        responseType: 'stream'
      })

      return response.data
    } catch (error) {
      console.error('ElevenLabs API error:', error)
      throw error
    }
  }

  async getVoices() {
    try {
      const response = await axios.get(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching voices:', error)
      throw error
    }
  }
}