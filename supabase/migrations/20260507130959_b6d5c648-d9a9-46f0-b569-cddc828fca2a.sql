-- Add RLS policies for integration_logs so users can read/write logs for their own integrations
CREATE POLICY "Users can view their own integration logs"
ON public.integration_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.integrations i
    WHERE i.id = integration_logs.integration_id
      AND i.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own integration logs"
ON public.integration_logs FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.integrations i
    WHERE i.id = integration_logs.integration_id
      AND i.user_id = auth.uid()
  )
);

CREATE POLICY "Service role can manage integration logs"
ON public.integration_logs FOR ALL
TO service_role
USING (true)
WITH CHECK (true);