-- Move pg_net extension from public schema to extensions schema
-- This fixes the database linter warning: 0014_extension_in_public

ALTER EXTENSION pg_net SET SCHEMA extensions;