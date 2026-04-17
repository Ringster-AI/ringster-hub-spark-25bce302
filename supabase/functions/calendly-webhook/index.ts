import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, calendly-webhook-signature',
};

/**
 * Calendly webhook handler.
 * Subscribes to: invitee.created, invitee.canceled
 * Docs: https://developer.calendly.com/api-docs/ZG9jOjE2OTAyMTYy-webhook-subscriptions
 *
 * Configure your Calendly webhook to POST here:
 *   https://<project>.supabase.co/functions/v1/calendly-webhook
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload = await req.json();
    const event = payload.event as string; // e.g. "invitee.created" / "invitee.canceled"
    const resource = payload.payload || {};

    console.log('Calendly webhook:', event, JSON.stringify(resource).slice(0, 500));

    // Resource fields differ slightly between events; handle both
    const inviteeUri: string | undefined = resource.uri;
    const eventUri: string | undefined = resource.event;
    const startTime: string | undefined = resource.scheduled_event?.start_time || resource.start_time;
    const endTime: string | undefined = resource.scheduled_event?.end_time || resource.end_time;
    const inviteeEmail: string | undefined = resource.email;
    const inviteeName: string | undefined = resource.name;
    const externalId = inviteeUri || eventUri;

    if (!externalId) {
      return new Response(JSON.stringify({ error: 'Missing booking identifier' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (event === 'invitee.canceled') {
      const { error } = await supabase
        .from('calendar_bookings')
        .update({
          booking_status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('provider', 'calendly')
        .eq('external_booking_id', externalId);

      if (error) console.error('Failed to mark Calendly booking cancelled:', error);

      return new Response(JSON.stringify({ ok: true, action: 'cancelled' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (event === 'invitee.created') {
      // Try to update an existing pending row first; if none, insert a lightweight record
      const { data: existing } = await supabase
        .from('calendar_bookings')
        .select('id')
        .eq('provider', 'calendly')
        .eq('external_booking_id', externalId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('calendar_bookings')
          .update({
            booking_status: 'confirmed',
            appointment_datetime: startTime,
            attendee_email: inviteeEmail,
            attendee_name: inviteeName,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else if (startTime) {
        await supabase.from('calendar_bookings').insert({
          provider: 'calendly',
          external_booking_id: externalId,
          booking_status: 'confirmed',
          booking_source: 'external',
          appointment_datetime: startTime,
          attendee_email: inviteeEmail,
          attendee_name: inviteeName,
          metadata: { raw: resource, event_uri: eventUri, end_time: endTime },
        });
      }

      return new Response(JSON.stringify({ ok: true, action: 'confirmed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true, ignored: event }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Calendly webhook error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
