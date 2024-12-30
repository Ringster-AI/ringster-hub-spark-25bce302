import express from 'express'
import cors from 'cors'
import { ElevenLabsAPI } from './services/elevenlabs'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const port = process.env.PORT || 3001

// Simpler CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())

// Initialize ElevenLabs API with your API key
const elevenLabs = new ElevenLabsAPI(process.env.ELEVENLABS_API_KEY!)

// Endpoint to generate and stream audio
app.post('/api/text-to-speech', async (req, res) => {
  try {
    const { text, voiceId } = req.body

    if (!text || !voiceId) {
      return res.status(400).json({ error: 'Missing required parameters' })
    }

    // Get the audio stream from ElevenLabs
    const audioStream = await elevenLabs.textToSpeech(text, voiceId)

    // Set appropriate headers
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Transfer-Encoding', 'chunked')

    // Pipe the audio stream to the response
    audioStream.pipe(res)
  } catch (error) {
    console.error('Text-to-speech error:', error)
    res.status(500).json({ error: 'Failed to generate speech' })
  }
})

// Endpoint to fetch available voices
app.get('/api/voices', async (_req, res) => {
  try {
    const voices = await elevenLabs.getVoices()
    res.json(voices)
  } catch (error) {
    console.error('Error fetching voices:', error)
    res.status(500).json({ error: 'Failed to fetch voices' })
  }
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
}) 