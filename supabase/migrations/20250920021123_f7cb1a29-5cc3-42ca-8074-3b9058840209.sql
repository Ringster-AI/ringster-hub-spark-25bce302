-- Create credits ledger table
CREATE TABLE public.user_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_credits INTEGER NOT NULL DEFAULT 0,
  add_on_credits INTEGER NOT NULL DEFAULT 0,
  credits_used INTEGER NOT NULL DEFAULT 0,
  reset_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (date_trunc('month', now()) + interval '1 month'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create plan features table
CREATE TABLE public.plan_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
  calendar_integration BOOLEAN NOT NULL DEFAULT false,
  retry_logic BOOLEAN NOT NULL DEFAULT false,
  sms_followup BOOLEAN NOT NULL DEFAULT false,
  crm_integration BOOLEAN NOT NULL DEFAULT false,
  ai_insights BOOLEAN NOT NULL DEFAULT false,
  api_access BOOLEAN NOT NULL DEFAULT false,
  call_recording BOOLEAN NOT NULL DEFAULT false,
  appointment_booking BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(plan_id)
);

-- Create credit transactions table for detailed tracking
CREATE TABLE public.credit_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deduction', 'addition', 'reset')),
  credits_amount INTEGER NOT NULL,
  description TEXT,
  call_log_id UUID REFERENCES call_logs(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_credits
CREATE POLICY "Users can view their own credits"
ON public.user_credits
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
ON public.user_credits
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all credits"
ON public.user_credits
FOR ALL
USING (current_setting('request.jwt.claim.role', true) = 'service_role');

-- RLS policies for plan_features
CREATE POLICY "Anyone can view plan features"
ON public.plan_features
FOR SELECT
USING (true);

CREATE POLICY "Service role can manage plan features"
ON public.plan_features
FOR ALL
USING (current_setting('request.jwt.claim.role', true) = 'service_role');

-- RLS policies for credit_transactions
CREATE POLICY "Users can view their own credit transactions"
ON public.credit_transactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all credit transactions"
ON public.credit_transactions
FOR ALL
USING (current_setting('request.jwt.claim.role', true) = 'service_role');

-- Add credits column to subscription_plans
ALTER TABLE public.subscription_plans 
ADD COLUMN credits_allowance INTEGER NOT NULL DEFAULT 0;

-- Update existing plans with credit values
UPDATE public.subscription_plans 
SET credits_allowance = CASE 
  WHEN name = 'Free' THEN 60
  WHEN name = 'Starter' THEN 300
  WHEN name = 'Professional' THEN 1000
  WHEN name = 'Growth' THEN 3000
  ELSE 0
END;

-- Function to deduct credits
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id UUID,
  p_credits_amount INTEGER,
  p_description TEXT DEFAULT NULL,
  p_call_log_id UUID DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Function to add credits
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id UUID,
  p_credits_amount INTEGER,
  p_credit_type TEXT DEFAULT 'add_on', -- 'plan' or 'add_on'
  p_description TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Function to reset monthly credits
CREATE OR REPLACE FUNCTION public.reset_monthly_credits(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Function to initialize credits for new user
CREATE OR REPLACE FUNCTION public.initialize_user_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  plan_credits_amount INTEGER;
BEGIN
  -- Get credits from the plan
  SELECT sp.credits_allowance INTO plan_credits_amount
  FROM subscription_plans sp
  WHERE sp.id = NEW.plan_id;
  
  -- Initialize credits record
  INSERT INTO user_credits (
    user_id,
    plan_credits,
    add_on_credits,
    credits_used
  ) VALUES (
    NEW.user_id,
    COALESCE(plan_credits_amount, 0),
    0,
    0
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plan_credits = COALESCE(plan_credits_amount, 0),
    updated_at = now();
  
  RETURN NEW;
END;
$$;

-- Trigger to initialize credits when subscription is created/updated
CREATE TRIGGER initialize_credits_on_subscription
  AFTER INSERT OR UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_credits();

-- Add updated_at trigger for user_credits
CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON user_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add updated_at trigger for plan_features
CREATE TRIGGER update_plan_features_updated_at
  BEFORE UPDATE ON plan_features
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default plan features for existing plans
INSERT INTO plan_features (plan_id, calendar_integration, retry_logic, sms_followup, crm_integration, ai_insights, api_access, call_recording, appointment_booking)
SELECT 
  id,
  CASE 
    WHEN name = 'Free' THEN false
    WHEN name = 'Starter' THEN true
    WHEN name = 'Professional' THEN true
    WHEN name = 'Growth' THEN true
    ELSE true
  END as calendar_integration,
  CASE 
    WHEN name = 'Free' THEN false
    WHEN name = 'Starter' THEN false
    WHEN name = 'Professional' THEN true
    WHEN name = 'Growth' THEN true
    ELSE true
  END as retry_logic,
  CASE 
    WHEN name = 'Free' THEN false
    WHEN name = 'Starter' THEN false
    WHEN name = 'Professional' THEN true
    WHEN name = 'Growth' THEN true
    ELSE true
  END as sms_followup,
  CASE 
    WHEN name = 'Free' THEN false
    WHEN name = 'Starter' THEN false
    WHEN name = 'Professional' THEN true
    WHEN name = 'Growth' THEN true
    ELSE true
  END as crm_integration,
  CASE 
    WHEN name = 'Free' THEN false
    WHEN name = 'Starter' THEN false
    WHEN name = 'Professional' THEN false
    WHEN name = 'Growth' THEN true
    ELSE true
  END as ai_insights,
  CASE 
    WHEN name = 'Free' THEN false
    WHEN name = 'Starter' THEN false
    WHEN name = 'Professional' THEN true
    WHEN name = 'Growth' THEN true
    ELSE true
  END as api_access,
  CASE 
    WHEN name = 'Free' THEN false
    WHEN name = 'Starter' THEN true
    WHEN name = 'Professional' THEN true
    WHEN name = 'Growth' THEN true
    ELSE true
  END as call_recording,
  CASE 
    WHEN name = 'Free' THEN false
    WHEN name = 'Starter' THEN true
    WHEN name = 'Professional' THEN true
    WHEN name = 'Growth' THEN true
    ELSE true
  END as appointment_booking
FROM subscription_plans
ON CONFLICT (plan_id) DO NOTHING;