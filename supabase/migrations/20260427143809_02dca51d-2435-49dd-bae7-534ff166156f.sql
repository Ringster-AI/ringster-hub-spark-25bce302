-- Microsoft (Outlook) Calendar integration table, mirroring google_integrations
CREATE TABLE public.microsoft_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  scopes TEXT NOT NULL,
  -- Calendar settings (mirror google_integrations)
  calendar_id TEXT,
  calendar_name TEXT,
  default_duration INTEGER DEFAULT 30,
  buffer_time INTEGER DEFAULT 10,
  availability_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5],
  availability_start TEXT DEFAULT '09:00',
  availability_end TEXT DEFAULT '17:00',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.microsoft_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own microsoft integration"
  ON public.microsoft_integrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own microsoft integration"
  ON public.microsoft_integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own microsoft integration"
  ON public.microsoft_integrations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own microsoft integration"
  ON public.microsoft_integrations FOR DELETE
  USING (auth.uid() = user_id);

-- Reuse existing public.update_updated_at_column() trigger function
CREATE TRIGGER update_microsoft_integrations_updated_at
  BEFORE UPDATE ON public.microsoft_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_microsoft_integrations_user_id ON public.microsoft_integrations(user_id);