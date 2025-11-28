
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  email: string;
  name?: string;
  last_name?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const apiKey = Deno.env.get('MAILERLITE_KEY');
    const groupId = Deno.env.get('SENDGRID_LIST_ID'); // Reusing this env var for MailerLite group ID
    
    if (!apiKey) {
      throw new Error('MailerLite API key not configured');
    }

    const { email, name, last_name } = await req.json() as EmailRequest;
    
    if (!email) {
      throw new Error('Email is required');
    }
    
    console.log(`Adding email ${email} to MailerLite group ${groupId}`);
    
    // Add contact to MailerLite
    const payload: any = {
      email,
      fields: {}
    };
    
    if (name) payload.fields.name = name;
    if (last_name) payload.fields.last_name = last_name;
    if (groupId) payload.groups = [groupId];
    
    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('MailerLite API error:', errorData);
      throw new Error(`MailerLite API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Successfully added to MailerLite:', data);
    
    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in add-to-mailerlite function:', error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500 
      }
    );
  }
});
