-- Revoke direct client-side read access to sensitive credential columns.
-- service_role retains full access (used by edge functions).

-- google_integrations
REVOKE SELECT (access_token, refresh_token, scopes) ON public.google_integrations FROM authenticated, anon;

-- microsoft_integrations
REVOKE SELECT (access_token, refresh_token, scopes) ON public.microsoft_integrations FROM authenticated, anon;

-- integrations (generic credentials JSONB)
REVOKE SELECT (credentials) ON public.integrations FROM authenticated, anon;