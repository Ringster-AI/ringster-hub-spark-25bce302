-- Fix security issue: Restrict ebook_subscribers read access to admins only
-- Drop the current overly permissive read policy
DROP POLICY "Allow authenticated users to read ebook_subscribers" ON public.ebook_subscribers;

-- Create new admin-only read policy using the existing has_role function
CREATE POLICY "Only admins can read ebook_subscribers" 
ON public.ebook_subscribers 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Also restrict update access to admins only (was previously too permissive)
DROP POLICY "Allow authenticated users to update ebook_subscribers" ON public.ebook_subscribers;

CREATE POLICY "Only admins can update ebook_subscribers" 
ON public.ebook_subscribers 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));