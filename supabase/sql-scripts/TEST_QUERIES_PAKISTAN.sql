-- ============================================
-- TEST QUERIES FOR PAKISTAN TIMEZONE
-- ============================================
-- Use these queries to test your setup and create test subscriptions
-- All times are in Pakistan timezone (UTC+5)
-- ============================================

-- ============================================
-- 0. VERIFY DATABASE SCHEMA EXISTS
-- ============================================
-- Run this first to make sure tables are created
-- If this fails, run COMPLETE_SETUP_PAKISTAN.sql first

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'subscriptions'
  ) THEN
    RAISE EXCEPTION '❌ subscriptions table does not exist! Please run COMPLETE_SETUP_PAKISTAN.sql first.';
  END IF;
  
  RAISE NOTICE '✅ Database schema verified - subscriptions table exists';
END $$;

-- ============================================
-- 1. CHECK CURRENT PAKISTAN TIME
-- ============================================
SELECT 
    '🇵🇰 Current Pakistan Time' as info,
    NOW() as utc_time,
    NOW() AT TIME ZONE 'Asia/Karachi' as pakistan_time,
    (NOW() AT TIME ZONE 'Asia/Karachi')::DATE as pakistan_date,
    (NOW() AT TIME ZONE 'Asia/Karachi')::TIME as pakistan_time_only,
    TO_CHAR(NOW() AT TIME ZONE 'Asia/Karachi', 'HH24:MI:SS') as pakistan_time_formatted,
    EXTRACT(HOUR FROM (NOW() AT TIME ZONE 'Asia/Karachi'))::INTEGER as pakistan_hour,
    EXTRACT(MINUTE FROM (NOW() AT TIME ZONE 'Asia/Karachi'))::INTEGER as pakistan_minute,
    TO_CHAR(NOW() AT TIME ZONE 'Asia/Karachi', 'Day, DD Month YYYY') as pakistan_date_formatted;

-- ============================================
-- 2. CHECK USERS (IMPORTANT FOR TESTING)
-- ============================================
-- You need at least one user to create test subscriptions
-- If no users exist, sign up via the frontend first: http://localhost:3001

SELECT 
    '👥 User Check' as info,
    COUNT(*) as total_users,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Users exist - you can create test subscriptions'
        ELSE '❌ No users found - please sign up via frontend first'
    END as status
FROM auth.users;

-- List all users (useful to get user_id for manual testing)
SELECT 
    id as user_id,
    email,
    created_at AT TIME ZONE 'Asia/Karachi' as created_at_pakistan
FROM auth.users
ORDER BY created_at DESC;

-- ============================================
-- 3. CHECK DATABASE SETUP
-- ============================================

-- Check if tables exist
SELECT 
    '✅ Tables' as check_type,
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('subscriptions', 'banks')
ORDER BY table_name;

-- List all columns in subscriptions table (useful for debugging)
SELECT 
    '📋 Subscriptions Columns' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'subscriptions'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT 
    '✅ RLS Policies' as check_type,
    tablename, 
    policyname, 
    cmd,
    CASE WHEN permissive = 'PERMISSIVE' THEN '✅' ELSE '❌' END as permissive
FROM pg_policies 
WHERE tablename IN ('subscriptions', 'banks')
ORDER BY tablename, policyname;

-- Check indexes
SELECT 
    '✅ Indexes' as check_type,
    schemaname,
    tablename,
    indexname
FROM pg_indexes 
WHERE tablename IN ('subscriptions', 'banks')
ORDER BY tablename, indexname;

-- Check extensions
SELECT 
    '✅ Extensions' as check_type,
    extname,
    extversion
FROM pg_extension 
WHERE extname IN ('pg_cron', 'pg_net')
ORDER BY extname;

-- ============================================
-- 3. VIEW ALL SUBSCRIPTIONS
-- ============================================
SELECT 
    id,
    service_name,
    cost,
    currency,
    billing_cycle,
    status,
    next_payment_date,
    reminder_days_before,
    reminder_time,
    whatsapp_number,
    last_reminder_sent,
    (next_payment_date - reminder_days_before) as reminder_date,
    created_at AT TIME ZONE 'Asia/Karachi' as created_at_pakistan,
    updated_at AT TIME ZONE 'Asia/Karachi' as updated_at_pakistan
FROM subscriptions
ORDER BY status, next_payment_date, reminder_time;

-- ============================================
-- 4. CREATE TEST SUBSCRIPTION (CURRENT TIME + 2 MINUTES)
-- ============================================
-- This creates a subscription with reminder set for 2 minutes from now
-- Perfect for testing if reminders are working

-- IMPORTANT: You must be logged in to the frontend first to have a user_id
-- Or you can manually insert your user_id below

-- Check if there are any users
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users LIMIT 1) THEN
    RAISE NOTICE '⚠️ WARNING: No users found in auth.users table!';
    RAISE NOTICE '📝 Please sign up via the frontend first at http://localhost:3001';
    RAISE NOTICE '   Then run this query again.';
    RAISE EXCEPTION 'No users found. Please create a user account first.';
  END IF;
END $$;

-- First, delete any old test subscriptions
DELETE FROM subscriptions WHERE service_name LIKE 'Test%';

-- Create test subscription
WITH time_calc AS (
  SELECT 
    (NOW() AT TIME ZONE 'Asia/Karachi')::DATE as today,
    (NOW() AT TIME ZONE 'Asia/Karachi' + INTERVAL '2 minutes')::TIME as reminder_time
)
INSERT INTO subscriptions (
  user_id,
  service_name,
  cost,
  currency,
  billing_cycle,
  start_date,
  next_payment_date,
  reminder_days_before,
  reminder_time,
  whatsapp_number,
  last_reminder_sent
)
SELECT
  (SELECT id FROM auth.users LIMIT 1),
  'Test Subscription ' || TO_CHAR(NOW() AT TIME ZONE 'Asia/Karachi', 'HH24:MI'),
  99.99,
  'PKR',
  'monthly',
  today,
  today,
  0,
  reminder_time,
  '+923447470874',  -- REPLACE WITH YOUR WHATSAPP NUMBER
  NULL
FROM time_calc
RETURNING 
  id,
  service_name,
  reminder_time,
  next_payment_date,
  '✅ Test subscription created! Reminder will be sent in 2 minutes.' as message;

-- ============================================
-- 5. CREATE TEST SUBSCRIPTION (SPECIFIC TIME)
-- ============================================
-- Use this to create a test for a specific time
-- Replace HH:MM:SS with your desired time in Pakistan timezone

/*
-- Check if there are any users first
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users LIMIT 1) THEN
    RAISE EXCEPTION 'No users found. Please create a user account first via frontend.';
  END IF;
END $$;

DELETE FROM subscriptions WHERE service_name LIKE 'Test%';

INSERT INTO subscriptions (
  user_id,
  service_name,
  cost,
  currency,
  billing_cycle,
  start_date,
  next_payment_date,
  reminder_days_before,
  reminder_time,
  whatsapp_number,
  last_reminder_sent
)
VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'Test Subscription 19:30',
  99.99,
  'PKR',
  'monthly',
  CURRENT_DATE,
  CURRENT_DATE,
  0,
  '19:30:00'::TIME,  -- Set your desired time here (Pakistan time)
  '+923447470874',   -- REPLACE WITH YOUR WHATSAPP NUMBER
  NULL
)
RETURNING 
  id,
  service_name,
  reminder_time,
  next_payment_date;
*/

-- ============================================
-- 5B. ALTERNATIVE: CREATE TEST WITH MANUAL USER_ID
-- ============================================
-- If you know your user_id, you can use this instead
-- First, get your user_id by running: SELECT id, email FROM auth.users;

/*
DELETE FROM subscriptions WHERE service_name LIKE 'Test%';

WITH time_calc AS (
  SELECT 
    (NOW() AT TIME ZONE 'Asia/Karachi')::DATE as today,
    (NOW() AT TIME ZONE 'Asia/Karachi' + INTERVAL '2 minutes')::TIME as reminder_time
)
INSERT INTO subscriptions (
  user_id,
  service_name,
  cost,
  currency,
  billing_cycle,
  start_date,
  next_payment_date,
  reminder_days_before,
  reminder_time,
  whatsapp_number,
  last_reminder_sent
)
SELECT
  'YOUR_USER_ID_HERE'::UUID,  -- REPLACE WITH YOUR ACTUAL USER ID
  'Test Subscription ' || TO_CHAR(NOW() AT TIME ZONE 'Asia/Karachi', 'HH24:MI'),
  99.99,
  'PKR',
  'monthly',
  today,
  today,
  0,
  reminder_time,
  '+923447470874',  -- REPLACE WITH YOUR WHATSAPP NUMBER
  NULL
FROM time_calc
RETURNING 
  id,
  service_name,
  reminder_time,
  next_payment_date;
*/

-- ============================================
-- 6. CHECK WHICH SUBSCRIPTIONS ARE READY FOR REMINDERS
-- ============================================
-- This shows which subscriptions should receive reminders RIGHT NOW
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
    (s.next_payment_date - s.reminder_days_before) as reminder_date,
    s.reminder_time,
    s.whatsapp_number,
    s.last_reminder_sent AT TIME ZONE 'Asia/Karachi' as last_sent_pakistan,
    pt.current_date,
    pt.current_time,
    -- Date check
    CASE 
        WHEN (s.next_payment_date - s.reminder_days_before) = pt.current_date THEN '✅ Date Match'
        WHEN (s.next_payment_date - s.reminder_days_before) > pt.current_date THEN '⏭️ Future Date'
        ELSE '⏮️ Past Date'
    END as date_status,
    -- Time check
    CASE 
        WHEN EXTRACT(HOUR FROM s.reminder_time)::INTEGER = pt.current_hour 
         AND EXTRACT(MINUTE FROM s.reminder_time)::INTEGER = pt.current_minute 
        THEN '✅ Time Match'
        WHEN EXTRACT(HOUR FROM s.reminder_time)::INTEGER > pt.current_hour
         OR (EXTRACT(HOUR FROM s.reminder_time)::INTEGER = pt.current_hour 
             AND EXTRACT(MINUTE FROM s.reminder_time)::INTEGER > pt.current_minute)
        THEN '⏭️ Future Time'
        ELSE '⏮️ Past Time'
    END as time_status,
    -- Duplicate check
    CASE 
        WHEN s.last_reminder_sent IS NULL THEN '✅ Never Sent'
        WHEN (s.last_reminder_sent AT TIME ZONE 'Asia/Karachi')::DATE < pt.current_date THEN '✅ Can Send'
        ELSE '❌ Already Sent Today'
    END as duplicate_status,
    -- Overall status
    CASE 
        WHEN (s.next_payment_date - s.reminder_days_before) = pt.current_date
         AND EXTRACT(HOUR FROM s.reminder_time)::INTEGER = pt.current_hour 
         AND EXTRACT(MINUTE FROM s.reminder_time)::INTEGER = pt.current_minute
         AND (s.last_reminder_sent IS NULL OR (s.last_reminder_sent AT TIME ZONE 'Asia/Karachi')::DATE < pt.current_date)
        THEN '🚀 READY TO SEND'
        ELSE '⏸️ Not Ready'
    END as overall_status
FROM subscriptions s
CROSS JOIN pakistan_time pt
WHERE s.whatsapp_number IS NOT NULL 
  AND s.whatsapp_number != ''
ORDER BY 
  CASE 
    WHEN (s.next_payment_date - s.reminder_days_before) = pt.current_date
     AND EXTRACT(HOUR FROM s.reminder_time)::INTEGER = pt.current_hour 
     AND EXTRACT(MINUTE FROM s.reminder_time)::INTEGER = pt.current_minute
    THEN 0 
    ELSE 1 
  END,
  s.next_payment_date,
  s.reminder_time;

-- ============================================
-- 7. CHECK CRON JOB STATUS
-- ============================================

-- Check if cron job exists and is active
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

-- Check recent cron job executions
SELECT 
    j.jobname,
    jrd.runid,
    jrd.status,
    jrd.return_message,
    jrd.start_time AT TIME ZONE 'Asia/Karachi' as start_time_pakistan,
    jrd.end_time AT TIME ZONE 'Asia/Karachi' as end_time_pakistan,
    EXTRACT(EPOCH FROM (jrd.end_time - jrd.start_time)) as duration_seconds,
    CASE 
        WHEN jrd.status = 'succeeded' THEN '✅'
        WHEN jrd.status = 'failed' THEN '❌'
        ELSE '⏳'
    END as status_icon
FROM cron.job_run_details jrd
JOIN cron.job j ON j.jobid = jrd.jobid
WHERE j.jobname = 'send-subscription-reminders'
ORDER BY jrd.start_time DESC 
LIMIT 20;

-- ============================================
-- 8. RESET LAST_REMINDER_SENT (FOR TESTING)
-- ============================================
-- Use this to reset a subscription so you can test sending reminders again

/*
-- Reset specific subscription
UPDATE subscriptions 
SET last_reminder_sent = NULL 
WHERE service_name = 'Test Subscription 19:30';

-- Reset all test subscriptions
UPDATE subscriptions 
SET last_reminder_sent = NULL 
WHERE service_name LIKE 'Test%';

-- Reset all subscriptions (use with caution!)
UPDATE subscriptions 
SET last_reminder_sent = NULL;
*/

-- ============================================
-- 9. DELETE TEST SUBSCRIPTIONS
-- ============================================
-- Clean up test subscriptions

/*
-- Delete specific test
DELETE FROM subscriptions WHERE service_name = 'Test Subscription 19:30';

-- Delete all test subscriptions
DELETE FROM subscriptions WHERE service_name LIKE 'Test%';
*/

-- ============================================
-- 10. CREATE MULTIPLE TEST SUBSCRIPTIONS
-- ============================================
-- Create subscriptions for different scenarios

/*
-- Delete old tests first
DELETE FROM subscriptions WHERE service_name LIKE 'Test%';

-- Test 1: Reminder in 1 minute
INSERT INTO subscriptions (user_id, service_name, cost, currency, billing_cycle, start_date, next_payment_date, reminder_days_before, reminder_time, whatsapp_number)
SELECT
  (SELECT id FROM auth.users LIMIT 1),
  'Test 1min',
  50.00,
  'PKR',
  'monthly',
  CURRENT_DATE,
  CURRENT_DATE,
  0,
  (NOW() AT TIME ZONE 'Asia/Karachi' + INTERVAL '1 minute')::TIME,
  '+923447470874';

-- Test 2: Reminder in 5 minutes
INSERT INTO subscriptions (user_id, service_name, cost, currency, billing_cycle, start_date, next_payment_date, reminder_days_before, reminder_time, whatsapp_number)
SELECT
  (SELECT id FROM auth.users LIMIT 1),
  'Test 5min',
  100.00,
  'PKR',
  'monthly',
  CURRENT_DATE,
  CURRENT_DATE,
  0,
  (NOW() AT TIME ZONE 'Asia/Karachi' + INTERVAL '5 minutes')::TIME,
  '+923447470874';

-- Test 3: Reminder tomorrow at 9 AM
INSERT INTO subscriptions (user_id, service_name, cost, currency, billing_cycle, start_date, next_payment_date, reminder_days_before, reminder_time, whatsapp_number)
SELECT
  (SELECT id FROM auth.users LIMIT 1),
  'Test Tomorrow 9AM',
  150.00,
  'PKR',
  'monthly',
  CURRENT_DATE + 1,
  CURRENT_DATE + 1,
  0,
  '09:00:00'::TIME,
  '+923447470874';

-- View created tests
SELECT 
  service_name,
  reminder_time,
  next_payment_date,
  reminder_days_before,
  (next_payment_date - reminder_days_before) as reminder_date
FROM subscriptions 
WHERE service_name LIKE 'Test%'
ORDER BY reminder_time;
*/

-- ============================================
-- 11. MONITOR EDGE FUNCTION PERFORMANCE
-- ============================================
-- Check how long the Edge Function takes to execute

SELECT 
    j.jobname,
    COUNT(*) as total_runs,
    COUNT(*) FILTER (WHERE jrd.status = 'succeeded') as successful_runs,
    COUNT(*) FILTER (WHERE jrd.status = 'failed') as failed_runs,
    ROUND(AVG(EXTRACT(EPOCH FROM (jrd.end_time - jrd.start_time)))::NUMERIC, 2) as avg_duration_seconds,
    MIN(jrd.start_time AT TIME ZONE 'Asia/Karachi') as first_run_pakistan,
    MAX(jrd.start_time AT TIME ZONE 'Asia/Karachi') as last_run_pakistan
FROM cron.job_run_details jrd
JOIN cron.job j ON j.jobid = jrd.jobid
WHERE j.jobname = 'send-subscription-reminders'
  AND jrd.start_time > NOW() - INTERVAL '24 hours'
GROUP BY j.jobname;

-- ============================================
-- 12. TIMEZONE CONVERSION EXAMPLES
-- ============================================

-- Convert UTC to Pakistan time
SELECT 
    'Timezone Conversions' as example,
    NOW() as utc_now,
    NOW() AT TIME ZONE 'Asia/Karachi' as pakistan_now,
    NOW() AT TIME ZONE 'America/New_York' as new_york_now,
    NOW() AT TIME ZONE 'Europe/London' as london_now;

-- Convert specific UTC timestamp to Pakistan time
SELECT 
    '2025-10-15 13:28:13'::TIMESTAMPTZ as utc_time,
    '2025-10-15 13:28:13'::TIMESTAMPTZ AT TIME ZONE 'Asia/Karachi' as pakistan_time;

-- ============================================
-- END OF TEST QUERIES
-- ============================================
