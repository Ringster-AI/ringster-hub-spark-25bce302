
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Remove any prior schedule with the same name to keep this idempotent
DO $$
BEGIN
  PERFORM cron.unschedule('process-campaigns-every-5min')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'process-campaigns-every-5min');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

SELECT cron.schedule(
  'process-campaigns-every-5min',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://owzerqaududhfwngyqbp.supabase.co/functions/v1/process-campaigns',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93emVycWF1ZHVkaGZ3bmd5cWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0MjgzMjYsImV4cCI6MjA1MTAwNDMyNn0.FgkO0e2Ey77Og15q-pdL4r6Mlz6t9ExJZCm2eXcAhMo"}'::jsonb,
    body := jsonb_build_object('triggered_at', now())
  );
  $$
);
