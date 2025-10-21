-- ============================================
-- TEST SCRIPT FOR PAKISTAN TIMEZONE SETUP
-- ============================================

-- ============================================
-- STEP 1: CHECK CURRENT TIME
-- ============================================
SELECT 
  NOW() as utc_time,
  (NOW() AT TIME ZONE 'Asia/Karachi') as pakistan_time,
  EXTRACT(HOUR FROM (NOW() AT TIME ZONE 'Asia/Karachi')) as pakistan_hour,
  EXTRACT(MINUTE FROM (NOW() AT TIME ZONE 'Asia/Karachi')) as pakistan_minute,
  TO_CHAR((NOW() AT TIME ZONE 'Asia/Karachi'), 'HH24:MI:SS') as pakistan_time_formatted,
  TO_CHAR((NOW() AT TIME ZONE 'Asia/Karachi'), 'YYYY-MM-DD') as pakistan_date;

-- ============================================
-- STEP 2: CHECK IF TABLES EXIST
-- ============================================
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('user_profiles', 'banks', 'subscriptions', 'notifications') THEN '✅'
    ELSE '❌'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('user_profiles', 'banks', 'subscriptions', 'notifications')
ORDER BY table_name;

-- ============================================
-- STEP 3: CHECK IF EXTENSIONS ARE ENABLED
-- ============================================
SELECT 
  extname as extension_name,
  '✅' as status
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'pg_cron', 'http')
ORDER BY extname;

-- ============================================
-- STEP 4: CHECK IF BANKS ARE INSERTED
-- ============================================
SELECT 
  COUNT(*) as total_banks,
  CASE 
    WHEN COUNT(*) >= 20 THEN '✅ Banks inserted'
    ELSE '❌ Banks missing'
  END as status
FROM public.banks;

-- Show first 5 banks
SELECT id, name, created_at
FROM public.banks
ORDER BY name
LIMIT 5;

-- ============================================
-- STEP 5: CHECK RLS POLICIES
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  '✅' as status
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- STEP 6: CHECK INDEXES
-- ============================================
SELECT 
  schemaname,
  tablename,
  indexname,
  '✅' as status
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- ============================================
-- STEP 7: CHECK IF YOU HAVE A USER
-- ============================================
SELECT 
  id,
  email,
  created_at,
  '✅' as status
FROM auth.users
ORDER BY created_at DESC
LIMIT 1;

-- ============================================
-- STEP 8: CREATE TEST SUBSCRIPTION (2 MINUTES FROM NOW)
-- ============================================

-- First, let's clean up any old tests
DELETE FROM public.subscriptions WHERE service_name LIKE 'Test %';

-- Now create a test subscription for 2 minutes from now
DO $$
DECLARE
  v_user_id UUID;
  v_pakistan_time TIMESTAMP;
  v_reminder_time TIME;
  v_test_name TEXT;
BEGIN
  -- Get first user ID
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found. Please sign up first!';
  END IF;
  
  -- Calculate Pakistan time + 2 minutes
  v_pakistan_time := (NOW() AT TIME ZONE 'Asia/Karachi') + INTERVAL '2 minutes';
  v_reminder_time := v_pakistan_time::TIME;
  v_test_name := 'Test ' || TO_CHAR(v_pakistan_time, 'HH24:MI');
  
  -- Insert test subscription
  INSERT INTO public.subscriptions (
    user_id,
    service_name,
    cost,
    currency,
    billing_cycle,
    next_payment_date,
    start_date,
    status,
    reminder_days_before,
    reminder_time,
    last_reminder_sent
  ) VALUES (
    v_user_id,
    v_test_name,
    999.00,
    'PKR',
    'monthly',
    CURRENT_DATE,
    CURRENT_DATE,
    'active',
    0, -- Send reminder today
    v_reminder_time,
    NULL -- Haven't sent reminder yet
  );
  
  RAISE NOTICE '✅ Test subscription created: %', v_test_name;
  RAISE NOTICE '⏰ Reminder will be sent at: %', TO_CHAR(v_reminder_time, 'HH24:MI:SS');
  RAISE NOTICE '📅 Next payment date: %', CURRENT_DATE;
  RAISE NOTICE '📱 Make sure to set your WhatsApp number in user_profiles!';
END $$;

-- ============================================
-- STEP 9: CHECK IF USER PROFILE EXISTS WITH WHATSAPP
-- ============================================
SELECT 
  up.id,
  up.whatsapp_number,
  up.reminder_time as default_reminder_time,
  up.timezone,
  CASE 
    WHEN up.whatsapp_number IS NOT NULL THEN '✅ WhatsApp configured'
    ELSE '⚠️ No WhatsApp number set'
  END as whatsapp_status
FROM public.user_profiles up
WHERE up.id = (SELECT id FROM auth.users LIMIT 1);

-- ============================================
-- STEP 10: VIEW TEST SUBSCRIPTION DETAILS
-- ============================================
SELECT 
  s.id,
  s.service_name,
  s.cost,
  s.currency,
  s.next_payment_date,
  s.reminder_days_before,
  TO_CHAR(s.reminder_time, 'HH24:MI:SS') as reminder_time,
  s.status,
  s.last_reminder_sent,
  up.whatsapp_number,
  (s.next_payment_date - (s.reminder_days_before || ' days')::INTERVAL)::DATE as reminder_date,
  CASE 
    WHEN (s.next_payment_date - (s.reminder_days_before || ' days')::INTERVAL)::DATE = CURRENT_DATE 
    THEN '✅ Should send today'
    ELSE '⏳ Not today'
  END as should_send_status
FROM public.subscriptions s
LEFT JOIN public.user_profiles up ON s.user_id = up.id
WHERE s.service_name LIKE 'Test %'
ORDER BY s.created_at DESC
LIMIT 5;

-- ============================================
-- STEP 11: CHECK REMINDERS VIEW
-- ============================================
SELECT * FROM public.v_reminders_pakistan
WHERE service_name LIKE 'Test %'
LIMIT 5;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '====================================';
  RAISE NOTICE '✅ TEST COMPLETED';
  RAISE NOTICE '====================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. If "No WhatsApp number set", run this:';
  RAISE NOTICE '   UPDATE user_profiles SET whatsapp_number = ''+923XXXXXXXXXX'' WHERE id = (SELECT id FROM auth.users LIMIT 1);';
  RAISE NOTICE '';
  RAISE NOTICE '2. Wait 2 minutes and check if reminder arrives on WhatsApp';
  RAISE NOTICE '';
  RAISE NOTICE '3. Check notifications table:';
  RAISE NOTICE '   SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5;';
  RAISE NOTICE '';
  RAISE NOTICE '4. Check Edge Function logs in Supabase Dashboard';
END $$;
