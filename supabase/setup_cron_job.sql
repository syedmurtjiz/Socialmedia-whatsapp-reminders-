-- ============================================
-- SETUP CRON JOB FOR SUBSCRIPTION REMINDERS
-- Pakistan Timezone (UTC+5)
-- ============================================

-- INSTRUCTIONS:
-- 1. Replace YOUR_PROJECT_ID with your actual Supabase project ID (from URL)
-- 2. Replace YOUR_SERVICE_ROLE_KEY with your actual service role key
-- 3. Run this SQL in Supabase Dashboard → SQL Editor
-- ============================================

-- ============================================
-- STEP 1: Ensure required extensions are enabled
-- ============================================
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS http;

-- Verify extensions
SELECT 
  extname as extension_name,
  '✅ Enabled' as status
FROM pg_extension
WHERE extname IN ('pg_cron', 'http')
ORDER BY extname;

-- ============================================
-- STEP 2: Delete old cron job (if exists)
-- ============================================
DO $$
BEGIN
  -- Unschedule if exists
  PERFORM cron.unschedule('send-subscription-reminders');
  RAISE NOTICE '✅ Old cron job removed (if existed)';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '⚠️  No old cron job found (this is OK)';
END $$;

-- ============================================
-- STEP 3: Create new cron job
-- ============================================
-- IMPORTANT: Replace these values before running:
-- - YOUR_PROJECT_ID: Get from Supabase URL (e.g., abcdefgh from https://abcdefgh.supabase.co)
-- - YOUR_SERVICE_ROLE_KEY: Get from Dashboard → Settings → API → service_role key

SELECT cron.schedule(
  'send-subscription-reminders',  -- Job name
  '* * * * *',                     -- Schedule: every minute
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/send-reminders',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
      body := '{}'::jsonb
    ) AS request_id;
  $$
);

-- ============================================
-- STEP 4: Verify cron job was created
-- ============================================
SELECT 
  jobid,
  jobname,
  schedule,
  active,
  '✅ Cron job created' as status
FROM cron.job
WHERE jobname = 'send-subscription-reminders';

-- ============================================
-- STEP 5: Check cron schedule explanation
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'CRON JOB CREATED SUCCESSFULLY ✅';
  RAISE NOTICE '====================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Job Name: send-subscription-reminders';
  RAISE NOTICE 'Schedule: * * * * * (every minute)';
  RAISE NOTICE 'Action: Triggers Edge Function to check for reminders';
  RAISE NOTICE '';
  RAISE NOTICE 'The cron job will:';
  RAISE NOTICE '1. Run every minute';
  RAISE NOTICE '2. Call the Edge Function via HTTP POST';
  RAISE NOTICE '3. Edge Function checks current Pakistan time';
  RAISE NOTICE '4. Sends WhatsApp reminders if conditions match';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Wait 1 minute for first execution';
  RAISE NOTICE '2. Check execution history (see query below)';
  RAISE NOTICE '3. Monitor Edge Function logs in Dashboard';
  RAISE NOTICE '';
END $$;

-- ============================================
-- HELPFUL QUERIES FOR MONITORING
-- ============================================

-- Query to check recent cron executions (run this to debug)
/*
SELECT 
  jobid,
  runid,
  status,
  return_message,
  start_time,
  end_time,
  (end_time - start_time) as duration
FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-subscription-reminders')
ORDER BY start_time DESC 
LIMIT 10;
*/

-- Query to check if cron is running
/*
SELECT 
  jobname,
  active,
  CASE 
    WHEN active THEN '✅ Active'
    ELSE '❌ Inactive'
  END as status,
  schedule,
  command
FROM cron.job
WHERE jobname = 'send-subscription-reminders';
*/

-- Query to disable cron job (if needed)
/*
SELECT cron.unschedule('send-subscription-reminders');
*/

-- Query to see all cron jobs
/*
SELECT * FROM cron.job ORDER BY jobid DESC;
*/

-- ============================================
-- TROUBLESHOOTING
-- ============================================

/*
If cron job is not working:

1. Check if job is active:
   SELECT * FROM cron.job WHERE jobname = 'send-subscription-reminders';

2. Check execution history:
   SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 5;

3. If you see errors about "undefined timeout_milliseconds":
   - Delete the job: SELECT cron.unschedule('send-subscription-reminders');
   - Re-run this script

4. If no executions at all:
   - Verify extensions are enabled: SELECT * FROM pg_extension WHERE extname IN ('pg_cron', 'http');
   - Check Edge Function is deployed: Go to Dashboard → Edge Functions
   - Verify secrets are set: supabase secrets list

5. If executions succeed but no WhatsApp messages:
   - Check Edge Function logs in Dashboard
   - Verify WhatsApp number is set in user_profiles table
   - Check if reminder time matches current Pakistan time
   - Verify Meta API credentials are correct
*/
