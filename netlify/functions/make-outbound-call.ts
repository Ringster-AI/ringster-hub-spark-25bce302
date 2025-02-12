
import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { createVapiAssistantConfig } from './services/vapi-config';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID!;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
      .select('*')
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

    // Format the payload for Vapi - pass through all customer metadata
    const vapiPayload = {
      assistant: {
        ...createVapiAssistantConfig(agentData),
        firstMessageMode: "assistant-speaks-first",
      },
      phoneNumber: {
        twilioAccountSid,
        twilioAuthToken,
        twilioPhoneNumber: agentData.phone_number
      },
      customer: {
        number: user.phoneNumber,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        ...user.metadata // Include all metadata from the CSV directly
      },
      phoneNumberId: agentData.twilio_sid || undefined
    };

    console.log('Making outbound call with payload:', JSON.stringify(vapiPayload, null, 2));

    // Send POST request to webhook
    const response = await fetch(outboundCallWebhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vapiPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Webhook error response:', errorText);
      throw new Error(`Webhook responded with status: ${response.status}`);
    }

    const webhookResponse = await response.json();
    console.log('Webhook response:', webhookResponse);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Call initiated successfully',
        ...webhookResponse,
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
