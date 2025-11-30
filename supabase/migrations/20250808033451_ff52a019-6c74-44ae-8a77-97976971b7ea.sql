-- Create waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Ensure unique emails
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' AND indexname = 'idx_waitlist_email_unique'
  ) THEN
    CREATE UNIQUE INDEX idx_waitlist_email_unique ON public.waitlist (email);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anonymous insert to waitlist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'waitlist' AND policyname = 'Allow anonymous insert to waitlist'
  ) THEN
    CREATE POLICY "Allow anonymous insert to waitlist"
    ON public.waitlist
    FOR INSERT
    WITH CHECK (true);
  END IF;
END $$;

-- Allow authenticated users to read waitlist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'waitlist' AND policyname = 'Allow authenticated users to read waitlist'
  ) THEN
    CREATE POLICY "Allow authenticated users to read waitlist"
    ON public.waitlist
    FOR SELECT
    USING (true);
  END IF;
END $$;