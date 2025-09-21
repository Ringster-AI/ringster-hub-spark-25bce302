-- Fix the remaining database functions with proper search_path configuration
-- The previous migrations didn't properly set the search_path

-- Update handle_updated_at function 
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Update check_campaign_status_transition function
CREATE OR REPLACE FUNCTION public.check_campaign_status_transition()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Only allow specific status transitions
  IF OLD.status = 'draft' AND NEW.status NOT IN ('scheduled', 'running') THEN
    RAISE EXCEPTION 'Invalid status transition from draft to %', NEW.status;
  ELSIF OLD.status = 'scheduled' AND NEW.status NOT IN ('running', 'paused', 'completed') THEN
    RAISE EXCEPTION 'Invalid status transition from scheduled to %', NEW.status;
  ELSIF OLD.status = 'running' AND NEW.status NOT IN ('paused', 'completed') THEN
    RAISE EXCEPTION 'Invalid status transition from running to %', NEW.status;
  ELSIF OLD.status = 'paused' AND NEW.status NOT IN ('running', 'completed') THEN
    RAISE EXCEPTION 'Invalid status transition from paused to %', NEW.status;
  ELSIF OLD.status = 'completed' THEN
    RAISE EXCEPTION 'Cannot transition from completed status';
  END IF;
  
  -- Ensure scheduled campaigns have a scheduled_start date
  IF NEW.status = 'scheduled' AND NEW.scheduled_start IS NULL THEN
    RAISE EXCEPTION 'Scheduled campaigns must have a scheduled_start date';
  END IF;

  RETURN NEW;
END;
$$;