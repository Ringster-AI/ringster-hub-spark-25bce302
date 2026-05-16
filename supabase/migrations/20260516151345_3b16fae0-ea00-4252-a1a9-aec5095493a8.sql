-- Tighten oauth_states INSERT policy: disallow anonymous null user_id inserts.
-- Edge functions use the service role and bypass RLS, so legitimate OAuth
-- flows are unaffected.

DROP POLICY IF EXISTS "Users can insert their own oauth states" ON public.oauth_states;
DROP POLICY IF EXISTS "Users can update their own oauth states" ON public.oauth_states;
DROP POLICY IF EXISTS "Users can delete their own oauth states" ON public.oauth_states;
DROP POLICY IF EXISTS "Users can view their own oauth states" ON public.oauth_states;

CREATE POLICY "Authenticated users can insert their own oauth states"
ON public.oauth_states
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view their own oauth states"
ON public.oauth_states
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own oauth states"
ON public.oauth_states
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete their own oauth states"
ON public.oauth_states
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Cleanup helper to remove expired oauth states (callable by service role)
CREATE OR REPLACE FUNCTION public.cleanup_expired_oauth_states()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.oauth_states WHERE expires_at < now();
$$;

REVOKE EXECUTE ON FUNCTION public.cleanup_expired_oauth_states() FROM anon, authenticated;