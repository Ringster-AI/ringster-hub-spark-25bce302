-- Drop the bypassable service role policy
DROP POLICY IF EXISTS "Service role can manage TCPA consent logs" ON public.tcpa_consent_logs;

-- Re-create with correct auth.role() check
CREATE POLICY "Service role can manage TCPA consent logs"
ON public.tcpa_consent_logs
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');