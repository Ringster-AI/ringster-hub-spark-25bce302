import { Handler } from '@netlify/functions'
import { Twilio } from 'twilio'
import { createClient } from '@supabase/supabase-js'

const twilio = new Twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { agentId } = JSON.parse(event.body || '{}')
    
    if (!process.env.WEBHOOK_URL) {
      throw new Error('WEBHOOK_URL environment variable is not configured')
    }

    // 1. Purchase random number
    const numbers = await twilio.availablePhoneNumbers('US')
      .local.list({ limit: 1 })
    
    if (!numbers[0]) {
      throw new Error('No phone numbers available')
    }

    // 2. Purchase the number and set webhook
    const purchasedNumber = await twilio.incomingPhoneNumbers
      .create({
        phoneNumber: numbers[0].phoneNumber,
        voiceUrl: process.env.WEBHOOK_URL,
        voiceMethod: 'POST'
      })

    // 3. Update agent in database with phone number
    const { error } = await supabase
      .from('agent_configs')
      .update({
        phone_number: purchasedNumber.phoneNumber,
        twilio_sid: purchasedNumber.sid
      })
      .eq('id', agentId)

    if (error) throw error

    return {
      statusCode: 200,
      body: JSON.stringify({
        phoneNumber: purchasedNumber.phoneNumber,
        sid: purchasedNumber.sid
      })
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
} 