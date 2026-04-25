-- Live Call Coach sessions table
CREATE TABLE public.live_coach_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '4 hours'),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_live_coach_sessions_user_started ON public.live_coach_sessions (user_id, started_at DESC);
CREATE INDEX idx_live_coach_sessions_token ON public.live_coach_sessions (session_token);

ALTER TABLE public.live_coach_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own live coach sessions"
  ON public.live_coach_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages live coach sessions"
  ON public.live_coach_sessions
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Access check function: returns plan + monthly limit + usage
CREATE OR REPLACE FUNCTION public.has_live_coach_access(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan_name TEXT;
  v_limit INT;
  v_used INT;
  v_allowed BOOLEAN;
BEGIN
  -- Look up the user's active plan name
  SELECT sp.name INTO v_plan_name
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON sp.id = us.plan_id
  WHERE us.user_id = p_user_id
    AND us.status IN ('active', 'trialing')
  ORDER BY us.created_at DESC
  LIMIT 1;

  -- Default to Free if no active subscription
  IF v_plan_name IS NULL THEN
    v_plan_name := 'Free';
  END IF;

  -- Map plan name to monthly session limit
  -- NULL = unlimited
  v_limit := CASE
    WHEN v_plan_name ILIKE 'enterprise%' THEN NULL
    WHEN v_plan_name ILIKE 'professional%' THEN 5
    WHEN v_plan_name ILIKE 'starter%' THEN 1
    ELSE 0
  END;

  -- Count sessions started in the current calendar month
  SELECT COUNT(*)::INT INTO v_used
  FROM public.live_coach_sessions
  WHERE user_id = p_user_id
    AND started_at >= date_trunc('month', now());

  v_allowed := (v_limit IS NULL) OR (v_used < v_limit);

  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'sessions_used', v_used,
    'limit', v_limit,
    'plan_name', v_plan_name
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.has_live_coach_access(UUID) TO authenticated;