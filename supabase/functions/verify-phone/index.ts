import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { phone_number, verification_code, booking_request_id } = await req.json();

    if (!phone_number || !verification_code) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing phone_number or verification_code.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limit verification attempts per phone number
    const rateLimitCheck = await checkRateLimit(supabase, phone_number, 'verification_attempt');
    if (!rateLimitCheck.allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Too many verification attempts. Please try again later.',
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the code via the secure DB function (compares bcrypt hashes server-side)
    const { data: verifyResult, error: verifyError } = await supabase.rpc(
      'verify_phone_code',
      { p_phone_number: phone_number, p_code: verification_code }
    );

    if (verifyError) {
      console.error('verify_phone_code error');
      return new Response(
        JSON.stringify({ success: false, error: 'Verification failed.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const row = Array.isArray(verifyResult) ? verifyResult[0] : verifyResult;
    const status = row?.status as string | undefined;

    if (status === 'too_many_attempts') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Too many failed attempts. Please request a new code.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (status === 'expired') {
      return new Response(
        JSON.stringify({ success: false, error: 'Verification code expired. Please request a new code.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (status !== 'verified') {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired verification code.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update booking request status if provided
    if (booking_request_id) {
      const { data: bookingRequest, error: bookingError } = await supabase
        .from('booking_requests')
        .update({ status: 'verified' })
        .eq('id', booking_request_id)
        .eq('phone_number', phone_number)
        .select()
        .single();

      if (!bookingError && bookingRequest) {
        await supabase
          .from('booking_requests')
          .update({ status: 'booked' })
          .eq('id', booking_request_id);

        await supabase
          .from('calendar_bookings')
          .insert({
            contact_id: bookingRequest.contact_id,
            campaign_id: bookingRequest.campaign_id,
            call_log_id: bookingRequest.call_log_id,
            booking_status: 'confirmed',
            appointment_datetime: bookingRequest.requested_datetime,
            duration_minutes: bookingRequest.duration_minutes,
            attendee_email: bookingRequest.attendee_email,
            attendee_name: bookingRequest.attendee_name,
            appointment_type: bookingRequest.appointment_type,
            notes: bookingRequest.notes,
          });
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Phone number verified successfully!' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Verification error');
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function checkRateLimit(supabase: any, identifier: string, actionType: string) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const { data: existing } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('identifier', identifier)
    .eq('action_type', actionType)
    .gte('window_start', oneHourAgo.toISOString())
    .single();

  if (existing && existing.count >= 10) {
    return { allowed: false };
  }

  if (existing) {
    await supabase
      .from('rate_limits')
      .update({ count: existing.count + 1 })
      .eq('id', existing.id);
  } else {
    await supabase
      .from('rate_limits')
      .insert({ identifier, action_type: actionType, count: 1 });
  }

  return { allowed: true };
}
