
import { Handler } from '@netlify/functions';
import { TwilioService } from './services/twilio-service';
import { DatabaseService } from './services/database-service';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID!;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const databaseService = new DatabaseService(supabase);
const twilioService = new TwilioService(twilioAccountSid, twilioAuthToken);

export const handler: Handler = async (event) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const { user, assistant } = payload;

    if (!assistant || !user || !user.phoneNumber) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameters' }),
      };
    }

    // Get agent details from database to get the phone number
    const { data: agentData, error: agentError } = await supabase
      .from('agent_configs')
      .select('phone_number')
      .eq('name', assistant.name)
      .single();

    if (agentError || !agentData) {
      console.error('Error fetching agent:', agentError);
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Agent not found' }),
      };
    }

    if (!agentData.phone_number) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Agent does not have a phone number configured' }),
      };
    }

    // Get the webhook URL from environment variable
    const outboundCallWebhook = process.env.OUTBOUND_CALL_WEBHOOK;
    if (!outboundCallWebhook) {
      throw new Error('OUTBOUND_CALL_WEBHOOK is not configured');
    }

    // Create the webhook URL using URL object to ensure proper encoding
    const webhookUrl = new URL(outboundCallWebhook);
    webhookUrl.searchParams.append('payload', JSON.stringify(payload));

    console.log('Making outbound call with webhook URL:', webhookUrl.toString());

    // Initiate the call using Twilio
    const call = await twilioService.makeOutboundCall(
      agentData.phone_number,
      user.phoneNumber,
      webhookUrl.toString()
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Call initiated successfully',
        callSid: call.sid,
      }),
    };
  } catch (error) {
    console.error('Error making outbound call:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to initiate call' }),
    };
  }
};
