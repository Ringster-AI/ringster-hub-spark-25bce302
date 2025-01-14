import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import { TwilioService } from './services/twilio-service'
import { DatabaseService } from './services/database-service'

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export const handler: Handler = async (event) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    }
  }

  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    }
  }

  try {
    console.log('Starting Twilio number assignment process')
    
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      throw new Error('Twilio credentials are not configured')
    }

    if (!process.env.WEBHOOK_URL || !process.env.SMS_WEBHOOK_URL) {
      throw new Error('WEBHOOK_URL and SMS_WEBHOOK_URL environment variables are required')
    }

    const { agentId } = JSON.parse(event.body || '{}')
    
    if (!agentId) {
      throw new Error('Agent ID is required')
    }

    const twilioService = new TwilioService(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )
    
    const databaseService = new DatabaseService(supabase)

    // Find and purchase number
    const phoneNumber = await twilioService.findAvailableNumber()
    const purchasedNumber = await twilioService.purchaseNumber(
      phoneNumber,
      process.env.WEBHOOK_URL,
      process.env.SMS_WEBHOOK_URL
    )

    try {
      // Update agent in database
      await databaseService.updateAgentWithPhoneNumber(
        agentId,
        purchasedNumber.phoneNumber,
        purchasedNumber.sid
      )

      // Create/Update Vapi assistant
      const vapiResponse = await fetch(`${event.rawUrl.split('/.netlify')[0]}/.netlify/functions/manage-vapi-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          agentId,
          phoneNumber: purchasedNumber.phoneNumber
        })
      })

      if (!vapiResponse.ok) {
        const vapiError = await vapiResponse.text()
        throw new Error(`Failed to update Vapi assistant: ${vapiError}`)
      }

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          phoneNumber: purchasedNumber.phoneNumber,
          sid: purchasedNumber.sid
        })
      }
    } catch (error) {
      // If database update or Vapi update fails, release the number
      await twilioService.releaseNumber(purchasedNumber.sid)
      throw error
    }
  } catch (error: any) {
    console.error('Error in manage-twilio-number:', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: error.message,
        details: error.code ? `Twilio Error Code: ${error.code}` : undefined
      })
    }
  }
}