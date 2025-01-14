import { Handler } from '@netlify/functions'
import { Twilio } from 'twilio'
import { createClient } from '@supabase/supabase-js'

const twilio = new Twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

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
      console.error('Missing Twilio credentials')
      throw new Error('Twilio credentials are not configured')
    }

    if (!process.env.WEBHOOK_URL || !process.env.SMS_WEBHOOK_URL) {
      console.error('Missing webhook URLs')
      throw new Error('WEBHOOK_URL and SMS_WEBHOOK_URL environment variables are required')
    }

    const { agentId } = JSON.parse(event.body || '{}')
    
    if (!agentId) {
      console.error('Missing agentId in request body')
      throw new Error('Agent ID is required')
    }

    console.log(`Searching for available numbers for agent ${agentId}`)
    
    // 1. Purchase random number
    const numbers = await twilio.availablePhoneNumbers('US')
      .local.list({ limit: 1 })
    
    if (!numbers[0]) {
      console.error('No phone numbers available from Twilio')
      throw new Error('No phone numbers available')
    }

    console.log(`Found available number: ${numbers[0].phoneNumber}`)

    // 2. Purchase the number and set webhooks
    const purchasedNumber = await twilio.incomingPhoneNumbers
      .create({
        phoneNumber: numbers[0].phoneNumber,
        voiceUrl: process.env.WEBHOOK_URL,
        voiceMethod: 'POST',
        smsUrl: process.env.SMS_WEBHOOK_URL,
        smsMethod: 'POST'
      })

    console.log(`Successfully purchased number: ${purchasedNumber.phoneNumber}`)

    // 3. Update agent in database with phone number
    const { error: updateError } = await supabase
      .from('agent_configs')
      .update({
        phone_number: purchasedNumber.phoneNumber,
        twilio_sid: purchasedNumber.sid
      })
      .eq('id', agentId)

    if (updateError) {
      console.error('Error updating agent config:', updateError)
      try {
        await twilio.incomingPhoneNumbers(purchasedNumber.sid).remove()
        console.log('Released Twilio number due to database update failure')
      } catch (releaseError) {
        console.error('Failed to release Twilio number:', releaseError)
      }
      throw updateError
    }

    // 4. Create/Update Vapi assistant with the new phone number
    const vapiResponse = await fetch('/.netlify/functions/manage-vapi-assistant', {
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
      console.error('Failed to update Vapi assistant')
      const vapiError = await vapiResponse.text()
      console.error('Vapi error:', vapiError)
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        phoneNumber: purchasedNumber.phoneNumber,
        sid: purchasedNumber.sid
      })
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