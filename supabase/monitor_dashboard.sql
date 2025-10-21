-- ============================================
-- MONITORING DASHBOARD
-- Real-time status of your reminder system
-- Pakistan Timezone (UTC+5)
-- ============================================
-- Run this in Supabase Dashboard → SQL Editor to see current status
-- ============================================

-- ============================================
-- SECTION 1: CURRENT TIME CHECK
-- ============================================
SELECT '🕐 CURRENT TIME' as section;

SELECT 
  NOW() as utc_time,
  (NOW() AT TIME ZONE 'Asia/Karachi') as pakistan_time,
  TO_CHAR((NOW() AT TIME ZONE 'Asia/Karachi'), 'Day, DD Month YYYY') as pakistan_date_long,
  TO_CHAR((NOW() AT TIME ZONE 'Asia/Karachi'), 'HH24:MI:SS') as pakistan_time_24h,
  TO_CHAR((NOW() AT TIME ZONE 'Asia/Karachi'), 'HH12:MI:SS AM') as pakistan_time_12h,
  EXTRACT(HOUR FROM (NOW() AT TIME ZONE 'Asia/Karachi')) as hour,
  EXTRACT(MINUTE FROM (NOW() AT TIME ZONE 'Asia/Karachi')) as minute;

-- ============================================
-- SECTION 2: CRON JOB STATUS
-- ============================================
SELECT '⚙️ CRON JOB STATUS' as section;

SELECT 
  jobid,
  jobname,
  schedule,
  active,
  CASE 
    WHEN active THEN '✅ Active'
    ELSE '❌ Inactive'
  END as status,
  CASE 
    WHEN schedule = '* * * * *' THEN 'Every minute'
    ELSE schedule
  END as schedule_description
FROM cron.job
WHERE jobname = 'send-subscription-reminders';

-- Recent cron executions
SELECT '📊 RECENT CRON EXECUTIONS (Last 5)' as section;

SELECT 
  runid,
  status,
  CASE 
    WHEN status = 'succeeded' THEN '✅'
    WHEN status = 'failed' THEN '❌'
    ELSE '⏳'
  END as icon,
  return_message,
  (start_time AT TIME ZONE 'Asia/Karachi')::TIMESTAMP as start_time_pakistan,
  (end_time AT TIME ZONE 'Asia/Karachi')::TIMESTAMP as end_time_pakistan,
  ROUND(EXTRACT(EPOCH FROM (end_time - start_time))::NUMERIC, 2) as duration_seconds
FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-subscription-reminders' LIMIT 1)
ORDER BY start_time DESC 
LIMIT 5;

-- ============================================
-- SECTION 3: USER STATUS
-- ============================================
SELECT '👤 USER STATUS' as section;

SELECT 
  u.id,
  u.email,
  up.whatsapp_number,
  CASE 
    WHEN up.whatsapp_number IS NOT NULL AND up.whatsapp_number ~ '^\+\d{10,15}$' THEN '✅ Valid'
    WHEN up.whatsapp_number IS NOT NULL THEN '⚠️ Invalid format'
    ELSE '❌ Not set'
  END as whatsapp_status,
  TO_CHAR(up.reminder_time, 'HH24:MI:SS') as default_reminder_time,
  up.timezone,
  (u.created_at AT TIME ZONE 'Asia/Karachi')::TIMESTAMP as created_at_pakistan
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
ORDER BY u.created_at DESC
LIMIT 5;

-- ============================================
-- SECTION 4: ACTIVE SUBSCRIPTIONS
-- ============================================
SELECT '📱 ACTIVE SUBSCRIPTIONS' as section;

SELECT 
  COUNT(*) as total_active,
  COUNT(CASE WHEN last_reminder_sent IS NOT NULL THEN 1 END) as with_reminders_sent,
  COUNT(CASE WHEN last_reminder_sent IS NULL THEN 1 END) as no_reminders_yet
FROM subscriptions
WHERE status = 'active';

-- Detailed active subscriptions
SELECT '📋 ACTIVE SUBSCRIPTION DETAILS' as section;

SELECT 
  s.id,
  s.service_name,
  s.cost,
  s.currency,
  s.next_payment_date,
  s.reminder_days_before,
  TO_CHAR(s.reminder_time, 'HH24:MI:SS') as reminder_time,
  up.whatsapp_number,
  CASE 
    WHEN s.last_reminder_sent IS NOT NULL 
    THEN TO_CHAR((s.last_reminder_sent AT TIME ZONE 'Asia/Karachi')::TIMESTAMP, 'DD-Mon HH24:MI')
    ELSE 'Never'
  END as last_sent,
  -- Calculate reminder date
  (s.next_payment_date - (s.reminder_days_before || ' days')::INTERVAL)::DATE as reminder_date,
  -- Check if today
  CASE 
    WHEN (s.next_payment_date - (s.reminder_days_before || ' days')::INTERVAL)::DATE = CURRENT_DATE 
    THEN '🔔 TODAY'
    WHEN (s.next_payment_date - (s.reminder_days_before || ' days')::INTERVAL)::DATE = CURRENT_DATE + 1
    THEN '📅 Tomorrow'
    WHEN (s.next_payment_date - (s.reminder_days_before || ' days')::INTERVAL)::DATE < CURRENT_DATE
    THEN '⚠️ Past'
    ELSE '⏳ Future'
  END as reminder_status,
  -- Days until payment
  (s.next_payment_date - CURRENT_DATE) as days_until_payment
FROM subscriptions s
LEFT JOIN user_profiles up ON s.user_id = up.id
WHERE s.status = 'active'
ORDER BY s.next_payment_date ASC
LIMIT 10;

-- ============================================
-- SECTION 5: REMINDERS DUE TODAY
-- ============================================
SELECT '🔔 REMINDERS DUE TODAY' as section;

SELECT 
  s.id,
  s.service_name,
  up.whatsapp_number,
  TO_CHAR(s.reminder_time, 'HH24:MI:SS') as reminder_time,
  TO_CHAR((NOW() AT TIME ZONE 'Asia/Karachi'), 'HH24:MI:SS') as current_time,
  CASE 
    WHEN TO_CHAR(s.reminder_time, 'HH24:MI') = TO_CHAR((NOW() AT TIME ZONE 'Asia/Karachi'), 'HH24:MI')
    THEN '✅ TIME MATCH NOW!'
    WHEN s.reminder_time > (NOW() AT TIME ZONE 'Asia/Karachi')::TIME
    THEN '⏳ Later today'
    ELSE '⏰ Time passed'
  END as time_status,
  CASE 
    WHEN s.last_reminder_sent IS NOT NULL 
    AND (s.last_reminder_sent AT TIME ZONE 'Asia/Karachi')::DATE = CURRENT_DATE
    THEN '✅ Already sent today'
    ELSE '📤 Ready to send'
  END as sent_status
FROM subscriptions s
LEFT JOIN user_profiles up ON s.user_id = up.id
WHERE s.status = 'active'
  AND (s.next_payment_date - (s.reminder_days_before || ' days')::INTERVAL)::DATE = CURRENT_DATE
ORDER BY s.reminder_time ASC;

-- ============================================
-- SECTION 6: RECENT NOTIFICATIONS
-- ============================================
SELECT '📬 RECENT NOTIFICATIONS (Last 10)' as section;

SELECT 
  n.id,
  n.type,
  s.service_name,
  n.title,
  n.status,
  CASE 
    WHEN n.status = 'sent' THEN '✅'
    WHEN n.status = 'failed' THEN '❌'
    WHEN n.status = 'pending' THEN '⏳'
    ELSE '📖'
  END as icon,
  n.whatsapp_number,
  CASE 
    WHEN n.sent_at IS NOT NULL 
    THEN TO_CHAR((n.sent_at AT TIME ZONE 'Asia/Karachi')::TIMESTAMP, 'DD-Mon HH24:MI:SS')
    ELSE NULL
  END as sent_at_pakistan,
  n.error_message
FROM notifications n
LEFT JOIN subscriptions s ON n.subscription_id = s.id
ORDER BY n.created_at DESC
LIMIT 10;

-- ============================================
-- SECTION 7: NOTIFICATION STATISTICS
-- ============================================
SELECT '📊 NOTIFICATION STATISTICS' as section;

SELECT 
  COUNT(*) as total_notifications,
  COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
  COUNT(CASE WHEN type = 'whatsapp_reminder' THEN 1 END) as whatsapp_reminders,
  COUNT(CASE WHEN sent_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as last_24_hours,
  COUNT(CASE WHEN sent_at >= NOW() - INTERVAL '1 hour' THEN 1 END) as last_hour
FROM notifications;

-- ============================================
-- SECTION 8: SYSTEM HEALTH CHECK
-- ============================================
SELECT '🏥 SYSTEM HEALTH CHECK' as section;

SELECT 
  '✅' as status,
  'Database' as component,
  'Connected' as state
UNION ALL
SELECT 
  CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '❌' END,
  'Tables',
  COUNT(*)::TEXT || ' tables found'
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('user_profiles', 'banks', 'subscriptions', 'notifications')
UNION ALL
SELECT 
  CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '❌' END,
  'Extensions',
  STRING_AGG(extname, ', ')
FROM pg_extension
WHERE extname IN ('pg_cron', 'http', 'uuid-ossp')
UNION ALL
SELECT 
  CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '❌' END,
  'Cron Jobs',
  COUNT(*)::TEXT || ' active'
FROM cron.job
WHERE jobname = 'send-subscription-reminders' AND active = true
UNION ALL
SELECT 
  CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '⚠️' END,
  'Users',
  COUNT(*)::TEXT || ' registered'
FROM auth.users
UNION ALL
SELECT 
  CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '⚠️' END,
  'Active Subscriptions',
  COUNT(*)::TEXT || ' found'
FROM subscriptions WHERE status = 'active';

-- ============================================
-- SECTION 9: UPCOMING PAYMENTS
-- ============================================
SELECT '📅 UPCOMING PAYMENTS (Next 7 Days)' as section;

SELECT 
  s.service_name,
  s.cost,
  s.currency,
  s.next_payment_date,
  s.reminder_days_before,
  (s.next_payment_date - CURRENT_DATE) as days_until_payment,
  (s.next_payment_date - (s.reminder_days_before || ' days')::INTERVAL)::DATE as reminder_date,
  CASE 
    WHEN (s.next_payment_date - CURRENT_DATE) = 0 THEN '🔴 TODAY!'
    WHEN (s.next_payment_date - CURRENT_DATE) = 1 THEN '🟡 Tomorrow'
    ELSE '🟢 ' || (s.next_payment_date - CURRENT_DATE) || ' days'
  END as urgency,
  up.whatsapp_number
FROM subscriptions s
LEFT JOIN user_profiles up ON s.user_id = up.id
WHERE s.status = 'active'
  AND s.next_payment_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 7
ORDER BY s.next_payment_date ASC;

-- ============================================
-- SECTION 10: RECOMMENDATIONS
-- ============================================
SELECT '💡 RECOMMENDATIONS' as section;

-- Check for subscriptions without WhatsApp
SELECT 
  CASE 
    WHEN COUNT(*) > 0 
    THEN '⚠️ ' || COUNT(*) || ' active subscription(s) without WhatsApp configured'
    ELSE '✅ All subscriptions have WhatsApp configured'
  END as recommendation
FROM subscriptions s
LEFT JOIN user_profiles up ON s.user_id = up.id
WHERE s.status = 'active'
  AND up.whatsapp_number IS NULL

UNION ALL

-- Check for invalid WhatsApp numbers
SELECT 
  CASE 
    WHEN COUNT(*) > 0 
    THEN '⚠️ ' || COUNT(*) || ' user(s) with invalid WhatsApp format'
    ELSE '✅ All WhatsApp numbers are valid'
  END
FROM user_profiles
WHERE whatsapp_number IS NOT NULL
  AND whatsapp_number !~ '^\+\d{10,15}$'

UNION ALL

-- Check for failed notifications
SELECT 
  CASE 
    WHEN COUNT(*) > 0 
    THEN '⚠️ ' || COUNT(*) || ' failed notification(s) in last 24 hours'
    ELSE '✅ No failed notifications recently'
  END
FROM notifications
WHERE status = 'failed'
  AND created_at >= NOW() - INTERVAL '24 hours';

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '====================================';
  RAISE NOTICE '✅ MONITORING DASHBOARD COMPLETE';
  RAISE NOTICE '====================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Refresh this query anytime to see current status';
  RAISE NOTICE 'All times are shown in Pakistan timezone (UTC+5)';
  RAISE NOTICE '';
  RAISE NOTICE 'Quick Actions:';
  RAISE NOTICE '- To update WhatsApp: UPDATE user_profiles SET whatsapp_number = ''+92...'' WHERE id = ...';
  RAISE NOTICE '- To reset reminder: UPDATE subscriptions SET last_reminder_sent = NULL WHERE id = ...';
  RAISE NOTICE '- To test now: Change reminder_time to current time + 1 minute';
  RAISE NOTICE '';
END $$;
