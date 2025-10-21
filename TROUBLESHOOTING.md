# Troubleshooting Guide - Pakistan Timezone

Common issues and their solutions.

---

## Issue 1: No WhatsApp Reminder Received

### Symptoms
- Subscription created
- Time passed
- No WhatsApp message

### Diagnostic Steps

**Step 1: Check if cron is running**

```sql
SELECT 
  status,
  return_message,
  start_time AT TIME ZONE 'Asia/Karachi' as time_pakistan
FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 5;
```

Expected: New rows every minute with status = 'succeeded'

**Step 2: Check Edge Function logs**

1. Dashboard → Edge Functions → send-reminders → **Logs**
2. Look for recent entries
3. Check for error messages

**Step 3: Manually invoke Edge Function**

1. Dashboard → Edge Functions → send-reminders
2. Click **"Invoke"** button
3. Check response

**Step 4: Verify time matching**

```sql
SELECT 
  s.service_name,
  TO_CHAR(s.reminder_time, 'HH24:MI:SS') as reminder_time,
  TO_CHAR((NOW() AT TIME ZONE 'Asia/Karachi'), 'HH24:MI:SS') as current_pakistan_time,
  CASE 
    WHEN TO_CHAR(s.reminder_time, 'HH24:MI') = TO_CHAR((NOW() AT TIME ZONE 'Asia/Karachi'), 'HH24:MI')
    THEN '✅ TIME MATCH'
    ELSE '❌ NO MATCH'
  END as match_status,
  (s.next_payment_date - (s.reminder_days_before || ' days')::INTERVAL)::DATE as reminder_date,
  CURRENT_DATE as today,
  CASE 
    WHEN (s.next_payment_date - (s.reminder_days_before || ' days')::INTERVAL)::DATE = CURRENT_DATE
    THEN '✅ DATE MATCH'
    ELSE '❌ NO MATCH'
  END as date_match
FROM subscriptions s
WHERE s.status = 'active'
  AND s.service_name LIKE 'Test %'
ORDER BY s.created_at DESC;
```

**Step 5: Check WhatsApp number**

```sql
SELECT 
  up.whatsapp_number,
  CASE 
    WHEN up.whatsapp_number IS NULL THEN '❌ Not set'
    WHEN up.whatsapp_number !~ '^\+\d{10,15}$' THEN '❌ Invalid format'
    ELSE '✅ Valid'
  END as status
FROM user_profiles up
WHERE up.id = (SELECT id FROM auth.users LIMIT 1);
```

**Step 6: Check if already sent today**

```sql
SELECT 
  service_name,
  last_reminder_sent AT TIME ZONE 'Asia/Karachi' as last_sent_pakistan,
  (last_reminder_sent AT TIME ZONE 'Asia/Karachi')::DATE as last_sent_date,
  CURRENT_DATE as today,
  CASE 
    WHEN (last_reminder_sent AT TIME ZONE 'Asia/Karachi')::DATE = CURRENT_DATE
    THEN '⚠️ Already sent today'
    ELSE '✅ Can send'
  END as can_send
FROM subscriptions
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 5;
```

### Solutions

**Solution 1: Reset last_reminder_sent**

```sql
UPDATE subscriptions 
SET last_reminder_sent = NULL 
WHERE service_name LIKE 'Test %';
```

**Solution 2: Update reminder time to current time + 1 minute**

```sql
UPDATE subscriptions 
SET 
  reminder_time = (
    (NOW() AT TIME ZONE 'Asia/Karachi') + INTERVAL '1 minute'
  )::TIME,
  last_reminder_sent = NULL
WHERE service_name LIKE 'Test %';
```

**Solution 3: Set WhatsApp number**

```sql
UPDATE user_profiles 
SET whatsapp_number = '+923001234567'
WHERE id = (SELECT id FROM auth.users LIMIT 1);
```

---

## Issue 2: Cron Job Not Running

### Symptoms
- No entries in `cron.job_run_details`
- No Edge Function logs

### Diagnostic Steps

**Check if cron job exists:**

```sql
SELECT * FROM cron.job WHERE jobname = 'send-subscription-reminders';
```

Expected: 1 row with active = true

**Check if extensions are enabled:**

```sql
SELECT extname FROM pg_extension WHERE extname IN ('pg_cron', 'http');
```

Expected: Both pg_cron and http

### Solutions

**Solution 1: Recreate cron job**

1. Run `supabase/setup_cron_job.sql`
2. Replace YOUR_PROJECT_ID and YOUR_SERVICE_ROLE_KEY
3. Execute in SQL Editor

**Solution 2: Enable extensions manually**

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS http;
```

**Solution 3: Use Dashboard method**

Dashboard → Database → Cron Jobs → Create new cron job

---

## Issue 3: Time Mismatch

### Symptoms
- Logs show wrong time
- Reminders sent at wrong time

### Diagnostic Steps

**Check current times:**

```sql
SELECT 
  NOW() as utc_time,
  (NOW() AT TIME ZONE 'Asia/Karachi') as pakistan_time,
  EXTRACT(HOUR FROM (NOW() AT TIME ZONE 'Asia/Karachi')) as pakistan_hour,
  EXTRACT(MINUTE FROM (NOW() AT TIME ZONE 'Asia/Karachi')) as pakistan_minute;
```

**Check subscription reminder time:**

```sql
SELECT 
  service_name,
  reminder_time,
  EXTRACT(HOUR FROM reminder_time) as reminder_hour,
  EXTRACT(MINUTE FROM reminder_time) as reminder_minute
FROM subscriptions
WHERE status = 'active';
```

### Solutions

**Always use Pakistan time when setting reminders:**

When creating subscription in frontend, the time you enter should be Pakistan time (your local time).

The Edge Function automatically handles the conversion.

---

## Issue 4: Invalid WhatsApp Number Format

### Symptoms
- Error: "Invalid WhatsApp number"
- Reminders skipped

### Diagnostic Steps

```sql
SELECT 
  whatsapp_number,
  CASE 
    WHEN whatsapp_number ~ '^\+\d{10,15}$' THEN '✅ Valid'
    ELSE '❌ Invalid: ' || 
      CASE 
        WHEN whatsapp_number IS NULL THEN 'NULL'
        WHEN whatsapp_number !~ '^\+' THEN 'Missing +'
        WHEN whatsapp_number ~ '[^\+\d]' THEN 'Contains non-digits'
        WHEN LENGTH(REGEXP_REPLACE(whatsapp_number, '[^\d]', '', 'g')) < 10 THEN 'Too short'
        WHEN LENGTH(REGEXP_REPLACE(whatsapp_number, '[^\d]', '', 'g')) > 15 THEN 'Too long'
        ELSE 'Unknown issue'
      END
  END as validation
FROM user_profiles;
```

### Solution

**Correct format:** `+923001234567`

```sql
UPDATE user_profiles 
SET whatsapp_number = '+923001234567'
WHERE id = (SELECT id FROM auth.users LIMIT 1);
```

**Rules:**
- ✅ Must start with `+`
- ✅ Country code: `92` (Pakistan)
- ✅ Mobile number: 10 digits
- ❌ No spaces
- ❌ No dashes
- ❌ No brackets

---

## Issue 5: Edge Function Deployment Failed

### Symptoms
- Error during `supabase functions deploy`
- "Function not found" in dashboard

### Diagnostic Steps

**Check Supabase CLI is logged in:**

```powershell
supabase projects list
```

**Check project is linked:**

```powershell
supabase status
```

### Solutions

**Solution 1: Re-login**

```powershell
supabase logout
supabase login
```

**Solution 2: Re-link project**

```powershell
supabase link --project-ref YOUR_PROJECT_REF
```

**Solution 3: Redeploy**

```powershell
supabase functions deploy send-reminders --no-verify-jwt
```

**Solution 4: Check function files exist**

Verify these files exist:
- `supabase/functions/send-reminders/index.ts`
- `supabase/functions/send-reminders/config.json`

---

## Issue 6: Meta WhatsApp API Error

### Symptoms
- Error in Edge Function logs
- "Failed to send WhatsApp message"
- HTTP 400/401/403 errors

### Diagnostic Steps

**Check secrets are set:**

```powershell
supabase secrets list
```

Expected:
- META_WHATSAPP_ACCESS_TOKEN
- META_PHONE_NUMBER_ID

**Test WhatsApp API directly:**

Use the **Test** button in subscription card (bell icon) - this tests the API immediately.

### Solutions

**Solution 1: Verify Meta credentials**

1. Go to Meta Business Suite
2. Check WhatsApp API setup
3. Verify access token is valid
4. Verify phone number ID is correct

**Solution 2: Reset secrets**

```powershell
supabase secrets set META_WHATSAPP_ACCESS_TOKEN=your_new_token
supabase secrets set META_PHONE_NUMBER_ID=your_phone_id
```

**Solution 3: Check phone number format in Meta**

The WhatsApp number must be registered with Meta WhatsApp Business API.

---

## Issue 7: Duplicate Reminders

### Symptoms
- Receiving same reminder multiple times
- Multiple notification records

### Diagnostic Steps

```sql
SELECT 
  subscription_id,
  service_name,
  COUNT(*) as reminder_count,
  STRING_AGG(TO_CHAR(sent_at AT TIME ZONE 'Asia/Karachi', 'HH24:MI:SS'), ', ') as sent_times
FROM notifications
WHERE type = 'whatsapp_reminder'
  AND sent_at::DATE = CURRENT_DATE
GROUP BY subscription_id, service_name
HAVING COUNT(*) > 1;
```

### Solutions

**System prevents duplicates via `last_reminder_sent`**

If you're getting duplicates:

**Solution 1: Check cron job**

Make sure only ONE cron job is running:

```sql
SELECT jobid, jobname, active 
FROM cron.job 
WHERE command LIKE '%send-reminders%';
```

If multiple exist, delete extras:

```sql
SELECT cron.unschedule('old-job-name');
```

**Solution 2: Verify Edge Function logic**

Check Edge Function logs for duplicate prevention messages.

---

## Issue 8: Test Button Not Working

### Symptoms
- Click test button in subscription card
- No WhatsApp message received

### Diagnostic Steps

**Check browser console:**

1. Open browser DevTools (F12)
2. Go to Console tab
3. Click test button
4. Look for errors

**Check API endpoint:**

```powershell
curl -X POST http://localhost:3000/api/test-reminder \
  -H "Content-Type: application/json"
```

### Solutions

**Solution 1: Check frontend endpoint**

File: `src/app/api/test-reminder/route.ts` should exist

**Solution 2: Restart dev server**

```powershell
# Stop server (Ctrl+C)
npm run dev
```

**Solution 3: Check WhatsApp number in settings**

Go to Settings page and verify your WhatsApp number is saved.

---

## Issue 9: Database Connection Error

### Symptoms
- "Failed to fetch subscriptions"
- "Connection refused"
- RLS errors

### Diagnostic Steps

**Check environment variables:**

```powershell
# In PowerShell
Get-Content .env.local
```

Verify:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

**Check Supabase project status:**

Dashboard → Settings → General → Status

### Solutions

**Solution 1: Verify .env.local**

Copy from .env.example and fill in your actual values.

**Solution 2: Restart dev server**

Changes to .env.local require restart:

```powershell
# Stop and restart
npm run dev
```

**Solution 3: Check RLS policies**

Run the complete schema again to ensure RLS policies are set.

---

## Issue 10: Subscription Not Showing

### Symptoms
- Created subscription
- Not visible in list

### Diagnostic Steps

**Check database directly:**

```sql
SELECT * FROM subscriptions 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'your@email.com')
ORDER BY created_at DESC;
```

**Check RLS policies:**

```sql
SELECT * FROM pg_policies WHERE tablename = 'subscriptions';
```

### Solutions

**Solution 1: Check authentication**

Make sure you're logged in with the same user who created the subscription.

**Solution 2: Refresh the page**

Sometimes React state needs to be refreshed.

**Solution 3: Check status filter**

Make sure status is 'active' and not filtered out.

---

## Useful Debug Queries

### Complete System Status

```sql
-- Run monitor dashboard
\i supabase/monitor_dashboard.sql
```

### Reset Everything for Testing

```sql
-- Delete all test subscriptions
DELETE FROM subscriptions WHERE service_name LIKE 'Test %';

-- Reset all last_reminder_sent
UPDATE subscriptions SET last_reminder_sent = NULL;

-- Delete all notifications
DELETE FROM notifications;
```

### Create Perfect Test Subscription

```sql
-- Creates subscription for 1 minute from now
DO $$
DECLARE
  v_user_id UUID;
  v_pakistan_time TIMESTAMP;
BEGIN
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  v_pakistan_time := (NOW() AT TIME ZONE 'Asia/Karachi') + INTERVAL '1 minute';
  
  INSERT INTO subscriptions (
    user_id, service_name, cost, currency, billing_cycle,
    next_payment_date, start_date, status,
    reminder_days_before, reminder_time, last_reminder_sent
  ) VALUES (
    v_user_id,
    'Perfect Test ' || TO_CHAR(v_pakistan_time, 'HH24:MI'),
    100, 'PKR', 'monthly',
    CURRENT_DATE, CURRENT_DATE, 'active',
    0, v_pakistan_time::TIME, NULL
  );
  
  RAISE NOTICE '✅ Test subscription created for: %', TO_CHAR(v_pakistan_time, 'HH24:MI:SS');
END $$;
```

---

## Getting Help

If none of these solutions work:

1. **Check Edge Function logs** (most important)
2. **Run monitor_dashboard.sql** for complete status
3. **Check cron execution history**
4. **Verify all environment variables are set**
5. **Test manual API call** using Test button

**Still stuck?**

Run this comprehensive diagnostic:

```sql
-- Save output and review
\i supabase/monitor_dashboard.sql
```

Then check:
- ❌ Red X icons = problems to fix
- ⚠️ Warning triangles = potential issues
- ✅ Green checks = working correctly

---

## Prevention Tips

1. **Always use Pakistan time** when setting reminder times
2. **Test with Test button** before relying on cron
3. **Monitor cron execution** regularly
4. **Check Edge Function logs** after deployment
5. **Verify WhatsApp format** before saving
6. **Use monitoring dashboard** to catch issues early

---

## Quick Reference Commands

```sql
-- Check time
SELECT (NOW() AT TIME ZONE 'Asia/Karachi')::TIMESTAMP;

-- Reset test
UPDATE subscriptions SET last_reminder_sent = NULL WHERE service_name LIKE 'Test %';

-- Check cron
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 3;

-- Monitor
\i supabase/monitor_dashboard.sql
```

---

**Remember:** Database stores UTC, Edge Function converts to Pakistan time, comparison happens in Pakistan timezone. Everything is designed to work correctly with Pakistan time!
