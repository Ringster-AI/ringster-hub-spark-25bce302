
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
    const { agentId, toNumber, agent } = JSON.parse(event.body || '{}');

    if (!agentId || !toNumber) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameters' }),
      };
    }

    // Get agent details from database
    const { data: agentData, error: agentError } = await supabase
      .from('agent_configs')
      .select('*')
      .eq('id', agentId)
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

    // Include the agent configuration in the URL parameters
    const outboundCallWebhook = process.env.OUTBOUND_CALL_WEBHOOK;
    if (!outboundCallWebhook) {
      throw new Error('OUTBOUND_CALL_WEBHOOK is not configured');
    }

    const webhookUrl = new URL(outboundCallWebhook);
    // Add each agent config parameter individually for better URL handling
    webhookUrl.searchParams.append('agentName', agent.name);
    webhookUrl.searchParams.append('agentDescription', agent.description || '');
    webhookUrl.searchParams.append('greeting', agent.greeting || '');
    webhookUrl.searchParams.append('goodbye', agent.goodbye || '');
    webhookUrl.searchParams.append('voiceId', agent.voice_id || '');
    webhookUrl.searchParams.append('voiceProvider', agent.voice?.provider || '11labs');
    webhookUrl.searchParams.append('transcriberProvider', agent.transcriber?.provider || 'deepgram');
    webhookUrl.searchParams.append('transcriberModel', agent.transcriber?.model || 'nova-2');
    webhookUrl.searchParams.append('transcriberLanguage', agent.transcriber?.language || 'en');
    webhookUrl.searchParams.append('agentType', agent.agent_type || 'outbound');

    // Initiate the call using Twilio
    const call = await twilioService.makeOutboundCall(agentData.phone_number, toNumber, webhookUrl.toString());

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
