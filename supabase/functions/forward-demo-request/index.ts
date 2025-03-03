
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DemoRequest {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  teamSize?: string;
  message?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const webhookUrl = Deno.env.get('RINGSTER_THANKYOU');
    
    if (!webhookUrl) {
      throw new Error('Webhook URL not configured');
    }

    const demoData = await req.json() as DemoRequest;
    
    console.log('Forwarding demo request to webhook:', demoData);
    
    // Forward the demo request to the webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'demo_request',
        data: demoData
      })
    });
    
    if (!response.ok) {
      console.error(`Webhook error: ${response.status}`);
      throw new Error(`Webhook error: ${response.status}`);
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in forward-demo-request function:', error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500 
      }
    );
  }
});
