-- Fix the syntax error in the previous migration
-- Complete Phase 3: Secure Business Data

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

-- Admins can manage plans - separate policies for each operation
CREATE POLICY "Admins can insert subscription plans" 
ON public.subscription_plans 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update subscription plans" 
ON public.subscription_plans 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete subscription plans" 
ON public.subscription_plans 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Secure plan_features table
-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Anyone can view plan features" ON public.plan_features;

-- Create secure policies for plan_features
CREATE POLICY "Authenticated users can view plan features" 
ON public.plan_features 
FOR SELECT 
TO authenticated
USING (true);

-- Admins can manage plan features - separate policies for each operation
CREATE POLICY "Admins can insert plan features" 
ON public.plan_features 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update plan features" 
ON public.plan_features 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete plan features" 
ON public.plan_features 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));