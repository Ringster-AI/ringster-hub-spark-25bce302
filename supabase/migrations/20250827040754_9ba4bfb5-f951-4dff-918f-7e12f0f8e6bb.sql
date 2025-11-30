-- Fix security issue: Remove public read access to waitlist table
-- The waitlist table currently allows any authenticated user to read all email addresses
-- This is a privacy risk and should be restricted to admin users only

-- Drop the existing overly permissive read policy
DROP POLICY IF EXISTS "Allow authenticated users to read waitlist" ON public.waitlist;

-- Create a new policy that only allows admin users to read waitlist data
CREATE POLICY "Only admins can read waitlist" 
ON public.waitlist 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Keep the anonymous insert policy as it's needed for public forms
-- This policy already exists and is secure (allows insert but not read)
-- Policy: "Allow anonymous insert to waitlist" - this stays as is