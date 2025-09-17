
import axios, { AxiosInstance } from 'axios'
import { Readable } from 'stream'

export class ElevenLabsAPI {
  private apiKey: string
  private baseUrl = 'https://api.elevenlabs.io/v1'
  private axiosInstance: AxiosInstance

  constructor(apiKey: string) {
    this.apiKey = apiKey
    
    // Create secure axios instance with DoS protection
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000, // 30 second timeout
      maxContentLength: 50 * 1024 * 1024, // 50MB max response size
      maxBodyLength: 10 * 1024 * 1024, // 10MB max request size
      maxRedirects: 5, // Limit redirects
      headers: {
        'xi-api-key': this.apiKey
      }
    })

    // Add request interceptor to validate data URIs
    this.axiosInstance.interceptors.request.use((config) => {
      if (config.url && config.url.startsWith('data:')) {
        const base64Match = config.url.match(/data:[^;]+;base64,(.+)/)
        if (base64Match) {
          const base64Data = base64Match[1]
          const estimatedSize = (base64Data.length * 3) / 4 // Estimate decoded size
          
          const maxSize = config.maxContentLength || 50 * 1024 * 1024
          if (estimatedSize > maxSize) {
            throw new Error(`Data URI payload exceeds maximum size limit: ${estimatedSize} > ${maxSize}`)
          }
        }
      }
      return config
    })
  }

  async textToSpeech(text: string, voiceId: string): Promise<Readable> {
    try {
      // Validate input text size to prevent DoS
      if (text.length > 5000) {
        throw new Error('Text input exceeds maximum length of 5000 characters')
      }

      const response = await this.axiosInstance({
        method: 'POST',
        url: `/text-to-speech/${voiceId}/stream`,
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
      const response = await this.axiosInstance.get('/voices')
      return response.data
    } catch (error) {
      console.error('Error fetching voices:', error)
      throw error
    }
  }
}
