-- Drop the overly permissive policies that used USING-only on ALL
DROP POLICY IF EXISTS "Users can manage their booking requests" ON public.booking_requests;
DROP POLICY IF EXISTS "Users can view their booking requests" ON public.booking_requests;

-- Service role retains full access (used by vapi-calendar-tool edge function)
CREATE POLICY "Service role manages booking requests"
ON public.booking_requests
FOR ALL
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Authenticated owners: SELECT
CREATE POLICY "Owners can view booking requests"
ON public.booking_requests
FOR SELECT
TO authenticated
USING (
  campaign_id IN (
    SELECT id FROM public.campaigns WHERE user_id = auth.uid()
  )
);

-- Authenticated owners: INSERT (requires WITH CHECK)
CREATE POLICY "Owners can create booking requests"
ON public.booking_requests
FOR INSERT
TO authenticated
WITH CHECK (
  campaign_id IN (
    SELECT id FROM public.campaigns WHERE user_id = auth.uid()
  )
);

-- Authenticated owners: UPDATE
CREATE POLICY "Owners can update booking requests"
ON public.booking_requests
FOR UPDATE
TO authenticated
USING (
  campaign_id IN (
    SELECT id FROM public.campaigns WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  campaign_id IN (
    SELECT id FROM public.campaigns WHERE user_id = auth.uid()
  )
);

-- Authenticated owners: DELETE
CREATE POLICY "Owners can delete booking requests"
ON public.booking_requests
FOR DELETE
TO authenticated
USING (
  campaign_id IN (
    SELECT id FROM public.campaigns WHERE user_id = auth.uid()
  )
);