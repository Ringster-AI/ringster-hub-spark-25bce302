-- Fix the remaining 5 functions that still don't have search_path set correctly

-- Fix assign_free_plan_to_new_user function
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

-- Fix initialize_user_credits function
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

-- Fix is_admin function
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

-- Fix migrate_google_integrations function
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

-- Fix process_campaign_contacts function
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