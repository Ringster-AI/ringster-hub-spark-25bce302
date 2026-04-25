-- Update team-member limits per plan tier
UPDATE public.subscription_plans
SET max_team_members = 3
WHERE name IN ('Starter', 'Starter - Yearly');

UPDATE public.subscription_plans
SET max_team_members = 5
WHERE name IN ('Professional', 'Professional - Yearly');

UPDATE public.subscription_plans
SET max_team_members = 20
WHERE name IN ('Enterprise', 'Enterprise - Yearly');

-- Insert (or update) the 500-credit add-on plan at $149
-- Marked as a credit add-on via is_pay_as_you_go flag and 0 agents/team members so it doesn't act as a plan tier.
INSERT INTO public.subscription_plans (
  name,
  price,
  minutes_allowance,
  credits_allowance,
  features,
  max_team_members,
  max_agents,
  billing_interval,
  is_active,
  is_pay_as_you_go,
  stripe_price_id,
  prod_id
)
VALUES (
  '500 Credits Add-On',
  149.00,
  500,
  500,
  '{"features": ["500 additional credits", "One-time purchase", "Never expires"], "max_agents": 0, "is_addon": true}'::jsonb,
  0,
  0,
  'one_time',
  true,
  true,
  NULL,
  NULL
)
ON CONFLICT DO NOTHING;