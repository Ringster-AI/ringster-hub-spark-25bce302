-- Phase 2: Fix remaining database functions and secure business data

-- Update remaining functions with proper search_path
CREATE OR REPLACE FUNCTION public.update_minutes_used(p_user_id uuid, p_minutes integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the minutes used in the current period
  UPDATE user_subscriptions
  SET minutes_used = COALESCE(minutes_used, 0) + p_minutes
  WHERE user_id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_roles
        WHERE user_id = $1
        AND role = 'admin'
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.migrate_google_integrations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Migrate existing google_integrations to new integrations table
  INSERT INTO integrations (
    user_id,
    integration_type,
    provider_name,
    display_name,
    status,
    configuration,
    credentials,
    capabilities,
    expires_at,
    created_at,
    updated_at
  )
  SELECT 
    user_id,
    'google_calendar' as integration_type,
    'google' as provider_name,
    'Google Calendar' as display_name,
    'connected' as status,
    jsonb_build_object(
      'calendar_id', calendar_id,
      'calendar_name', calendar_name,
      'default_duration', default_duration,
      'buffer_time', buffer_time,
      'availability_days', availability_days,
      'availability_start', availability_start,
      'availability_end', availability_end
    ) as configuration,
    jsonb_build_object(
      'access_token', access_token,
      'refresh_token', refresh_token,
      'scopes', scopes
    ) as credentials,
    ARRAY['calendar'] as capabilities,
    expires_at,
    created_at,
    updated_at
  FROM google_integrations
  ON CONFLICT (user_id, integration_type) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.process_campaign_contacts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    campaign_record RECORD;
    contact_record RECORD;
    webhook_url TEXT;
BEGIN
    -- Get webhook URL from environment variable instead of database setting
    webhook_url := current_setting('app.settings.outbound_webhook_url', true);
    
    -- Skip processing if webhook URL is not configured
    IF webhook_url IS NULL OR webhook_url = '' THEN
        RAISE NOTICE 'Outbound webhook URL not configured, skipping campaign processing';
        RETURN;
    END IF;
    
    -- Get active campaigns that are either scheduled for now or running
    FOR campaign_record IN 
        SELECT c.*, a.phone_number, a.twilio_sid
        FROM campaigns c
        JOIN agent_configs a ON c.agent_id = a.id
        WHERE c.status = 'running' 
        OR (c.status = 'scheduled' AND c.scheduled_start <= NOW())
    LOOP
        -- Update campaign status to running if it was scheduled
        IF campaign_record.status = 'scheduled' THEN
            UPDATE campaigns 
            SET status = 'running' 
            WHERE id = campaign_record.id;
        END IF;

        -- Process each contact for this campaign
        FOR contact_record IN 
            SELECT * 
            FROM campaign_contacts 
            WHERE campaign_id = campaign_record.id 
            AND status = 'pending'
            AND (last_call_at IS NULL OR last_call_at <= NOW() - INTERVAL '1 hour')
            AND call_attempts < 3
            LIMIT 5  -- Process 5 contacts at a time to avoid overload
        LOOP
            -- Make the outbound call via webhook
            PERFORM net.http_post(
                url:=webhook_url,
                headers:=jsonb_build_object(
                    'Content-Type', 'application/json'
                ),
                body:=jsonb_build_object(
                    'assistant', jsonb_build_object(
                        'name', campaign_record.name,
                        'description', campaign_record.description,
                        'firstMessageMode', 'assistant-speaks-first'
                    ),
                    'phoneNumber', jsonb_build_object(
                        'twilioPhoneNumber', campaign_record.phone_number
                    ),
                    'customer', jsonb_build_object(
                        'number', contact_record.phone_number,
                        'firstName', contact_record.first_name,
                        'lastName', contact_record.last_name
                    ) || contact_record.metadata,
                    'phoneNumberId', campaign_record.twilio_sid
                )
            );

            -- Update contact status
            UPDATE campaign_contacts 
            SET 
                status = 'scheduled',
                call_attempts = call_attempts + 1,
                last_call_at = NOW()
            WHERE id = contact_record.id;
        END LOOP;
    END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.initialize_user_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO profiles (id, full_name, email)
    VALUES (
        new.id,
        new.raw_user_meta_data->>'full_name',
        new.email
    );
    RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_free_plan_to_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    free_plan_id uuid;
BEGIN
    -- Get the free plan ID
    SELECT id INTO free_plan_id FROM subscription_plans WHERE name = 'Free' LIMIT 1;
    
    -- Insert into user_subscriptions with trial period
    INSERT INTO user_subscriptions (
        user_id, 
        plan_id, 
        status,
        current_period_start,
        current_period_end,
        trial_ends_at
    )
    VALUES (
        NEW.id, 
        free_plan_id, 
        'active',
        NOW(),
        NOW() + INTERVAL '1 month',
        NOW() + INTERVAL '7 days'
    );
    
    RETURN NEW;
END;
$$;

-- Phase 3: Secure Business Data - Protect subscription plans and features
-- Currently these tables allow public read access which exposes business strategy

-- Drop existing overly permissive policies on subscription_plans
DROP POLICY IF EXISTS "Anyone can view subscription plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Users can view plans they're subscribed to" ON public.subscription_plans;

-- Create secure policies for subscription_plans
-- Only authenticated users can view basic plan info (for pricing page)
CREATE POLICY "Authenticated users can view active plans" 
ON public.subscription_plans 
FOR SELECT 
TO authenticated
USING (is_active = true);

-- Admins can manage plans
CREATE POLICY "Admins can manage subscription plans" 
ON public.subscription_plans 
FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Secure plan_features table
-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Anyone can view plan features" ON public.plan_features;

-- Create secure policies for plan_features
CREATE POLICY "Authenticated users can view plan features" 
ON public.plan_features 
FOR SELECT 
TO authenticated
USING (true);

-- Admins can manage plan features
CREATE POLICY "Admins can manage plan features" 
ON public.plan_features 
FOR INSERT, UPDATE, DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));