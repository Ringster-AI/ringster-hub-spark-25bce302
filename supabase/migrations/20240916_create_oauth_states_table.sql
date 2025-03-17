
-- Create a table for storing OAuth states
CREATE TABLE IF NOT EXISTS public.oauth_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state TEXT NOT NULL,
  code_verifier TEXT NOT NULL,
  return_url TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Add unique constraint on state to prevent duplicates
  CONSTRAINT unique_state UNIQUE (state)
);

-- Create index for faster lookups by state
CREATE INDEX IF NOT EXISTS idx_oauth_states_state ON public.oauth_states(state);

-- Create index for expiry cleanup
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires_at ON public.oauth_states(expires_at);

-- No RLS policies required as this is managed through edge functions
