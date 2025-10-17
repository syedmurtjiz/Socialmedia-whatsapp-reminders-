-- ============================================
-- CRON JOB SETUP FOR PAKISTAN TIMEZONE
-- ============================================
-- This script sets up the cron job to trigger the Edge Function
-- Run this AFTER deploying the Edge Function
-- ============================================

-- ============================================
-- STEP 1: VERIFY EXTENSIONS ARE ENABLED
-- ============================================
-- Check if pg_cron and pg_net are enabled
SELECT 
    extname,
    extversion,
    CASE 
        WHEN extname IN ('pg_cron', 'pg_net') THEN '✅ Enabled'
        ELSE '❌ Not Enabled'
    END as status
FROM pg_extension 
WHERE extname IN ('pg_cron', 'pg_net');

-- If not enabled, run these commands:
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================
-- STEP 2: DELETE OLD CRON JOBS (IF ANY)
-- ============================================
-- List all existing cron jobs
SELECT 
    jobid,
    jobname,
    schedule,
    active,
    command
FROM cron.job
ORDER BY jobid DESC;

-- Delete old reminder cron job if it exists
SELECT cron.unschedule(jobname) 
FROM cron.job 
WHERE jobname = 'send-subscription-reminders';

-- ============================================
-- STEP 3: CREATE NEW CRON JOB
-- ============================================
-- IMPORTANT: Replace the following placeholders:
-- 1. YOUR_PROJECT_URL - Your Supabase project URL (e.g., https://xxxxx.supabase.co)
-- 2. YOUR_SERVICE_ROLE_KEY - Your Supabase service role key
--
-- Schedule: * * * * * (runs every minute)
-- This checks for reminders every minute and sends them at the exact time
-- ============================================

SELECT cron.schedule(
  'send-subscription-reminders',
  '* * * * *',  -- Every minute
  $$
  SELECT
    net.http_post(
      url := 'YOUR_PROJECT_URL/functions/v1/send-reminders',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
      body := '{}'::jsonb
    ) AS request_id;
  $$
);

-- ============================================
-- EXAMPLE WITH ACTUAL VALUES (REPLACE THESE!)
-- ============================================
/*
SELECT cron.schedule(
  'send-subscription-reminders',
  '* * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://ujivqubkjqkqmgdbtgzr.supabase.co/functions/v1/send-reminders',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ACTUAL_KEY_HERE"}'::jsonb,
      body := '{}'::jsonb
    ) AS request_id;
  $$
);
*/

-- ============================================
-- STEP 4: VERIFY CRON JOB WAS CREATED
-- ============================================
-- Check if the cron job was created successfully
SELECT 
    jobid,
    jobname,
    schedule,
    active,
    database,
    CASE 
        WHEN active THEN '✅ Active'
        ELSE '❌ Inactive'
    END as status
FROM cron.job
WHERE jobname = 'send-subscription-reminders';

-- ============================================
-- STEP 5: MONITOR CRON JOB EXECUTIONS
-- ============================================
-- Check recent cron job executions (last 10)
SELECT 
    j.jobname,
    jrd.runid,
    jrd.status,
    jrd.return_message,
    jrd.start_time AT TIME ZONE 'Asia/Karachi' as start_time_pakistan,
    jrd.end_time AT TIME ZONE 'Asia/Karachi' as end_time_pakistan,
    CASE 
        WHEN jrd.status = 'succeeded' THEN '✅'
        WHEN jrd.status = 'failed' THEN '❌'
        ELSE '⏳'
    END as status_icon
FROM cron.job_run_details jrd
JOIN cron.job j ON j.jobid = jrd.jobid
WHERE j.jobname = 'send-subscription-reminders'
ORDER BY jrd.start_time DESC 
LIMIT 10;

-- ============================================
-- STEP 6: CHECK EDGE FUNCTION LOGS
-- ============================================
-- To check Edge Function logs:
-- 1. Go to Supabase Dashboard
-- 2. Navigate to: Edge Functions → send-reminders
-- 3. Click on "Logs" tab
-- 4. You should see logs every minute showing:
--    - Current Pakistan time
--    - Subscriptions being processed
--    - Messages being sent

-- ============================================
-- TROUBLESHOOTING QUERIES
-- ============================================

-- Check if any subscriptions are ready for reminders RIGHT NOW
WITH pakistan_time AS (
  SELECT 
    (NOW() AT TIME ZONE 'Asia/Karachi')::DATE as current_date,
    (NOW() AT TIME ZONE 'Asia/Karachi')::TIME as current_time,
    EXTRACT(HOUR FROM (NOW() AT TIME ZONE 'Asia/Karachi'))::INTEGER as current_hour,
    EXTRACT(MINUTE FROM (NOW() AT TIME ZONE 'Asia/Karachi'))::INTEGER as current_minute
)
SELECT 
    s.id,
    s.service_name,
    s.next_payment_date,
    s.reminder_days_before,
    s.reminder_time,
    s.whatsapp_number,
    s.last_reminder_sent,
    (s.next_payment_date - s.reminder_days_before) as reminder_date,
    pt.current_date,
    pt.current_time,
    CASE 
        WHEN (s.next_payment_date - s.reminder_days_before) = pt.current_date THEN '✅ Date Match'
        ELSE '❌ Date Mismatch'
    END as date_check,
    CASE 
        WHEN EXTRACT(HOUR FROM s.reminder_time)::INTEGER = pt.current_hour 
         AND EXTRACT(MINUTE FROM s.reminder_time)::INTEGER = pt.current_minute 
        THEN '✅ Time Match'
        ELSE '❌ Time Mismatch'
    END as time_check,
    CASE 
        WHEN s.last_reminder_sent IS NULL THEN '✅ Never Sent'
        WHEN (s.last_reminder_sent AT TIME ZONE 'Asia/Karachi')::DATE < pt.current_date THEN '✅ Can Send'
        ELSE '❌ Already Sent Today'
    END as duplicate_check
FROM subscriptions s
CROSS JOIN pakistan_time pt
WHERE s.whatsapp_number IS NOT NULL 
  AND s.whatsapp_number != ''
ORDER BY s.next_payment_date;

-- Check Pakistan time functions
SELECT 
    '🇵🇰 Pakistan Time Info' as info,
    NOW() as utc_time,
    NOW() AT TIME ZONE 'Asia/Karachi' as pakistan_time,
    (NOW() AT TIME ZONE 'Asia/Karachi')::DATE as pakistan_date,
    (NOW() AT TIME ZONE 'Asia/Karachi')::TIME as pakistan_time_only,
    EXTRACT(HOUR FROM (NOW() AT TIME ZONE 'Asia/Karachi')) as pakistan_hour,
    EXTRACT(MINUTE FROM (NOW() AT TIME ZONE 'Asia/Karachi')) as pakistan_minute;

-- ============================================
-- USEFUL MANAGEMENT COMMANDS
-- ============================================

-- Pause the cron job (if needed)
-- UPDATE cron.job SET active = false WHERE jobname = 'send-subscription-reminders';

-- Resume the cron job
-- UPDATE cron.job SET active = true WHERE jobname = 'send-subscription-reminders';

-- Delete the cron job completely
-- SELECT cron.unschedule('send-subscription-reminders');

-- Change cron schedule (e.g., every 5 minutes instead of every minute)
-- SELECT cron.alter_job(
--   job_id := (SELECT jobid FROM cron.job WHERE jobname = 'send-subscription-reminders'),
--   schedule := '*/5 * * * *'
-- );

-- ============================================
-- CRON SCHEDULE EXAMPLES
-- ============================================
-- Every minute:        * * * * *
-- Every 5 minutes:     */5 * * * *
-- Every 15 minutes:    */15 * * * *
-- Every hour:          0 * * * *
-- Every day at 9 AM:   0 9 * * *
-- Every day at 9 PM:   0 21 * * *
-- ============================================
