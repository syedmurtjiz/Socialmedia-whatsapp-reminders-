-- Debug WhatsApp Reminders
-- Check if everything is set up correctly

-- 1. Check if you have a WhatsApp number in user_profiles
SELECT 
    '1. WhatsApp Number Check' as check_name,
    id,
    whatsapp_number,
    CASE 
        WHEN whatsapp_number IS NULL THEN '❌ No WhatsApp number set'
        ELSE '✅ WhatsApp number configured'
    END as status
FROM user_profiles
WHERE id = (SELECT id FROM auth.users WHERE email = 'umairarshad6697@gmail.com');

-- 2. Check active subscriptions
SELECT 
    '2. Active Subscriptions' as check_name,
    id,
    service_name,
    next_payment_date,
    reminder_days_before,
    reminder_time,
    bank_id,
    last_reminder_sent,
    CASE 
        WHEN status = 'active' THEN '✅ Active'
        ELSE '❌ Not active'
    END as status
FROM subscriptions
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'umairarshad6697@gmail.com')
ORDER BY next_payment_date;

-- 3. Check if banks exist
SELECT 
    '3. Banks Available' as check_name,
    COUNT(*) as total_banks,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Banks available'
        ELSE '❌ No banks'
    END as status
FROM banks;

-- 4. Check if subscription has bank_id
SELECT 
    '4. Subscription Bank Check' as check_name,
    s.service_name,
    s.bank_id,
    b.name as bank_name,
    CASE 
        WHEN s.bank_id IS NULL THEN '⚠️ No bank selected'
        WHEN b.name IS NOT NULL THEN '✅ Bank configured'
        ELSE '❌ Invalid bank_id'
    END as status
FROM subscriptions s
LEFT JOIN banks b ON b.id = s.bank_id
WHERE s.user_id = (SELECT id FROM auth.users WHERE email = 'umairarshad6697@gmail.com');

-- 5. Check reminder timing
SELECT 
    '5. Reminder Timing Check' as check_name,
    service_name,
    next_payment_date,
    reminder_days_before,
    next_payment_date - INTERVAL '1 day' * reminder_days_before as reminder_date,
    reminder_time,
    CASE 
        WHEN (next_payment_date - INTERVAL '1 day' * reminder_days_before)::date = CURRENT_DATE 
        THEN '✅ Reminder due TODAY'
        WHEN (next_payment_date - INTERVAL '1 day' * reminder_days_before)::date > CURRENT_DATE 
        THEN '⏰ Reminder in future'
        ELSE '❌ Reminder date passed'
    END as timing_status
FROM subscriptions
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'umairarshad6697@gmail.com')
AND status = 'active';

-- 6. Check Edge Function secrets (you need to check this in Supabase Dashboard)
SELECT 
    '6. Edge Function Secrets' as check_name,
    '⚠️ Check Supabase Dashboard → Edge Functions → send-reminders → Secrets' as instruction,
    'Verify: META_WHATSAPP_ACCESS_TOKEN and META_PHONE_NUMBER_ID are set' as required_secrets;
