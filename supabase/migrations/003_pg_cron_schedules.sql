-- pg_cron schedules for data ingestion
-- Run these AFTER deploying Edge Functions and replacing <project> with your Supabase project ref

-- NWS Alerts: every 5 minutes
-- SELECT cron.schedule('ingest-nws', '*/5 * * * *', $$
--   SELECT net.http_post(
--     url := 'https://<project>.supabase.co/functions/v1/ingest-nws-alerts',
--     headers := '{"Authorization": "Bearer <service_role_key>"}'::jsonb
--   )
-- $$);

-- FEMA Shelters: every 30 minutes
-- SELECT cron.schedule('ingest-fema', '*/30 * * * *', $$
--   SELECT net.http_post(
--     url := 'https://<project>.supabase.co/functions/v1/ingest-fema-shelters',
--     headers := '{"Authorization": "Bearer <service_role_key>"}'::jsonb
--   )
-- $$);

-- Storm Reports: every 15 minutes
-- SELECT cron.schedule('ingest-lsr', '*/15 * * * *', $$
--   SELECT net.http_post(
--     url := 'https://<project>.supabase.co/functions/v1/ingest-storm-reports',
--     headers := '{"Authorization": "Bearer <service_role_key>"}'::jsonb
--   )
-- $$);

-- HWO: every 60 minutes
-- SELECT cron.schedule('ingest-hwo', '0 * * * *', $$
--   SELECT net.http_post(
--     url := 'https://<project>.supabase.co/functions/v1/ingest-hwo',
--     headers := '{"Authorization": "Bearer <service_role_key>"}'::jsonb
--   )
-- $$);

-- Cleanup expired alerts: every 30 minutes
-- SELECT cron.schedule('prune-alerts', '*/30 * * * *', $$
--   SELECT prune_expired_alerts()
-- $$);

-- Cleanup old cron run details (prevent table bloat)
-- SELECT cron.schedule('cleanup-cron-history', '0 3 * * *', $$
--   DELETE FROM cron.job_run_details WHERE end_time < NOW() - INTERVAL '7 days'
-- $$);
