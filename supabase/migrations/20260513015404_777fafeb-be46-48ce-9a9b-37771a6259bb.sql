
-- 1) Add separate add-on usage tracking
ALTER TABLE public.user_credits
  ADD COLUMN IF NOT EXISTS add_on_credits_used INTEGER NOT NULL DEFAULT 0;

-- 2) Deduct plan first, then overflow into add-on
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id uuid,
  p_credits_amount integer,
  p_description text DEFAULT NULL,
  p_call_log_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_plan_remaining INTEGER;
  v_addon_remaining INTEGER;
  v_total_remaining INTEGER;
  v_from_plan INTEGER;
  v_from_addon INTEGER;
BEGIN
  -- SECURITY: caller must be self OR service_role
  IF auth.uid() IS NOT NULL AND p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Cannot modify credits for another user';
  END IF;

  SELECT
    GREATEST(plan_credits - credits_used, 0),
    GREATEST(add_on_credits - add_on_credits_used, 0)
  INTO v_plan_remaining, v_addon_remaining
  FROM user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_plan_remaining IS NULL THEN
    RETURN FALSE;
  END IF;

  v_total_remaining := v_plan_remaining + v_addon_remaining;
  IF v_total_remaining < p_credits_amount THEN
    RETURN FALSE;
  END IF;

  v_from_plan := LEAST(v_plan_remaining, p_credits_amount);
  v_from_addon := p_credits_amount - v_from_plan;

  UPDATE user_credits
  SET credits_used = credits_used + v_from_plan,
      add_on_credits_used = add_on_credits_used + v_from_addon,
      updated_at = now()
  WHERE user_id = p_user_id;

  INSERT INTO credit_transactions (
    user_id, transaction_type, credits_amount, description, call_log_id
  ) VALUES (
    p_user_id, 'deduction', p_credits_amount, p_description, p_call_log_id
  );

  RETURN TRUE;
END;
$$;

-- 3) Monthly reset: plan only, leave add-on alone
CREATE OR REPLACE FUNCTION public.reset_monthly_credits(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  plan_credits_amount INTEGER;
BEGIN
  IF auth.uid() IS NOT NULL AND p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Cannot reset credits for another user';
  END IF;

  SELECT sp.credits_allowance INTO plan_credits_amount
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id AND us.status = 'active';

  -- Refresh plan only; add_on_credits and add_on_credits_used carry over
  UPDATE user_credits
  SET credits_used = 0,
      plan_credits = COALESCE(plan_credits_amount, 0),
      reset_date = date_trunc('month', now()) + interval '1 month',
      updated_at = now()
  WHERE user_id = p_user_id;

  INSERT INTO credit_transactions (
    user_id, transaction_type, credits_amount, description
  ) VALUES (
    p_user_id, 'reset', COALESCE(plan_credits_amount, 0), 'Monthly plan credit reset'
  );

  RETURN TRUE;
END;
$$;

-- 4) Helper: does the user still have unused add-on credits?
CREATE OR REPLACE FUNCTION public.has_unused_addon_credits(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT (add_on_credits - add_on_credits_used) > 0
     FROM user_credits
     WHERE user_id = p_user_id),
    false
  );
$$;
