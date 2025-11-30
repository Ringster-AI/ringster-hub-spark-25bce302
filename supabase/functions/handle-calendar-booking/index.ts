
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookingRequest {
  campaign_id: string;
  contact_id: string;
  call_log_id?: string;
  attendee_name: string;
  attendee_email: string;
  appointment_datetime: string;
  duration_minutes?: number;
  appointment_type?: string;
  notes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const booking: BookingRequest = await req.json();
    console.log('Processing calendar booking:', booking);

    // Validate required fields
    if (!booking.campaign_id || !booking.contact_id || !booking.attendee_name || !booking.appointment_datetime) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create calendar booking
    const { data: calendarBooking, error: bookingError } = await supabase
      .from('calendar_bookings')
      .insert({
        campaign_id: booking.campaign_id,
        contact_id: booking.contact_id,
        call_log_id: booking.call_log_id,
        attendee_name: booking.attendee_name,
        attendee_email: booking.attendee_email,
        appointment_datetime: booking.appointment_datetime,
        duration_minutes: booking.duration_minutes || 30,
        appointment_type: booking.appointment_type || 'consultation',
        notes: booking.notes,
        booking_status: 'pending'
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Error creating calendar booking:', bookingError);
      return new Response(
        JSON.stringify({ error: 'Failed to create booking' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Update contact status
    await supabase
      .from('campaign_contacts')
      .update({ status: 'scheduled' })
      .eq('id', booking.contact_id);

    // Create follow-up sequence for appointment confirmation
    await supabase
      .from('follow_up_sequences')
      .insert({
        campaign_id: booking.campaign_id,
        contact_id: booking.contact_id,
        sequence_type: 'email',
        trigger_event: 'appointment_booked',
        delay_hours: 1,
        content: `Thank you for scheduling your appointment. We look forward to speaking with you on ${new Date(booking.appointment_datetime).toLocaleDateString()} at ${new Date(booking.appointment_datetime).toLocaleTimeString()}.`,
        status: 'pending',
        scheduled_for: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour from now
      });

    console.log('Calendar booking created successfully:', calendarBooking);

    return new Response(
      JSON.stringify({ 
        success: true, 
        booking: calendarBooking 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in handle-calendar-booking function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);
