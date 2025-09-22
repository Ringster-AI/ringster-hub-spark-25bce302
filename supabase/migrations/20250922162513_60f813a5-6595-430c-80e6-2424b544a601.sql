-- Fix extension in public schema warning for pg_net
-- Since pg_net doesn't support SET SCHEMA, we need to drop and recreate it in the extensions schema

DROP EXTENSION IF EXISTS pg_net;
CREATE EXTENSION pg_net SCHEMA extensions;