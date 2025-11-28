
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    console.log('Processing email submission:', email);
    
    if (!email) {
      console.error('No email provided');
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const MAILERLITE_KEY = Deno.env.get('MAILERLITE_KEY');
    const MAILERLITE_GROUP_ID = Deno.env.get('SENDGRID_LIST_ID'); // Reusing this env var

    console.log('Checking MailerLite configuration...');
    console.log('API Key exists:', !!MAILERLITE_KEY);
    console.log('Group ID exists:', !!MAILERLITE_GROUP_ID);

    if (!MAILERLITE_KEY) {
      console.error('MailerLite configuration missing');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Sending request to MailerLite...');
    
    const payload: any = {
      email
    };
    
    if (MAILERLITE_GROUP_ID) {
      payload.groups = [MAILERLITE_GROUP_ID];
    }
    
    // Add contact to MailerLite
    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MAILERLITE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    console.log('MailerLite API Response:', response.status, responseText);

    if (!response.ok) {
      console.error('MailerLite API error:', responseText);
      throw new Error('Failed to add contact to MailerLite');
    }

    console.log('Successfully added contact to MailerLite');
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Successfully added to waitlist'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in add-to-waitlist function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to add to waitlist',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
