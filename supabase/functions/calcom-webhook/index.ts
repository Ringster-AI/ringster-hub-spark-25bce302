import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cal-signature-256',
};

/**
 * Cal.com webhook handler.
 * Subscribes to: BOOKING_CREATED, BOOKING_CANCELLED, BOOKING_RESCHEDULED
 * Docs: https://cal.com/docs/core-features/webhooks
 *
 * Configure your Cal.com webhook to POST here:
 *   https://<project>.supabase.co/functions/v1/calcom-webhook
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
    const triggerEvent: string = payload.triggerEvent;
    const data = payload.payload || {};

    console.log('Cal.com webhook:', triggerEvent, JSON.stringify(data).slice(0, 500));

    const externalId = String(data.uid || data.id || '');
    const startTime = data.startTime;
    const endTime = data.endTime;
    const attendee = (data.attendees && data.attendees[0]) || {};

    if (!externalId) {
      return new Response(JSON.stringify({ error: 'Missing booking identifier' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (triggerEvent === 'BOOKING_CANCELLED') {
      await supabase
        .from('calendar_bookings')
        .update({ booking_status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('provider', 'calcom')
        .eq('external_booking_id', externalId);

      return new Response(JSON.stringify({ ok: true, action: 'cancelled' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (triggerEvent === 'BOOKING_CREATED' || triggerEvent === 'BOOKING_RESCHEDULED') {
      const { data: existing } = await supabase
        .from('calendar_bookings')
        .select('id')
        .eq('provider', 'calcom')
        .eq('external_booking_id', externalId)
        .maybeSingle();

      const baseFields = {
        booking_status: 'confirmed',
        appointment_datetime: startTime,
        attendee_email: attendee.email || null,
        attendee_name: attendee.name || null,
        updated_at: new Date().toISOString(),
      };

      if (existing) {
        await supabase.from('calendar_bookings').update(baseFields).eq('id', existing.id);
      } else if (startTime) {
        await supabase.from('calendar_bookings').insert({
          ...baseFields,
          provider: 'calcom',
          external_booking_id: externalId,
          booking_source: 'external',
          metadata: { raw: data, end_time: endTime },
        });
      }

      return new Response(JSON.stringify({ ok: true, action: 'confirmed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true, ignored: triggerEvent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Cal.com webhook error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
