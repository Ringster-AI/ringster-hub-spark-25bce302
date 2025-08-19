import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Campaign {
  id: string;
  name: string;
  status: string;
  scheduled_start: string | null;
  config: any;
  agent_id: string;
  phone_number?: string;
}

interface Contact {
  id: string;
  campaign_id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  status: string;
  call_attempts: number;
  last_call_at: string | null;
  metadata: any;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Processing campaign contacts...');

    // Get campaigns that need processing
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select(`
        id,
        name,
        status,
        scheduled_start,
        config,
        agent_id,
        agent_configs!inner(phone_number)
      `)
      .or('status.eq.running,and(status.eq.scheduled,scheduled_start.lte.' + new Date().toISOString() + ')');

    if (campaignsError) {
      console.error('Error fetching campaigns:', campaignsError);
      throw campaignsError;
    }

    if (!campaigns || campaigns.length === 0) {
      console.log('No campaigns ready for processing');
      return new Response(
        JSON.stringify({ message: 'No campaigns to process', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let totalProcessed = 0;

    for (const campaign of campaigns) {
      console.log(`Processing campaign: ${campaign.name} (${campaign.id})`);

      // Update scheduled campaigns to running
      if (campaign.status === 'scheduled') {
        await supabase
          .from('campaigns')
          .update({ status: 'running' })
          .eq('id', campaign.id);
        
        console.log(`Campaign ${campaign.id} updated to running status`);
      }

      // Get pending contacts for this campaign
      const { data: contacts, error: contactsError } = await supabase
        .from('campaign_contacts')
        .select('*')
        .eq('campaign_id', campaign.id)
        .eq('status', 'pending')
        .lt('call_attempts', 3)
        .or('last_call_at.is.null,last_call_at.lte.' + new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .limit(5); // Process 5 contacts at a time

      if (contactsError) {
        console.error(`Error fetching contacts for campaign ${campaign.id}:`, contactsError);
        continue;
      }

      if (!contacts || contacts.length === 0) {
        console.log(`No contacts to process for campaign ${campaign.id}`);
        continue;
      }

      // Check business hours
      const config = campaign.config || {};
      const businessHours = config.businessHours || {
        start: '09:00',
        end: '17:00',
        timezone: 'America/New_York',
        days: [1, 2, 3, 4, 5]
      };

      if (!isWithinBusinessHours(businessHours)) {
        console.log(`Outside business hours for campaign ${campaign.id}, skipping`);
        continue;
      }

      // Process contacts
      for (const contact of contacts) {
        try {
          const success = await makeOutboundCall(campaign, contact);
          
          // Update contact status
          await supabase
            .from('campaign_contacts')
            .update({
              status: success ? 'called' : 'pending',
              call_attempts: contact.call_attempts + 1,
              last_call_at: new Date().toISOString()
            })
            .eq('id', contact.id);

          totalProcessed++;
          console.log(`Processed contact ${contact.id}: ${success ? 'success' : 'failed'}`);

        } catch (error) {
          console.error(`Failed to process contact ${contact.id}:`, error);
          
          // Update with failure
          await supabase
            .from('campaign_contacts')
            .update({
              call_attempts: contact.call_attempts + 1,
              last_call_at: new Date().toISOString()
            })
            .eq('id', contact.id);
        }
      }
    }

    console.log(`Campaign processing complete. Total processed: ${totalProcessed}`);

    return new Response(
      JSON.stringify({ 
        message: 'Campaign processing complete',
        campaigns: campaigns.length,
        processed: totalProcessed
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Campaign processing error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function isWithinBusinessHours(businessHours: any): boolean {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  // Check if current day is in business days
  if (!businessHours.days.includes(currentDay)) {
    return false;
  }
  
  // Check if current time is within business hours
  if (currentTime < businessHours.start || currentTime > businessHours.end) {
    return false;
  }
  
  return true;
}

async function makeOutboundCall(campaign: any, contact: Contact): Promise<boolean> {
  const outboundWebhookUrl = Deno.env.get('OUTBOUND_CALL_WEBHOOK');
  
  if (!outboundWebhookUrl) {
    console.error('OUTBOUND_CALL_WEBHOOK not configured');
    return false;
  }

  const payload = {
    assistant: {
      name: campaign.name,
      description: campaign.config?.goalDescription || 'Outbound sales call',
      firstMessageMode: 'assistant-speaks-first'
    },
    phoneNumber: {
      twilioPhoneNumber: campaign.agent_configs?.phone_number
    },
    customer: {
      number: contact.phone_number,
      firstName: contact.first_name,
      lastName: contact.last_name,
      ...contact.metadata
    },
    campaignId: campaign.id,
    contactId: contact.id
  };

  try {
    const response = await fetch(outboundWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error(`Outbound call failed: ${response.status} ${response.statusText}`);
      return false;
    }

    const result = await response.json();
    console.log('Outbound call initiated:', result);
    return true;

  } catch (error) {
    console.error('Error making outbound call:', error);
    return false;
  }
}