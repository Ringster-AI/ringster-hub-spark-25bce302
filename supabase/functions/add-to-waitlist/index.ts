
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

    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    const SENDGRID_LIST_ID = Deno.env.get('SENDGRID_LIST_ID');

    console.log('Checking SendGrid configuration...');
    console.log('API Key exists:', !!SENDGRID_API_KEY);
    console.log('List ID exists:', !!SENDGRID_LIST_ID);

    if (!SENDGRID_API_KEY || !SENDGRID_LIST_ID) {
      console.error('SendGrid configuration missing');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Sending request to SendGrid...');
    // Add contact to SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/marketing/contacts', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        list_ids: [SENDGRID_LIST_ID],
        contacts: [{
          email: email
        }]
      })
    });

    const responseText = await response.text();
    console.log('SendGrid API Response:', response.status, responseText);

    if (!response.ok) {
      console.error('SendGrid API error:', responseText);
      throw new Error('Failed to add contact to SendGrid');
    }

    console.log('Successfully added contact to SendGrid');
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
