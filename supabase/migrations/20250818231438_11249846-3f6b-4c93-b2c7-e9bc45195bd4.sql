-- Fix critical security vulnerability: Remove public access to profiles table
-- This prevents unauthorized access to customer email addresses, names, phone numbers, and personal data

-- Drop the problematic public policy that allows anyone to view all profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- The remaining policies are secure:
-- - "Users can view their own profile" (auth.uid() = id) - SECURE
-- - "Users can update their own profile." (auth.uid() = id) - SECURE  
-- - "Users can insert their own profile." (auth.uid() = id) - SECURE
-- - "Users can delete their own profile" (auth.uid() = id) - SECURE

-- Verify the profiles table has the correct policies by listing them
-- (This is just for verification - no changes made)
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles' 
ORDER BY policyname;