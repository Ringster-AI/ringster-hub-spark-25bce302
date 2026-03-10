
-- Enable btree_gist for gist operator classes on scalar types
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Create vapi_global_config table
CREATE TABLE IF NOT EXISTS public.vapi_global_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.vapi_global_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage vapi_global_config"
  ON public.vapi_global_config FOR ALL
  USING (current_setting('request.jwt.claim.role'::text, true) = 'service_role'::text);

-- Add idempotency_key to calendar_bookings
ALTER TABLE public.calendar_bookings
  ADD COLUMN IF NOT EXISTS idempotency_key text;
DO $$ BEGIN
  ALTER TABLE public.calendar_bookings
    ADD CONSTRAINT calendar_bookings_idempotency_key_unique UNIQUE (idempotency_key);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Clean up duplicates
DELETE FROM public.calendar_bookings a
USING public.calendar_bookings b
WHERE a.id < b.id
  AND a.appointment_datetime = b.appointment_datetime
  AND a.google_integration_id = b.google_integration_id;

-- Immutable function for tstzrange
CREATE OR REPLACE FUNCTION public.booking_tstzrange(
  start_time timestamptz, duration_min integer
) RETURNS tstzrange LANGUAGE sql IMMUTABLE PARALLEL SAFE SET search_path = public
AS $$ SELECT tstzrange(start_time, start_time + (duration_min * interval '1 minute')); $$;

-- Generated text column for gist index
ALTER TABLE public.calendar_bookings
  ADD COLUMN IF NOT EXISTS google_integration_id_text text
  GENERATED ALWAYS AS (google_integration_id::text) STORED;

-- Exclusion constraint for overlap prevention
ALTER TABLE public.calendar_bookings
  ADD CONSTRAINT no_overlapping_bookings
  EXCLUDE USING gist (
    google_integration_id_text WITH =,
    booking_tstzrange(appointment_datetime, duration_minutes) WITH &&
  )
  WHERE (google_integration_id_text IS NOT NULL);

-- Service role policies
CREATE POLICY "Service role can insert calendar bookings"
  ON public.calendar_bookings FOR INSERT TO public
  WITH CHECK (current_setting('request.jwt.claim.role'::text, true) = 'service_role'::text);
CREATE POLICY "Service role can update calendar bookings"
  ON public.calendar_bookings FOR UPDATE TO public
  USING (current_setting('request.jwt.claim.role'::text, true) = 'service_role'::text);
CREATE POLICY "Service role can select calendar bookings"
  ON public.calendar_bookings FOR SELECT TO public
  USING (current_setting('request.jwt.claim.role'::text, true) = 'service_role'::text);
CREATE POLICY "Service role can insert booking requests"
  ON public.booking_requests FOR INSERT TO public
  WITH CHECK (current_setting('request.jwt.claim.role'::text, true) = 'service_role'::text);
CREATE POLICY "Service role can manage tool call logs"
  ON public.tool_call_logs FOR ALL TO public
  USING (current_setting('request.jwt.claim.role'::text, true) = 'service_role'::text);
CREATE POLICY "Service role can manage integration logs"
  ON public.integration_logs FOR ALL TO public
  USING (current_setting('request.jwt.claim.role'::text, true) = 'service_role'::text);
