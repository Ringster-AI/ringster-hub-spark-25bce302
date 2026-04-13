
-- =============================================
-- Fix spoofable service role RLS policies
-- Service role bypasses RLS in Supabase, so these are redundant AND dangerous
-- =============================================

-- booking_requests
DROP POLICY IF EXISTS "Service role can insert booking requests" ON public.booking_requests;

-- calendar_bookings
DROP POLICY IF EXISTS "Service role can insert calendar bookings" ON public.calendar_bookings;
DROP POLICY IF EXISTS "Service role can select calendar bookings" ON public.calendar_bookings;
DROP POLICY IF EXISTS "Service role can update calendar bookings" ON public.calendar_bookings;

-- cookie_consent_logs
DROP POLICY IF EXISTS "Service role can manage cookie consent logs" ON public.cookie_consent_logs;

-- credit_transactions
DROP POLICY IF EXISTS "Service role can manage all credit transactions" ON public.credit_transactions;

-- integration_logs
DROP POLICY IF EXISTS "Service role can manage integration logs" ON public.integration_logs;

-- oauth_states
DROP POLICY IF EXISTS "Service role can manage all oauth states" ON public.oauth_states;

-- plan_features
DROP POLICY IF EXISTS "Service role can manage plan features" ON public.plan_features;

-- tool_call_logs
DROP POLICY IF EXISTS "Service role can manage tool call logs" ON public.tool_call_logs;

-- user_credits
DROP POLICY IF EXISTS "Service role can manage all credits" ON public.user_credits;

-- vapi_global_config
DROP POLICY IF EXISTS "Service role can manage vapi_global_config" ON public.vapi_global_config;

-- =============================================
-- Secure process_campaign_contacts() - restrict to service role only
-- =============================================
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
    -- SECURITY: Only allow service_role to execute this function
    IF current_setting('role', true) IS DISTINCT FROM 'rds_superuser'
       AND auth.role() IS DISTINCT FROM 'service_role' THEN
        RAISE EXCEPTION 'Access denied: function can only be called by service role';
    END IF;

    webhook_url := current_setting('app.settings.outbound_webhook_url', true);
    
    IF webhook_url IS NULL OR webhook_url = '' THEN
        RAISE NOTICE 'Outbound webhook URL not configured, skipping campaign processing';
        RETURN;
    END IF;
    
    FOR campaign_record IN 
        SELECT c.*, a.phone_number, a.twilio_sid
        FROM campaigns c
        JOIN agent_configs a ON c.agent_id = a.id
        WHERE c.status = 'running' 
        OR (c.status = 'scheduled' AND c.scheduled_start <= NOW())
    LOOP
        IF campaign_record.status = 'scheduled' THEN
            UPDATE campaigns 
            SET status = 'running' 
            WHERE id = campaign_record.id;
        END IF;

        FOR contact_record IN 
            SELECT * 
            FROM campaign_contacts 
            WHERE campaign_id = campaign_record.id 
            AND status = 'pending'
            AND (last_call_at IS NULL OR last_call_at <= NOW() - INTERVAL '1 hour')
            AND call_attempts < 3
            LIMIT 5
        LOOP
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

-- Restrict function execution
REVOKE EXECUTE ON FUNCTION public.process_campaign_contacts() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.process_campaign_contacts() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.process_campaign_contacts() TO service_role;
