
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookingRequest {
  phone_number: string;
  attendee_name: string;
  attendee_email?: string;
  requested_datetime: string;
  duration_minutes?: number;
  appointment_type?: string;
  notes?: string;
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

    const { type, data } = await req.json();
    console.log('VAPI Calendar Tool Request:', { type, data });

    switch (type) {
      case 'function_call':
        return await handleBookingRequest(supabase, data);
      case 'get_available_slots':
        return await getAvailableSlots(supabase, data);
      default:
        return new Response(
          JSON.stringify({ error: 'Unknown request type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Calendar tool error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleBookingRequest(supabase: any, data: any) {
  const { parameters, call, assistant } = data;
  const bookingData: BookingRequest = parameters;

  console.log('Processing booking request:', bookingData);

  // Validate required fields
  if (!bookingData.phone_number || !bookingData.attendee_name || !bookingData.requested_datetime) {
    return new Response(
      JSON.stringify({
        result: 'I need your phone number, name, and preferred appointment time to book your appointment.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Check rate limiting for booking attempts
  const rateLimitCheck = await checkRateLimit(supabase, bookingData.phone_number, 'booking_attempt');
  if (!rateLimitCheck.allowed) {
    return new Response(
      JSON.stringify({
        result: 'You have made too many booking attempts. Please try again later.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Validate phone number format
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(bookingData.phone_number.replace(/\s|-/g, ''))) {
    return new Response(
      JSON.stringify({
        result: 'Please provide a valid phone number with country code.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Validate appointment time (must be in the future)
  const requestedTime = new Date(bookingData.requested_datetime);
  const now = new Date();
  if (requestedTime <= now) {
    return new Response(
      JSON.stringify({
        result: 'Please choose a future date and time for your appointment.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Create booking request
  const { data: bookingRequest, error } = await supabase
    .from('booking_requests')
    .insert({
      phone_number: bookingData.phone_number,
      attendee_name: bookingData.attendee_name,
      attendee_email: bookingData.attendee_email,
      requested_datetime: bookingData.requested_datetime,
      duration_minutes: bookingData.duration_minutes || 30,
      appointment_type: bookingData.appointment_type || 'consultation',
      notes: bookingData.notes,
      status: 'pending_verification'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating booking request:', error);
    return new Response(
      JSON.stringify({
        result: 'Sorry, there was an error processing your booking request. Please try again.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Send verification SMS
  const verificationResult = await sendVerificationSMS(supabase, bookingData.phone_number);
  if (!verificationResult.success) {
    return new Response(
      JSON.stringify({
        result: 'Sorry, we could not send a verification code to your phone. Please check your number and try again.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Update booking request with verification ID
  await supabase
    .from('booking_requests')
    .update({ verification_id: verificationResult.verification_id })
    .eq('id', bookingRequest.id);

  return new Response(
    JSON.stringify({
      result: `Perfect! I've received your booking request for ${new Date(bookingData.requested_datetime).toLocaleString()}. I've sent a verification code to ${bookingData.phone_number}. Please reply with the code to confirm your appointment.`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getAvailableSlots(supabase: any, data: any) {
  // This would integrate with Google Calendar or other calendar systems
  // For now, return sample available slots
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const slots = [];
  for (let i = 0; i < 8; i++) {
    const slot = new Date(tomorrow);
    slot.setHours(9 + i);
    slots.push(slot.toISOString());
  }

  return new Response(
    JSON.stringify({
      available_slots: slots,
      timezone: 'America/New_York'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function checkRateLimit(supabase: any, identifier: string, actionType: string) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const { data: existing } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('identifier', identifier)
    .eq('action_type', actionType)
    .gte('window_start', oneHourAgo.toISOString())
    .single();

  if (existing && existing.count >= 5) {
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
      .insert({
        identifier,
        action_type: actionType,
        count: 1
      });
  }

  return { allowed: true };
}

async function sendVerificationSMS(supabase: any, phoneNumber: string) {
  try {
    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store the code as a bcrypt hash via the secure DB function
    const { data: verificationId, error } = await supabase.rpc(
      'create_phone_verification',
      { p_phone_number: phoneNumber, p_code: code, p_ttl_minutes: 10 }
    );

    if (error || !verificationId) {
      console.error('Error storing verification');
      return { success: false };
    }

    // In a real implementation, integrate with Twilio or another SMS service.
    // The plaintext code is only known here long enough to send the SMS — never persisted.
    console.log(`Verification code dispatched for ${phoneNumber}`);

    return {
      success: true,
      verification_id: verificationId,
    };
  } catch (error) {
    console.error('Error sending verification SMS');
    return { success: false };
  }
}
