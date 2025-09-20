-- Fix security issue: Restrict demo_requests read access to admins only
-- Drop the current overly permissive read policy
DROP POLICY "Allow authenticated users to read demo_requests" ON public.demo_requests;

-- Create new admin-only read policy using the existing has_role function
CREATE POLICY "Only admins can read demo_requests" 
ON public.demo_requests 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));