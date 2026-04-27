-- Ensure pgcrypto is available for bcrypt hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 1) Rename the column to make its new role explicit
ALTER TABLE public.phone_verifications
  RENAME COLUMN verification_code TO verification_code_hash;

-- (Existing rows, if any, contain plaintext codes that will no longer match.
--  They will simply expire naturally per the existing expires_at default.)

-- 2) Helper: create a new verification record, hashing the code before storage
CREATE OR REPLACE FUNCTION public.create_phone_verification(
  p_phone_number TEXT,
  p_code TEXT,
  p_ttl_minutes INTEGER DEFAULT 10
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_id UUID;
BEGIN
  -- Only the backend service role may create verifications
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  INSERT INTO public.phone_verifications (
    phone_number,
    verification_code_hash,
    expires_at,
    attempts,
    verified
  )
  VALUES (
    p_phone_number,
    extensions.crypt(p_code, extensions.gen_salt('bf', 10)),
    now() + make_interval(mins => p_ttl_minutes),
    0,
    false
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_phone_verification(TEXT, TEXT, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_phone_verification(TEXT, TEXT, INTEGER) TO service_role;

-- 3) Helper: verify a code by comparing hashes inside the database
--    Returns one of: 'verified' | 'invalid' | 'expired' | 'too_many_attempts'
CREATE OR REPLACE FUNCTION public.verify_phone_code(
  p_phone_number TEXT,
  p_code TEXT
)
RETURNS TABLE(status TEXT, verification_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_row public.phone_verifications%ROWTYPE;
BEGIN
  -- Only the backend service role may verify
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Pick the most recent unverified record for this phone number
  SELECT *
    INTO v_row
    FROM public.phone_verifications
   WHERE phone_number = p_phone_number
     AND verified = false
   ORDER BY created_at DESC
   LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY SELECT 'invalid'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  IF v_row.expires_at < now() THEN
    RETURN QUERY SELECT 'expired'::TEXT, v_row.id;
    RETURN;
  END IF;

  IF COALESCE(v_row.attempts, 0) >= 3 THEN
    RETURN QUERY SELECT 'too_many_attempts'::TEXT, v_row.id;
    RETURN;
  END IF;

  -- Compare against the bcrypt hash
  IF v_row.verification_code_hash = extensions.crypt(p_code, v_row.verification_code_hash) THEN
    UPDATE public.phone_verifications
       SET verified = true,
           updated_at = now()
     WHERE id = v_row.id;

    RETURN QUERY SELECT 'verified'::TEXT, v_row.id;
    RETURN;
  ELSE
    UPDATE public.phone_verifications
       SET attempts = COALESCE(attempts, 0) + 1,
           updated_at = now()
     WHERE id = v_row.id;

    RETURN QUERY SELECT 'invalid'::TEXT, v_row.id;
    RETURN;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.verify_phone_code(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_phone_code(TEXT, TEXT) TO service_role;