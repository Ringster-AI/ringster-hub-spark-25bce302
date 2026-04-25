-- Backfill user_credits for any auth users missing a row.
-- Admin user marcar82@gmail.com gets a generous allocation; others get a default free-tier row.

INSERT INTO public.user_credits (user_id, plan_credits, add_on_credits, credits_used, reset_date)
SELECT
  u.id,
  CASE WHEN u.email = 'marcar82@gmail.com' THEN 100000 ELSE 60 END AS plan_credits,
  0,
  0,
  date_trunc('month', now()) + interval '1 month'
FROM auth.users u
LEFT JOIN public.user_credits uc ON uc.user_id = u.id
WHERE uc.id IS NULL;