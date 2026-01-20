-- Fix deduct_credits to verify caller owns the account
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id uuid, 
  p_credits_amount integer, 
  p_description text DEFAULT NULL::text, 
  p_call_log_id uuid DEFAULT NULL::uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_credits INTEGER;
  available_credits INTEGER;
BEGIN
  -- SECURITY: Verify caller is acting on their own account
  IF p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Cannot modify credits for another user';
  END IF;
  
  -- Get current credit status
  SELECT (plan_credits + add_on_credits - credits_used) INTO available_credits
  FROM user_credits
  WHERE user_id = p_user_id;
  
  -- If no credits record exists, return false
  IF available_credits IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Update credits used
  UPDATE user_credits
  SET credits_used = credits_used + p_credits_amount,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Log the transaction
  INSERT INTO credit_transactions (
    user_id,
    transaction_type,
    credits_amount,
    description,
    call_log_id
  ) VALUES (
    p_user_id,
    'deduction',
    p_credits_amount,
    p_description,
    p_call_log_id
  );
  
  RETURN TRUE;
END;
$$;

-- Fix add_credits to verify caller owns the account
-- Note: For purchases via Stripe webhook (service_role), auth.uid() will be NULL
-- so we allow service_role to bypass this check
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id uuid, 
  p_credits_amount integer, 
  p_credit_type text DEFAULT 'add_on'::text, 
  p_description text DEFAULT NULL::text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- SECURITY: Verify caller is acting on their own account OR is service_role
  -- Service role is needed for Stripe webhooks and admin operations
  IF auth.uid() IS NOT NULL AND p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Cannot modify credits for another user';
  END IF;
  
  -- Update credits based on type
  IF p_credit_type = 'plan' THEN
    UPDATE user_credits
    SET plan_credits = plan_credits + p_credits_amount,
        updated_at = now()
    WHERE user_id = p_user_id;
  ELSE
    UPDATE user_credits
    SET add_on_credits = add_on_credits + p_credits_amount,
        updated_at = now()
    WHERE user_id = p_user_id;
  END IF;
  
  -- Log the transaction
  INSERT INTO credit_transactions (
    user_id,
    transaction_type,
    credits_amount,
    description
  ) VALUES (
    p_user_id,
    'addition',
    p_credits_amount,
    p_description
  );
  
  RETURN TRUE;
END;
$$;

-- Fix reset_monthly_credits to verify caller owns the account
CREATE OR REPLACE FUNCTION public.reset_monthly_credits(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  plan_credits_amount INTEGER;
BEGIN
  -- SECURITY: Verify caller is acting on their own account OR is service_role
  IF auth.uid() IS NOT NULL AND p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Cannot reset credits for another user';
  END IF;
  
  -- Get plan credits from subscription
  SELECT sp.credits_allowance INTO plan_credits_amount
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id AND us.status = 'active';
  
  -- Reset credits
  UPDATE user_credits
  SET credits_used = 0,
      plan_credits = COALESCE(plan_credits_amount, 0),
      reset_date = date_trunc('month', now()) + interval '1 month',
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Log the reset
  INSERT INTO credit_transactions (
    user_id,
    transaction_type,
    credits_amount,
    description
  ) VALUES (
    p_user_id,
    'reset',
    COALESCE(plan_credits_amount, 0),
    'Monthly credit reset'
  );
  
  RETURN TRUE;
END;
$$;