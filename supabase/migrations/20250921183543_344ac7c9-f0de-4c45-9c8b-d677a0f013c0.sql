-- Fix security vulnerability in contact_submissions table
-- Ensure only authenticated admin users can read contact submissions
-- while keeping anonymous insert capability for contact forms

-- First, ensure RLS is enabled on the table
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Enable insert for everyone" ON public.contact_submissions;

-- Recreate the anonymous insert policy for contact forms 
CREATE POLICY "Allow anonymous contact form submissions" 
ON public.contact_submissions 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Add secure read policy - only authenticated users with admin role can read
CREATE POLICY "Only admins can read contact submissions" 
ON public.contact_submissions 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Ensure no unauthorized updates or deletes
CREATE POLICY "Only admins can update contact submissions" 
ON public.contact_submissions 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete contact submissions" 
ON public.contact_submissions 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));