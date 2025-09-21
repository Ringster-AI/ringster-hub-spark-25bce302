-- Phase 1: Fix Critical Database Issues

-- 1. Fix User Roles Infinite Recursion
-- Drop the problematic recursive policy and recreate it properly
DROP POLICY IF EXISTS "Allow admins to manage roles" ON public.user_roles;

-- Create proper admin management policy using the security definer function
CREATE POLICY "Allow admins to manage roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Secure Database Functions - Add proper search_path to all security definer functions
-- Update has_role function to be more secure
CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, role_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = $1 AND role::text = $2
  );
$$;

-- Update deduct_credits function
CREATE OR REPLACE FUNCTION public.deduct_credits(p_user_id uuid, p_credits_amount integer, p_description text DEFAULT NULL::text, p_call_log_id uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_credits INTEGER;
  available_credits INTEGER;
BEGIN
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

-- Update add_credits function
CREATE OR REPLACE FUNCTION public.add_credits(p_user_id uuid, p_credits_amount integer, p_credit_type text DEFAULT 'add_on'::text, p_description text DEFAULT NULL::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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

-- Update reset_monthly_credits function
CREATE OR REPLACE FUNCTION public.reset_monthly_credits(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  plan_credits_amount INTEGER;
BEGIN
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

-- Update handle_subscription_update function
CREATE OR REPLACE FUNCTION public.handle_subscription_update(user_id uuid, new_plan_id uuid, new_status text, new_period_start timestamp with time zone, new_period_end timestamp with time zone)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- First try to update existing subscription
  UPDATE user_subscriptions
  SET 
    plan_id = new_plan_id,
    status = new_status,
    current_period_start = new_period_start,
    current_period_end = new_period_end,
    updated_at = NOW()
  WHERE user_id = handle_subscription_update.user_id;
  
  -- If no row was updated, insert a new one
  IF NOT FOUND THEN
    INSERT INTO user_subscriptions (
      user_id,
      plan_id,
      status,
      current_period_start,
      current_period_end
    ) VALUES (
      user_id,
      new_plan_id,
      new_status,
      new_period_start,
      new_period_end
    );
  END IF;
END;
$$;

-- Update sync_user_subscription function
CREATE OR REPLACE FUNCTION public.sync_user_subscription(p_user_id uuid, p_plan_id uuid DEFAULT NULL::uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  -- Get the free plan ID if no plan specified
  IF p_plan_id IS NULL THEN
    SELECT id INTO free_plan_id FROM subscription_plans WHERE name = 'Free' AND is_active = true LIMIT 1;
    p_plan_id := free_plan_id;
  END IF;

  -- Update existing subscription or create new one
  INSERT INTO user_subscriptions (
    user_id,
    plan_id,
    status,
    current_period_start,
    current_period_end
  )
  VALUES (
    p_user_id,
    p_plan_id,
    'active',
    NOW(),
    NOW() + INTERVAL '1 month'
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    plan_id = EXCLUDED.plan_id,
    status = EXCLUDED.status,
    current_period_start = EXCLUDED.current_period_start,
    current_period_end = EXCLUDED.current_period_end,
    updated_at = NOW();
END;
$$;