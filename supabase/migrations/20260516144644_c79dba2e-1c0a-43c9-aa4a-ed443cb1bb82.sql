-- Explicit service-role-only write policies on user_credits
DROP POLICY IF EXISTS "Service role can insert user credits" ON public.user_credits;
DROP POLICY IF EXISTS "Service role can update user credits" ON public.user_credits;
DROP POLICY IF EXISTS "Service role can delete user credits" ON public.user_credits;

CREATE POLICY "Service role can insert user credits"
ON public.user_credits FOR INSERT TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can update user credits"
ON public.user_credits FOR UPDATE TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Service role can delete user credits"
ON public.user_credits FOR DELETE TO service_role
USING (true);