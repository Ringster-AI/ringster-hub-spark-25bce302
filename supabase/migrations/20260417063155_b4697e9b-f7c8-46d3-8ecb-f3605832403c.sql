
-- Add external booking ID and provider tracking to calendar_bookings (for Cal.com / Calendly webhooks)
ALTER TABLE public.calendar_bookings
  ADD COLUMN IF NOT EXISTS external_booking_id TEXT,
  ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'google',
  ADD COLUMN IF NOT EXISTS integration_id UUID REFERENCES public.integrations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_calendar_bookings_external_id ON public.calendar_bookings(provider, external_booking_id);
CREATE INDEX IF NOT EXISTS idx_calendar_bookings_integration_id ON public.calendar_bookings(integration_id);

-- Allow users to delete their own calendar bookings
CREATE POLICY "Users can delete their own calendar bookings"
ON public.calendar_bookings
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.campaigns c
  WHERE c.id = calendar_bookings.campaign_id AND c.user_id = auth.uid()
));

-- Allow service role to manage bookings (for webhook handlers)
CREATE POLICY "Service role can manage calendar bookings"
ON public.calendar_bookings
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Allow users to delete their own follow up sequences
CREATE POLICY "Users can delete their own follow up sequences"
ON public.follow_up_sequences
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.campaigns c
  WHERE c.id = follow_up_sequences.campaign_id AND c.user_id = auth.uid()
));

-- Add RLS to vapi_global_config (was missing)
ALTER TABLE public.vapi_global_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can read vapi global config"
ON public.vapi_global_config
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can modify vapi global config"
ON public.vapi_global_config
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role full access to vapi global config"
ON public.vapi_global_config
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
