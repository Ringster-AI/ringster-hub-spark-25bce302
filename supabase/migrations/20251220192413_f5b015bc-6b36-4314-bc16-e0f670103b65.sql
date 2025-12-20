-- Add consent tracking fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS terms_accepted_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS marketing_consent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS marketing_consent_at timestamp with time zone;

-- Create TCPA consent logs table for call consent tracking
CREATE TABLE IF NOT EXISTS public.tcpa_consent_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number text NOT NULL,
  name text NOT NULL,
  company text,
  consent_text text NOT NULL,
  consent_given boolean NOT NULL DEFAULT true,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create cookie consent logs table for GDPR compliance
CREATE TABLE IF NOT EXISTS public.cookie_consent_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_id text NOT NULL,
  essential boolean NOT NULL DEFAULT true,
  analytics boolean NOT NULL DEFAULT false,
  marketing boolean NOT NULL DEFAULT false,
  consent_given_at timestamp with time zone NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.tcpa_consent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cookie_consent_logs ENABLE ROW LEVEL SECURITY;

-- TCPA consent logs policies - service role only for security
CREATE POLICY "Service role can manage TCPA consent logs"
ON public.tcpa_consent_logs
FOR ALL
USING (current_setting('request.jwt.claim.role', true) = 'service_role');

-- Allow anonymous inserts for TCPA consent (needed for demo call form)
CREATE POLICY "Allow anonymous TCPA consent insert"
ON public.tcpa_consent_logs
FOR INSERT
WITH CHECK (true);

-- Cookie consent policies
CREATE POLICY "Service role can manage cookie consent logs"
ON public.cookie_consent_logs
FOR ALL
USING (current_setting('request.jwt.claim.role', true) = 'service_role');

-- Allow anonymous inserts for cookie consent
CREATE POLICY "Allow anonymous cookie consent insert"
ON public.cookie_consent_logs
FOR INSERT
WITH CHECK (true);

-- Users can view their own cookie consent logs
CREATE POLICY "Users can view their own cookie consent"
ON public.cookie_consent_logs
FOR SELECT
USING (auth.uid() = user_id);