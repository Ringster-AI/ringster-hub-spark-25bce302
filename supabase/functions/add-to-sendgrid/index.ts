
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  email: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const apiKey = Deno.env.get('SENDGRID_API_KEY');
    const listId = Deno.env.get('SENDGRID_LIST_ID');
    
    if (!apiKey || !listId) {
      throw new Error('SendGrid API key or list ID not configured');
    }

    const { email } = await req.json() as EmailRequest;
    
    if (!email) {
      throw new Error('Email is required');
    }
    
    console.log(`Adding email ${email} to SendGrid list ${listId}`);
    
    // Add contact to SendGrid list
    const response = await fetch('https://api.sendgrid.com/v3/marketing/contacts', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        list_ids: [listId],
        contacts: [
          {
            email
          }
        ]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('SendGrid API error:', errorData);
      throw new Error(`SendGrid API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Successfully added to SendGrid:', data);
    
    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in add-to-sendgrid function:', error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500 
      }
    );
  }
});
